// src/llm/hello.js
// Stage 0: Pick the job, and make a model answer you.
// Hits OpenRouter via the official `openai` SDK (v7.x) and prints "ready".

import "dotenv/config";
import OpenAI from "openai";

const { LLM_BASE_URL, LLM_API_KEY, LLM_MODEL } = process.env;

// --- 1. Fail fast on missing config -----------------------------------
const missing = [];
if (!LLM_BASE_URL) missing.push("LLM_BASE_URL");
if (!LLM_API_KEY) missing.push("LLM_API_KEY");
if (!LLM_MODEL) missing.push("LLM_MODEL");
if (missing.length) {
  console.error(`Missing required .env vars: ${missing.join(", ")}`);
  process.exitCode = 1;
} 

// --- 1b. Diagnostic: prove what actually loaded, without leaking the key ---
// "Missing Authentication header" from OpenRouter almost always means the
// Authorization header was sent empty -- i.e. LLM_API_KEY loaded as "" or
// with hidden whitespace/newline characters, even if LLM_BASE_URL loaded fine.
function maskKey(key) {
  if (!key) return "(empty or undefined)";
  const trimmed = key.trim();
  if (trimmed.length !== key.length) {
    return `"${trimmed.slice(0, 8)}...${trimmed.slice(-4)}" (WARNING: had leading/trailing whitespace!)`;
  }
  return `"${trimmed.slice(0, 8)}...${trimmed.slice(-4)}" (length ${trimmed.length})`;
}

if (!process.exitCode) {
  console.log(`Using base URL: ${LLM_BASE_URL}`);
  console.log(`Using model:    ${LLM_MODEL}`);
  console.log(`Using API key:  ${maskKey(LLM_API_KEY)}`);
}

// --- 2. Normalize base URL ----------------------------------------------
function normalizeBaseUrl(url) {
  let u = url.trim().replace(/\/+$/, "");
  if (!/\/api\/v1$/.test(u)) {
    u = u.replace(/\/api$/, "");
    u = `${u}/api/v1`;
  }
  return u;
}

async function main() {
  if (process.exitCode) return; // bail cleanly if config was missing

  const baseURL = normalizeBaseUrl(LLM_BASE_URL);
  const apiKey = LLM_API_KEY.trim(); // <-- guards against the exact bug above

  if (!apiKey) {
    console.error("LLM_API_KEY is set in .env but resolves to an empty string after trimming.");
    console.error("Open .env and retype the key on its own line, e.g.:");
    console.error('  LLM_API_KEY="sk-or-v1-...."');
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost",
      "X-Title": "flyrank-crud-api",
    },
  });

  let res;
  try {
    res = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: "user", content: "Say the single word: ready" }],
      max_tokens: 100,
    });
  } catch (err) {
    console.error("Request to LLM failed.");
    if (err.status) console.error(`HTTP status: ${err.status}`);
    if (err.message) console.error(`Message: ${err.message}`);
    if (err.error) console.error("Details:", JSON.stringify(err.error, null, 2));
    process.exitCode = 1;
    return;
  }

  const choice = res?.choices?.[0];
  if (!choice) {
    console.error("LLM responded, but with no choices. Full response:");
    console.error(JSON.stringify(res, null, 2));
    process.exitCode = 1;
    return;
  }

  const text = choice.message?.content?.trim();
  if (!text) {
    console.error("LLM responded, but the message content was empty.");
    console.error(JSON.stringify(choice, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log("Model replied:", text);
  console.log("ready");
}

main();