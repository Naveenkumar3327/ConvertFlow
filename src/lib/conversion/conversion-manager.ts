import mongoose from "mongoose";
import { getGridFSStream, uploadBufferToGridFS } from "../gridfs/service";
import File from "@/models/File";
import ConversionJob from "@/models/ConversionJob";
import Notification from "@/models/Notification";
import { convertImage } from "./image-converter";
import { rotatePDF, mergePDFs, splitPDF, protectPDF } from "./pdf-converter";
import { convertSheet } from "./sheet-converter";
import { convertDocument } from "./document-converter";
import { convertWithCLI } from "./cli-converter";
import { Readable } from "stream";

// Helper to convert NodeJS Readable Stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// Orchestrate the full conversion flow
export async function executeConversion(
  jobId: string | mongoose.Types.ObjectId
): Promise<void> {
  const job = await ConversionJob.findById(jobId);
  if (!job) {
    throw new Error("Conversion job not found");
  }

  const fileDoc = await File.findById(job.fileId);
  if (!fileDoc) {
    job.status = "failed";
    job.errorMessage = "Associated file metadata not found";
    await job.save();
    return;
  }

  // Update statuses to Processing
  job.status = "processing";
  job.progress = 20;
  job.startedAt = new Date();
  await job.save();

  fileDoc.conversionStatus = "processing";
  fileDoc.conversionProgress = 20;
  await fileDoc.save();

  try {
    // 1. Download original file data from GridFS to buffer
    const downloadStream = await getGridFSStream("originalFiles", fileDoc.originalGridFSFileId);
    const inputBuffer = await streamToBuffer(downloadStream);

    job.progress = 40;
    await job.save();

    let outputBuffer: Buffer;
    let outputMimeType: string;

    const sourceFmt = fileDoc.originalFormat.toLowerCase();
    const targetFmt = fileDoc.outputFormat.toLowerCase();
    const category = fileDoc.fileCategory;

    // 2. Select appropriate engine
    if (category === "image" && ["png", "jpg", "jpeg", "webp"].includes(targetFmt)) {
      job.conversionEngine = "sharp";
      const result = await convertImage(inputBuffer, targetFmt, {
        quality: 85,
      });
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    } else if (category === "pdf" && targetFmt === "pdf") {
      // PDF manipulation (e.g., rotate page)
      job.conversionEngine = "pdf-lib";
      outputBuffer = await rotatePDF(inputBuffer, 90); // default rotate by 90
      outputMimeType = "application/pdf";
    } else if (sourceFmt === "pdf" && ["docx", "txt", "png", "jpg"].includes(targetFmt)) {
      // PDF export/extract requires LibreOffice or pdf2image (CLI)
      job.conversionEngine = "libreoffice";
      const result = await convertWithCLI(inputBuffer, sourceFmt, targetFmt);
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    } else if (["xls", "xlsx", "csv"].includes(sourceFmt) && ["xls", "xlsx", "csv"].includes(targetFmt)) {
      job.conversionEngine = "xlsx";
      const result = await convertSheet(inputBuffer, targetFmt);
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    } else if (sourceFmt === "docx" && targetFmt === "txt") {
      job.conversionEngine = "mammoth";
      const result = await convertDocument(inputBuffer, sourceFmt, targetFmt);
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    } else if (sourceFmt === "md" && ["html", "pdf"].includes(targetFmt)) {
      job.conversionEngine = "pdf-lib";
      const result = await convertDocument(inputBuffer, sourceFmt, targetFmt);
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    } else {
      // Fallback for audio/video (FFmpeg) or office docs (LibreOffice)
      job.conversionEngine = "cli-fallbacks";
      const result = await convertWithCLI(inputBuffer, sourceFmt, targetFmt);
      outputBuffer = result.buffer;
      outputMimeType = result.mimeType;
    }

    job.progress = 75;
    await job.save();

    // 3. Save converted buffer to convertedFiles GridFS bucket
    const outputFilename = `converted_${fileDoc.displayFileName.substring(
      0,
      fileDoc.displayFileName.lastIndexOf(".")
    )}.${targetFmt}`;

    const convertedGridFSId = await uploadBufferToGridFS(
      "convertedFiles",
      outputBuffer,
      outputFilename,
      outputMimeType
    );

    // 4. Optionally generate preview and save to previewFiles
    let previewGridFSId: mongoose.Types.ObjectId | undefined;
    if (["png", "jpg", "jpeg", "webp"].includes(targetFmt)) {
      // Create quick thumbnail preview (resize to 350px width)
      try {
        const previewRes = await convertImage(outputBuffer, "png", { width: 350, quality: 75 });
        previewGridFSId = await uploadBufferToGridFS(
          "previewFiles",
          previewRes.buffer,
          `preview_${outputFilename}.png`,
          "image/png"
        );
      } catch {
        // Fallback: save raw output if thumbnail fails
        previewGridFSId = await uploadBufferToGridFS(
          "previewFiles",
          outputBuffer,
          `preview_${outputFilename}`,
          outputMimeType
        );
      }
    }

    // 5. Update File record
    fileDoc.convertedGridFSFileId = convertedGridFSId;
    if (previewGridFSId) {
      fileDoc.previewGridFSFileId = previewGridFSId;
    }
    fileDoc.convertedFileSize = outputBuffer.length;
    fileDoc.convertedMimeType = outputMimeType;
    fileDoc.conversionStatus = "completed";
    fileDoc.conversionProgress = 100;
    fileDoc.convertedAt = new Date();
    await fileDoc.save();

    // 6. Update User Storage limit accounting
    if (fileDoc.userId) {
      const user = await mongoose.model("User").findById(fileDoc.userId);
      if (user) {
        user.storageUsed += outputBuffer.length;
        await user.save();
      }
    }

    // 7. Complete job record
    job.status = "completed";
    job.progress = 100;
    job.completedAt = new Date();
    if (job.startedAt) {
      job.processingDuration = (job.completedAt.getTime() - job.startedAt.getTime()) / 1000;
    }
    await job.save();

    // 8. Create Notification for authenticated users
    if (fileDoc.userId) {
      await Notification.create({
        userId: fileDoc.userId,
        title: "Conversion Complete",
        message: `Your file "${fileDoc.displayFileName}" was successfully converted to ${targetFmt.toUpperCase()}.`,
        type: "success",
        fileId: fileDoc._id,
      });
    }
  } catch (error: any) {
    console.error("Conversion execution error:", error);

    // Rollback file status to failed
    fileDoc.conversionStatus = "failed";
    fileDoc.conversionProgress = 0;
    await fileDoc.save();

    job.status = "failed";
    job.errorMessage = error.message || "An unexpected error occurred during execution";
    job.progress = 0;
    await job.save();

    // Create Failure Notification for authenticated users
    if (fileDoc.userId) {
      await Notification.create({
        userId: fileDoc.userId,
        title: "Conversion Failed",
        message: `Conversion failed for "${fileDoc.displayFileName}". Error: ${
          error.message || "Unknown error"
        }`,
        type: "error",
        fileId: fileDoc._id,
      });
    }
  }
}
