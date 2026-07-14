import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

// Path for temp files inside workspace
const TEMP_DIR = path.join(process.cwd(), "temp_conversions");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Verify if a command exists on the machine
async function checkCommand(cmd: string): Promise<boolean> {
  try {
    const checkCmd = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
    await execPromise(checkCmd);
    return true;
  } catch {
    return false;
  }
}

export async function convertWithCLI(
  inputBuffer: Buffer,
  sourceFormat: string,
  targetFormat: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const source = sourceFormat.toLowerCase();
  const target = targetFormat.toLowerCase();

  const tempInputName = `input_${Date.now()}.${source}`;
  const tempInputPath = path.join(TEMP_DIR, tempInputName);
  
  // Write buffer to temporary file
  fs.writeFileSync(tempInputPath, inputBuffer);

  try {
    // 1. Audio and Video conversions (FFmpeg)
    if (
      ["mp3", "wav", "m4a", "aac", "ogg", "mp4", "avi", "mov", "mkv", "webm"].includes(source) ||
      ["mp3", "wav", "ogg", "mp4", "avi", "mov", "webm"].includes(target)
    ) {
      const ffmpegExists = await checkCommand("ffmpeg");
      if (!ffmpegExists) {
        throw new Error(
          "FFmpeg CLI utility not found on the system. Please download FFmpeg and add it to your system PATH to convert audio/video files."
        );
      }

      const tempOutputName = `output_${Date.now()}.${target}`;
      const tempOutputPath = path.join(TEMP_DIR, tempOutputName);

      // FFmpeg Conversion command
      const cmd = `ffmpeg -y -i "${tempInputPath}" "${tempOutputPath}"`;
      await execPromise(cmd);

      const outputBuffer = fs.readFileSync(tempOutputPath);
      
      // Clean up temp output file
      if (fs.existsSync(tempOutputPath)) {
        fs.unlinkSync(tempOutputPath);
      }

      const getAudioVideoMime = (t: string) => {
        if (t === "mp3") return "audio/mpeg";
        if (t === "wav") return "audio/wav";
        if (t === "ogg") return "audio/ogg";
        if (t === "mp4") return "video/mp4";
        if (t === "webm") return "video/webm";
        return "application/octet-stream";
      };

      return {
        buffer: outputBuffer,
        mimeType: getAudioVideoMime(target),
      };
    }

    // 2. Office files to PDF (LibreOffice)
    if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(source) && target === "pdf") {
      const sofficeExists = await checkCommand("soffice");
      if (!sofficeExists) {
        throw new Error(
          "LibreOffice Headless (soffice) not found on the system. Please install LibreOffice and add it to your system PATH to convert Office files to PDF."
        );
      }

      // LibreOffice conversion command (outputs to same directory)
      const cmd = `soffice --headless --convert-to pdf --outdir "${TEMP_DIR}" "${tempInputPath}"`;
      await execPromise(cmd);

      // LibreOffice generates input_xxx.pdf
      const generatedPdfName = tempInputName.replace(`.${source}`, ".pdf");
      const generatedPdfPath = path.join(TEMP_DIR, generatedPdfName);

      if (!fs.existsSync(generatedPdfPath)) {
        throw new Error("LibreOffice failed to generate PDF output");
      }

      const outputBuffer = fs.readFileSync(generatedPdfPath);
      
      // Clean up generated PDF file
      fs.unlinkSync(generatedPdfPath);

      return {
        buffer: outputBuffer,
        mimeType: "application/pdf",
      };
    }

    // 3. Document / Text markup via Pandoc
    if (source === "md" && ["docx", "rtf"].includes(target)) {
      const pandocExists = await checkCommand("pandoc");
      if (!pandocExists) {
        throw new Error(
          "Pandoc utility not found on the system. Please download Pandoc and add it to your system PATH to execute document format conversions."
        );
      }

      const tempOutputName = `output_${Date.now()}.${target}`;
      const tempOutputPath = path.join(TEMP_DIR, tempOutputName);

      const cmd = `pandoc -f markdown -t ${target === "docx" ? "docx" : "rtf"} "${tempInputPath}" -o "${tempOutputPath}"`;
      await execPromise(cmd);

      const outputBuffer = fs.readFileSync(tempOutputPath);
      fs.unlinkSync(tempOutputPath);

      return {
        buffer: outputBuffer,
        mimeType: target === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/rtf",
      };
    }

    throw new Error(`Unsupported CLI conversion path: ${sourceFormat} to ${targetFormat}`);
  } catch (err: any) {
    console.error("CLI conversion error:", err);
    throw err;
  } finally {
    // Crucial: Clean up temporary input file in all circumstances
    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }
  }
}
