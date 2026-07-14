import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export function markdownToHtmlString(md: string): string {
  let html = md;
  // Basic escaping
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code blocks
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Paragraphs
  const paragraphs = html.split("\n\n");
  const parsedParagraphs = paragraphs.map((p) => {
    if (p.trim().startsWith("<h") || p.trim().startsWith("<code")) {
      return p;
    }
    return `<p>${p.replace(/\n/g, "<br />")}</p>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ConvertFlow Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; }
    h2 { font-size: 1.5em; margin-top: 24px; }
    p { margin-bottom: 16px; }
    code { background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  ${parsedParagraphs.join("\n")}
</body>
</html>`;
}

export async function convertDocument(
  inputBuffer: Buffer,
  sourceFormat: string,
  targetFormat: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const source = sourceFormat.toLowerCase();
  const target = targetFormat.toLowerCase();

  // DOCX -> TXT
  if (source === "docx" && target === "txt") {
    const result = await mammoth.extractRawText({ buffer: inputBuffer });
    const text = result.value;
    return {
      buffer: Buffer.from(text, "utf-8"),
      mimeType: "text/plain",
    };
  }

  // Markdown -> HTML
  if (source === "md" && target === "html") {
    const mdString = inputBuffer.toString("utf-8");
    const htmlString = markdownToHtmlString(mdString);
    return {
      buffer: Buffer.from(htmlString, "utf-8"),
      mimeType: "text/html",
    };
  }

  // Markdown -> PDF (using pdf-lib to write pages)
  if (source === "md" && target === "pdf") {
    const mdString = inputBuffer.toString("utf-8");
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let currentY = height - margin;

    // Split text by lines and wrap
    const lines = mdString.split("\n");
    
    for (let line of lines) {
      if (currentY < margin + 20) {
        // Add new page if Y cursor goes past margin
        page = pdfDoc.addPage();
        currentY = height - margin;
      }
      
      const cleanLine = line.replace(/[*#`]/g, "").trim(); // strip MD tokens for basic PDF render
      if (cleanLine.length === 0) {
        currentY -= 15;
        continue;
      }

      page.drawText(cleanLine, {
        x: margin,
        y: currentY,
        size: line.startsWith("#") ? 16 : 10,
        font: font,
        color: rgb(0.12, 0.16, 0.23), // slate color
      });
      
      currentY -= line.startsWith("#") ? 25 : 16;
    }

    const savedBytes = await pdfDoc.save();
    return {
      buffer: Buffer.from(savedBytes),
      mimeType: "application/pdf",
    };
  }

  throw new Error(`Unsupported document conversion: ${sourceFormat} to ${targetFormat}`);
}
