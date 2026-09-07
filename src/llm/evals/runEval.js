const fs = require("fs");
const path = require("path");

// Configuration Parameters
const ENDPOINT_URL = "http://localhost:3000/tickets/classify";
const CASES_PATH = path.join(__dirname, "cases.json");

async function runEvaluation() {
  console.log("📊 Starting Automated AI Benchmark Evaluation...");
  
  // 1. Read the 8 test cases from cases.json
  if (!fs.existsSync(CASES_PATH)) {
    console.error(`❌ Error: Cannot find test cases file at ${CASES_PATH}`);
    process.exit(1);
  }
  
  const testCases = JSON.parse(fs.readFileSync(CASES_PATH, "utf8"));
  let correctMatches = 0;
  
  console.log(`📋 Loaded ${testCases.length} hand-labelled test metrics. Executing runs...\n`);

  // 2. Loop over each test case sequentially
  for (const testCase of testCases) {
    console.log(`🔄 Processing Case #${testCase.id}...`);
    console.log(`📥 Input Text: "${testCase.input}"`);
    
    try {
      // Send a real HTTP POST request directly to our running Express endpoint
      const response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testCase.input })
      });
      
      if (!response.ok) {
        console.log(`❌ Server returned HTTP Error status: ${response.status}`);
        continue;
      }
      
      const resultData = await response.json();
      const aiCategory = resultData.category;
      
      // 3. Compare AI prediction with our expected target answer
      if (aiCategory === testCase.expected_category) {
        console.log(`✅ MATCH! Expected: [${testCase.expected_category}] | AI Got: [${aiCategory}]`);
        correctMatches++;
      } else {
        console.log(`⚠️ MISMATCH! Expected: [${testCase.expected_category}] | AI Got: [${aiCategory}]`);
      }
    } catch (networkError) {
      console.error(`❌ Connection error hitting endpoint server: ${networkError.message}`);
    }
    console.log("------------------------------------------------------------------");
  }

  // 4. Calculate and display final performance metrics
  const accuracyPercentage = ((correctMatches / testCases.length) * 100).toFixed(1);
  console.log("\n================================================================");
  console.log("🏁 EVALUATION BENCHMARK METRICS COMPLETE");
  console.log(`🎯 Total Score: ${correctMatches} / ${testCases.length} Passed`);
  console.log(`📈 Final Accuracy Rating: ${accuracyPercentage}%`);
  console.log("================================================================");
}

runEvaluation();
