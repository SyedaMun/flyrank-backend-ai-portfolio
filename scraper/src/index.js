const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { z } = require("zod"); // Added for Stage 4 Validation

const CACHE_DIR = path.join(__dirname, "..", "cache");
const USER_AGENT = "FlyRank-Backend-AI-Internship-Scraper/1.0";
const START_URL = "https://toscrape.com";

// Added for Stage 4 Storage Output Isolation
const OUTPUT_DIR = path.join(__dirname, "..", "output"); 

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- STAGE 5 NEW TASK: RUN STATISTICAL REPORT METRICS ---
const runMetrics = {
  start_time: new Date().toISOString(),
  end_time: null,
  pages_fetched_from_web: 0,
  pages_loaded_from_cache: 0,
  total_urls_discovered: 0,
  valid_records_stored: 0,
  invalid_records_quarantined: 0,
  failures: []
};

// --- STAGE 4 NEW TASK: DATA CLEANING HELPERS ---
function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  const numericPrice = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(numericPrice) || 0;
}

function cleanStock(stockStr) {
  if (!stockStr) return 0;
  const match = stockStr.match(/\d+/);
  return match ? parseInt(match, 10) : 0;
}

// --- STAGE 4 NEW TASK: MANDATORY ZOD VALIDATION SCHEMA ---
const BookSchema = z.object({
  title: z.string().min(1, "Title cannot be completely blank"),
  product_url: z.string().url("Must be a fully accurate absolute internet URL"),
  price: z.number().positive("Price property item must be a positive decimal float number"),
  stock_count: z.number().int().nonnegative("Stock item count properties must be a valid integer"),
  rating_text: z.string().min(1),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

async function fetchWithCache(url, filename) {
  const cacheFile = path.join(CACHE_DIR, filename);

  if (fs.existsSync(cacheFile)) {
    const html = fs.readFileSync(cacheFile, "utf8");
    console.log(`CACHE HIT: ${filename} bytes = ${html.length}`);
    
    // STAGE 5 METRIC: Count cache read
    runMetrics.pages_loaded_from_cache++;
    
    return html;
  }

  console.log(`FETCH: ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, html, "utf8");

    console.log(`SAVED: ${filename} bytes = ${html.length}`);

    // STAGE 5 METRIC: Count live web download
    runMetrics.pages_fetched_from_web++;

    await sleep(500);

    return html;
  } catch (error) {
    // STAGE 5 METRIC: Record network extraction failures safely
    runMetrics.failures.push({
      target_url: url,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseBookDetails(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);

  const productMain = $(".product_main");

  if (productMain.length === 0) {
    throw new Error("Could not find .product_main");
  }

  const title = productMain.find("h1").text().trim();

  const priceText = productMain
    .find(".price_color")
    .text()
    .trim();

  const availabilityText = productMain
    .find(".instock.availability")
    .text()
    .trim();

  const ratingClasses =
    productMain.find(".star-rating").attr("class") || "";

  const ratingText =
    ratingClasses.replace("star-rating", "").trim() || "None";

  const descHeader = $("#product_description");

  const description = descHeader.length
    ? descHeader.next("p").text().trim() || null
    : null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString()
  };
}

async function discoverBookUrls() {
  const uniqueBookUrls = new Set();
  const sourcePageMap = new Map();

  let currentUrl = START_URL;
  let cataloguePages = 0;
  let discovered = 0;

  while (currentUrl && cataloguePages < 3) {
    cataloguePages++;

    const filename =
      `catalogue-page-${cataloguePages}.html`;

    const html = await fetchWithCache(
      currentUrl,
      filename
    );

    const $ = cheerio.load(html);

    $("article.product_pod h3 a").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) return;

      const absoluteUrl = new URL(
        href,
        currentUrl
      ).href;

      discovered++;

      if (!uniqueBookUrls.has(absoluteUrl)) {
        uniqueBookUrls.add(absoluteUrl);
        sourcePageMap.set(absoluteUrl, currentUrl);
      }
    });

    const nextHref = $(".pager .next a").attr("href");

    currentUrl = nextHref
      ? new URL(nextHref, currentUrl).href
      : null;
  }

  console.log("\n--- Stage 2 Checkpoint ---");
  console.log(`catalogue_pages=${cataloguePages}`);
  console.log(`discovered=${discovered}`);
  console.log(`unique_urls=${uniqueBookUrls.size}`);

  // STAGE 5 METRIC: Record final discovered absolute links
  runMetrics.total_urls_discovered = uniqueBookUrls.size;

  return {
    bookUrls: [...uniqueBookUrls],
    sourcePageMap
  };
}

async function extractRawRecords(bookUrls, sourcePageMap) {
  console.log("\n--- Starting Stage 3 ---");
  console.log(`Processing ${bookUrls.length} books...`);

  const rawRecords = [];

  for (let i = 0; i < bookUrls.length; i++) {
    const bookUrl = bookUrls[i];
    const sourcePage = sourcePageMap.get(bookUrl);

    const bookNumber = i + 1;

    const filename =
      `book-${bookNumber}.html`;

    try {
      const html = await fetchWithCache(
        bookUrl,
        filename
      );

      const record = parseBookDetails(
        html,
        bookUrl,
        sourcePage
      );

      rawRecords.push(record);

      if (
        bookNumber % 10 === 0 ||
        bookNumber === bookUrls.length
      ) {
        console.log(
          `Progress: ${bookNumber}/${bookUrls.length}`
        );
      }
    } catch (error) {
      console.error(
        `FAILED book ${bookNumber}: ${error.message}`
      );
      // STAGE 5 METRIC: Log errors or failed extractions smoothly
      runMetrics.failures.push({
        target_url: bookUrl,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  console.log("\n--- Stage 3 Milestone Checkpoint ---");
  console.log(`detail_pages=${rawRecords.length}`);

  if (rawRecords.length > 0) {
    console.log("\nSample raw record:");
    console.log(
      JSON.stringify(rawRecords[0], null, 2)
    );
  }

  return rawRecords;
}

// --- STAGE 4 NEW TASK: RUN PIPELINE PROCESSING EXTENSION ---
async function runPipeline() {
  const { bookUrls, sourcePageMap } = await discoverBookUrls();
  const rawRecords = await extractRawRecords(bookUrls, sourcePageMap);

  console.log("\n--- Starting Stage 4: Clean, Validate & Store ---");
  
  const validBooks = [];
  const invalidBooks = [];

  for (const rawRecord of rawRecords) {
    const cleanedData = {
      title: rawRecord.title,
      product_url: rawRecord.product_url,
      price: cleanPrice(rawRecord.price_text),
      stock_count: cleanStock(rawRecord.availability_text),
      rating_text: rawRecord.rating_text,
      description: rawRecord.description,
      source_page: rawRecord.source_page,
      fetched_at: rawRecord.fetched_at
    };

    const validationResult = BookSchema.safeParse(cleanedData);

    if (validationResult.success) {
      validBooks.push(validationResult.data);
    } else {
      invalidBooks.push({
        raw: rawRecord,
        errors: validationResult.error.errors
      });
    }
  }

  // Save the structured files to output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, "books.json"), JSON.stringify(validBooks, null, 2), "utf8");
  fs.writeFileSync(path.join(OUTPUT_DIR, "errors.json"), JSON.stringify(invalidBooks, null, 2), "utf8");

  console.log("\n--- Stage 4 Milestone Checkpoint ---");
  console.log(`books.json entries = ${validBooks.length}`);
  console.log(`errors.json entries = ${invalidBooks.length}`);

  // --- STAGE 5 NEW TASK: SAVE SUMMARY METRICS RUN REPORT ---
  runMetrics.end_time = new Date().toISOString();
  runMetrics.valid_records_stored = validBooks.length;
  runMetrics.invalid_records_quarantined = invalidBooks.length;

  fs.writeFileSync(path.join(OUTPUT_DIR, "run-report.json"), JSON.stringify(runMetrics, null, 2), "utf8");

  console.log("\n--- Stage 5 Milestone Checkpoint ---");
  console.log(`Run report successfully saved to: output/run-report.json`);
  console.log(JSON.stringify(runMetrics, null, 2));
}

runPipeline().catch((error) => {
  console.error(`CRITICAL ERROR: ${error.message}`);
  process.exitCode = 1;
});
