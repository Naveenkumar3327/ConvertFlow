import sharp from "sharp";

interface ImageConvertOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export async function convertImage(
  inputBuffer: Buffer,
  outputFormat: string,
  options: ImageConvertOptions = {}
): Promise<{ buffer: Buffer; mimeType: string }> {
  const format = outputFormat.toLowerCase();
  let pipeline = sharp(inputBuffer);

  // Apply optional resizing
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const quality = options.quality || 85;
  let mimeType = "image/jpeg";

  // Select output formats and apply optimizations
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      mimeType = "image/webp";
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: 8 });
      mimeType = "image/png";
      break;
    case "jpg":
    case "jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      mimeType = "image/jpeg";
      break;
    default:
      throw new Error(`Unsupported target image format: ${outputFormat}`);
  }

  const outputBuffer = await pipeline.toBuffer();

  return {
    buffer: outputBuffer,
    mimeType,
  };
}
