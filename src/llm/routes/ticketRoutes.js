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
  timeout: 30000,   // Strict 30s connection ceiling (Stage 4)
  maxRetries: 0,    // We turn off silent library defaults to run our own logic loop
});

/**
 * Helper function to strip markdown code blocks/fences from LLM outputs (Stage 3)
 */
function cleanJsonString(rawText) {
  let cleanText = rawText.trim();
  // Strip opening markdown tags if present (```json or ```)
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/i, "");
  }
  // Strip closing markdown tags if present (```)
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.slice(0, -3);
  }
  return cleanText.trim();
}

// Helper wrapper to execute delay wait loops inside our backoff engine loop (Stage 4)
const delayTime = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/tickets/classify", async (req, res, next) => {
  const startTime = Date.now(); // Track exact process baseline for cost logs
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

    // 2. Fallback LLM Stub Mock Mode (Stage 1 Core Mode)
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

    // ====================================================================
    // STAGE 4: ADMINISTRATIVE KILL SWITCH ROUTING
    // ====================================================================
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

    let response = null;
    let attempts = 0;
    const maxAttempts = 3;
    let currentWaitDelay = 1000; // Starting baseline delay of 1 second

    // ====================================================================
    // STAGE 4: EXPONENTIAL BACKOFF RETRY ENGINE WITH JITTER
    // ====================================================================
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`🤖 [Attempt ${attempts}/${maxAttempts}] Calling model: ${process.env.LLM_MODEL || "openrouter/free"}...`);
        
        response = await client.chat.completions.create({
          model: process.env.LLM_MODEL || "openrouter/free",
          temperature: 0.2,
          messages: chatMessages,
        });

        // Break loop immediately on a successful, clean completion path
        break; 
      } catch (clientError) {
        const networkStatusCode = clientError.status;
        console.warn(`⚠️ Network exception on execution attempt ${attempts}: ${clientError.message}`);

        // STAGE 4 MANDATE: Never retry on 400, 401 (bad credentials), or 403 authorization lockouts.
        if (networkStatusCode === 400 || networkStatusCode === 401 || networkStatusCode === 403) {
          console.error("❌ Unrecoverable interaction exception. Aborting retry engine immediately.");
          return res.status(networkStatusCode || 500).json({
            error: "Authentication/Client Error",
            message: "Unrecoverable platform interaction exception.",
            details: clientError.message
          });
        }

        if (attempts >= maxAttempts) {
          console.error("❌ Maximum configured backoff limit bounds exhausted.");
          throw clientError; // Pass error down to our final catch block
        }

        // Apply backoff scaling formula with random jitter mitigation (1s, 2s, 4s)
        const randomJitter = Math.random() * 300;
        const totalSleepWindow = currentWaitDelay * Math.pow(2, attempts - 1) + randomJitter;
        console.log(`⏳ Retry engine backing off for ${Math.round(totalSleepWindow)}ms...`);
        await delayTime(totalSleepWindow);
      }
    }

    let rawAiOutput = response.choices[0].message.content;
    let cleanText = cleanJsonString(rawAiOutput);
    let finalJsonObject = null;
    let schemaValidationPassed = false;

    // Stage 3 JSON Schema Verification Routine
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
      
      // Add the mistake and instructions to the message history stack
      chatMessages.push({ role: "assistant", content: rawAiOutput });
      chatMessages.push({
        role: "user",
        content: "Your previous answer was rejected because it failed to parse into valid schema-constrained JSON text. Please review the output rules, fix the structure, and return ONLY a single corrected JSON object matching the requested schema fields."
      });

      // Execute the single corrective repair call
      response = await client.chat.completions.create({
        model: process.env.LLM_MODEL || "openrouter/free",
        temperature: 0.0, // Force strict accuracy for corrections
        messages: chatMessages,
      });

      rawAiOutput = response.choices[0].message.content;
      cleanText = cleanJsonString(rawAiOutput);
      
      try {
        finalJsonObject = JSON.parse(cleanText);
        
        // Final structural check on the repair attempt output
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
        // If it fails a second time, return 422 Unprocessable Entity
        console.error("❌ [Stage 3 Failure] Model could not repair its output format structure.");
        
        // STAGE 3 MANDATE: Write quarantine log on terminal failure
        console.warn(`⚠️ [QUARANTINE LOG] Data isolated due to persistent schema violation. Raw text: "${rawAiOutput}"`);

        return res.status(422).json({
          error: "Unprocessable Entity",
          message: "The AI platform returned data that does not conform to the system configuration schema rules after repair mitigation.",
          rawOutput: rawAiOutput
        });
      }
    }

    // ====================================================================
    // STAGE 4: METRIC OBSERVE COST LOG STRUCT ENGINE
    // ====================================================================
    const durationMs = Date.now() - startTime;
    console.log(
      `📊 [COST LOG] Prompt Version: v1 | Model: ${process.env.LLM_MODEL || "openrouter/free"} | Duration: ${durationMs}ms`
    );
    console.log("✅ Output verified successfully. Dispatching JSON structure payload.");
    return res.status(200).json(finalJsonObject);

  } catch (error) {
    // STAGE 4 MANDATE: Capture explicit client connection timeouts gracefully
    if (error.message && (error.message.includes("timeout") || error.message.includes("timed out"))) {
      console.error("❌ Connection link expired on external network interface layer transaction.");
      return res.status(504).json({ 
        error: "Gateway Timeout", 
        message: "The external model request connection timed out after 30 seconds." 
      });
    }
    console.error("❌ Runtime exception thrown:", error.message);
    next(error);
  }
});

module.exports = router;
