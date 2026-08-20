const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const DATA_FILE = path.join(__dirname, "..", "..", "output", "books.json");
const REPORT_OUTPUT = path.join(__dirname, "..", "..", "output", "reports", "books-summary-report.pdf");

function generatePdfReport() {
  console.log("\n--- Starting Stage 7: PDF Report Generation ---");

  // 1. Verify that our scraped dataset exists
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error("Missing scraped data source! Please run node src/index.js first.");
  }

  const books = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  console.log(`Loaded ${books.length} records for documentation layout filtering...`);

  // 2. Initialize a blank PDF document architecture template
  const doc = new PDFDocument({ margin: 50 });
  fs.mkdirSync(path.dirname(REPORT_OUTPUT), { recursive: true });
  doc.pipe(fs.createWriteStream(REPORT_OUTPUT));

  // 3. Render Header Branding Layout Elements
  doc.fontSize(22).text("Navigant Education Consultants", { align: "center" });
  doc.fontSize(14).text("Scraped Data Analytics Summary Report", { align: "center" });
  doc.moveDown(1);
  doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: "right" });
  doc.text(`Total Records Extracted: ${books.length}`, { align: "right" });
  doc.moveDown(2);

  // 4. Draw horizontal separator line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // 5. Loop through and draw data summaries for the first 5 books as proof
  doc.fontSize(14).text("Sample Collected Items Overview:", { underline: true });
  doc.moveDown(1);

  const sampleCount = Math.min(books.length, 5);
  for (let i = 0; i < sampleCount; i++) {
    const book = books[i];
    doc.fontSize(12).text(`${i + 1}. Title: ${book.title}`, { bold: true });
    doc.fontSize(10).text(`   Price: GBP ${book.price} | Stock Volume: ${book.stock_count} units`);
    doc.text(`   URL: ${book.product_url}`);
    doc.moveDown(0.5);
  }

  // 6. Append institutional footer metadata blocks
  doc.moveDown(3);
  doc.fontSize(9).text("Confidential tracking file generated automatically via FlyRank AI Backend Track Pipeline Platform Framework.", { align: "center", color: "gray" });

  // 7. Finalize and lock the document structure write stream
  doc.end();
  console.log(`SUCCESS: PDF document compiled completely! Saved to: output/reports/books-summary-report.pdf`);
}

try {
  generatePdfReport();
} catch (error) {
  console.error(`PDF GENERATION FAILURE: ${error.message}`);
  process.exitCode = 1;
}
