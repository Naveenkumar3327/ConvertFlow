import XLSX from "xlsx";

export async function convertSheet(
  inputBuffer: Buffer,
  outputFormat: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const format = outputFormat.toLowerCase();

  if (format === "csv") {
    // Excel -> CSV
    const workbook = XLSX.read(inputBuffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert worksheet to CSV string
    const csvString = XLSX.utils.sheet_to_csv(worksheet);
    const outputBuffer = Buffer.from(csvString);

    return {
      buffer: outputBuffer,
      mimeType: "text/csv",
    };
  } else if (format === "xlsx") {
    // CSV -> Excel
    const workbook = XLSX.read(inputBuffer, { type: "buffer" });
    const outputBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return {
      buffer: outputBuffer,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } else {
    throw new Error(`Unsupported spreadsheet target format: ${outputFormat}`);
  }
}
