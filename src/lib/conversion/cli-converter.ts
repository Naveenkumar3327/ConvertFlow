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

    // 2. Office files to PDF OR PDF to Office documents (LibreOffice)
    const isOfficeToPdf = ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(source) && target === "pdf";
    const isPdfToOffice = source === "pdf" && ["docx", "doc", "xlsx", "xls", "pptx", "ppt", "txt"].includes(target);

    if (isOfficeToPdf || isPdfToOffice) {
      const sofficeExists = await checkCommand("soffice");
      if (!sofficeExists) {
        throw new Error(
          "LibreOffice Headless (soffice) not found on the system. Please install LibreOffice and add it to your system PATH to enable Word/Excel/PPT/PDF document conversions."
        );
      }

      // If converting PDF to text, use txt:Text format filter in LibreOffice
      const filter = target === "txt" ? "txt:Text" : target;

      // LibreOffice conversion command (outputs to same directory)
      const cmd = `soffice --headless --convert-to ${filter} --outdir "${TEMP_DIR}" "${tempInputPath}"`;
      await execPromise(cmd);

      // LibreOffice generates input_xxx.<target>
      const generatedFilename = tempInputName.replace(`.${source}`, `.${target}`);
      const generatedFilePath = path.join(TEMP_DIR, generatedFilename);

      if (!fs.existsSync(generatedFilePath)) {
        throw new Error(`LibreOffice failed to generate ${target.toUpperCase()} output`);
      }

      const outputBuffer = fs.readFileSync(generatedFilePath);
      
      // Clean up generated file
      fs.unlinkSync(generatedFilePath);

      const getDocMime = (t: string) => {
        if (t === "pdf") return "application/pdf";
        if (t === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (t === "doc") return "application/msword";
        if (t === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (t === "xls") return "application/vnd.ms-excel";
        if (t === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        if (t === "txt") return "text/plain";
        return "application/octet-stream";
      };

      return {
        buffer: outputBuffer,
        mimeType: getDocMime(target),
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
