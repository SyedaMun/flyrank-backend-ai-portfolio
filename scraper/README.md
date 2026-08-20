# FlyRank Internship · Backend Track · Week 5 · Assignment A9

## Target Classification
- **Target Site:** Books to Scrape — https://books.toscrape.com/
- **Purpose:** Public practice sandbox built for web scraping practice.
- **Scraping Scope:** First 3 catalogue pages, producing 60 unique book URLs.
- **Pagination:** Follow the catalogue's own `next` link to discover pages rather than hardcoding book URLs.
- **Data Fields Collected:** title, product_url, price_text, availability_text, rating_text, description, source_page, fetched_at.
- **Robots.txt Analysis:** Requested https://books.toscrape.com/robots.txt and received a 404 Not Found response. No robots file was found.

I will not reuse this code on another site without checking its rules and terms first.

## Milestone Checkpoints & Evidence Logs

### Stage 1 & Stage 2 Checkpoint
- **Status:** Completed successfully.
- **Behavior:** Dynamic pagination parsed successfully via Cheerio tracking the `.pager .next a` layout selector tree.
- **Metrics Discovered:** 3 catalogue pages crawled, yielding 60 unique absolute product detail URLs.

### Stage 3 & Stage 4 Checkpoint
- **Status:** Completed successfully.
- **Behavior:** Collected individual book pages politely using a 500ms request spacing delay. Normalized text strings using strict regular expressions.
- **Data Isolated:** 60 valid items processed cleanly and saved to `output/books.json`. 0 validation anomalies encountered or stored in `output/errors.json`.

### Stage 5 Checkpoint
- **Status:** Completed successfully.
- **Behavior:** Serialized run analytics metadata cleanly down to disk for continuous pipeline debugging.
- **Operational Metrics Stored:** Stored inside `output/run-report.json`. Logs verify a 100% execution success rate using local cache hits.
