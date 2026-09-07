const { Router } = require("express");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { ticketClassifySchema } = require("../schemas/ticketSchema.js");

const router = Router();

// Universal OpenAI-compatible client wrapper with Stage 4 30-Second Explicit Timeout
const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000, // Strict 30s connection ceiling (Stage 4)
  maxRetries: 0,  // Disable library defaults so we manage our own manual loop
});

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNonRetryable(err) {
  const status = err?.status;
  return status === 400 || status === 401 || status === 403;
}

function isRetryable(err) {
  const status = err?.status;
  if (status === 429) return true;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  if (err instanceof OpenAI.APIConnectionError) return true;
  if (status === undefined && err?.code) return true; // Catch ENOTFOUND / connection drops
  return false;
}

async function callLLMWithRetry(chatMessages, temperature) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🤖 [Attempt ${attempt}/${MAX_ATTEMPTS}] Calling model: ${process.env.LLM_MODEL}...`);
    try {
      const response = await client.chat.completions.create({
        model: process.env.LLM_MODEL || "openrouter/free",
        temperature,
        messages: chatMessages,
      });

      // ====================================================================
      // CLAUDE'S SHAPE GUARD: Intercept non-AI malformed successful responses
      // ====================================================================
      if (!response?.choices?.[0]?.message) {
        const shapeError = new Error(
          "LLM response did not contain the expected 'choices' structure — check LLM_BASE_URL / LLM_MODEL."
        );
        shapeError.status = 502; // Treat it as a bad gateway error to run retries
        throw shapeError;
      }

      return response;
    } catch (err) {
      lastError = err;

      if (isNonRetryable(err)) {
        console.log(`❌ [Attempt ${attempt}/${MAX_ATTEMPTS}] Non-retryable error ${err.status}, aborting.`);
        throw err;
      }

      if (isRetryable(err) && attempt < MAX_ATTEMPTS) {
        const backoffMs = BASE_DELAY_MS * 2 ** (attempt - 1);
        console.log(
          `🔁 [Attempt ${attempt}/${MAX_ATTEMPTS}] Retryable error (${err.status ?? err.code}), backing off ${backoffMs}ms...`
        );
        await sleep(backoffMs);
        continue;
      }

      console.log(`❌ [Attempt ${attempt}/${MAX_ATTEMPTS}] Giving up: ${err.message}`);
      throw err;
    }
  }

  throw lastError;
}

/**
 * Helper function to strip markdown code blocks/fences from LLM outputs (Stage 3)
 */
function cleanJsonString(rawText) {
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/i, "");
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.slice(0, -3);
  }
  return cleanText.trim();
}

router.post("/tickets/classify", async (req, res, next) => {
  const startTime = Date.now(); // Track process baseline for performance cost logs
  try {
    // 1. Run Input Validation via Zod schema (Gate check to avoid burning quota)
    const parseResult = ticketClassifySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Input validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    // 2. Fallback LLM Stub Mock Mode (Stage 1)
    if (process.env.LLM_STUB === "1") {
      console.log("⚡ [LLM_STUB] Mock mode active.");
      return res.status(200).json({
        category: "bug",
        urgency: "high",
        confidence: 0.95,
        reason: "The text explicitly mentions an application crash during a persistent operational database write cycle.",
        _stubbed: true
      });
    }

    // 3. Administrative Kill Switch Gate Routing (Stage 4)
    if (process.env.LLM_ENABLED === "false") {
      console.log("🛑 [KILL SWITCH] LLM_ENABLED flag is false. Diverting to safe deterministic fallback.");
      const textLength = parseResult.data.text.length;
      return res.status(200).json({
        category: "other",
        urgency: "normal",
        confidence: 0.40,
        reason: `Deterministic safety fallback executed via active system kill switch. Evaluated content payload stream size of ${textLength} characters.`,
        _kill_switch_active: true
      });
    }

    // Load the prompt specification file cleanly (Stage 2 File Mount)
    const promptPath = path.join(__dirname, "../prompts/classify-v1.md");
    const systemPrompt = fs.readFileSync(promptPath, "utf8");

    const chatMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: parseResult.data.text }
    ];

    // Call live AI wrapped inside our robust retry handler shell
    let response = await callLLMWithRetry(chatMessages, 0.2);

    let rawAiOutput = response.choices[0].message.content;
    let cleanText = cleanJsonString(rawAiOutput);
    let finalJsonObject = null;
    let schemaValidationPassed = false;

    try {
      finalJsonObject = JSON.parse(cleanText);
      const allowedCategories = ["billing", "bug", "feature", "other"];
      const allowedUrgencies = ["low", "normal", "high"];

      if (
        finalJsonObject &&
        allowedCategories.includes(finalJsonObject.category) &&
        allowedUrgencies.includes(finalJsonObject.urgency) &&
        typeof finalJsonObject.confidence === "number"
      ) {
        schemaValidationPassed = true;
      }
    } catch (parseError) {
      console.warn("⚠️ Attempt 1 returned malformed JSON text. Proceeding to repair loop...");
    }

    // ====================================================================
    // STAGE 3: SELF-HEALING REPAIR RETRY LOOP
    // ====================================================================
    if (!schemaValidationPassed) {
      console.log("🔄 [Repair Loop] Initiating single correction attempt...");

      chatMessages.push({ role: "assistant", content: rawAiOutput });
      chatMessages.push({
        role: "user",
        content: "Your previous answer was rejected because it failed to parse into valid schema-constrained JSON text. Please review the output rules, fix the structure, and return ONLY a single corrected JSON object matching the requested schema fields."
      });

      response = await callLLMWithRetry(chatMessages, 0.0);

      rawAiOutput = response.choices[0].message.content;
      cleanText = cleanJsonString(rawAiOutput);

      try {
        finalJsonObject = JSON.parse(cleanText);
        const allowedCategories = ["billing", "bug", "feature", "other"];
        const allowedUrgencies = ["low", "normal", "high"];

        if (
          !finalJsonObject ||
          !allowedCategories.includes(finalJsonObject.category) ||
          !allowedUrgencies.includes(finalJsonObject.urgency)
        ) {
          throw new Error("Repair output still fails strict enum criteria constraints.");
        }
      } catch (retryParseError) {
        console.error("❌ [Stage 3 Failure] Model could not repair its output format structure.");
        console.warn(`⚠️ [QUARANTINE LOG] Data isolated due to persistent schema violation. Raw text: "${rawAiOutput}"`);

        return res.status(422).json({
          error: "Unprocessable Entity",
          message: "The AI platform returned data that does not conform to the system configuration schema rules after repair mitigation.",
          rawOutput: rawAiOutput
        });
      }
    }

    // ====================================================================
    // STAGE 4: METRIC OBSERVE COST LOG ENGINE
    // ====================================================================
    const durationMs = Date.now() - startTime;
    console.log(
      `📊 [COST LOG] Prompt Version: v1 | Model: ${process.env.LLM_MODEL || "openrouter/free"} | Duration: ${durationMs}ms`
    );

    console.log("✅ Output verified successfully. Dispatching JSON structure payload.");
    return res.status(200).json(finalJsonObject);

  } catch (error) {
    // Separate unclassified operational errors from structured LLM/network failures
    if (isNonRetryable(error)) {
      console.error(`❌ LLM rejected request (${error.status}):`, error.message);
      return res.status(error.status).json({
        error: "LLM Request Rejected",
        status: error.status,
        message: error.message,
      });
    }

    if (isRetryable(error) || error instanceof OpenAI.APIConnectionError || error.status === 502) {
      console.error("❌ Upstream LLM unreachable after retries:", error.message);
      return res.status(504).json({
        error: "Gateway Timeout",
        message: "The external model request connection timed out or encountered a persistent upstream network error.",
        details: error.message
      });
    }

    console.error("❌ Runtime exception thrown:", error.message);
    next(error);
  }
});

module.exports = router;
