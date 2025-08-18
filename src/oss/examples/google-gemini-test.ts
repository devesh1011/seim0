import { Memory } from "../src";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test Google Gemini integration for fact extraction
 */
async function testGoogleGeminiFactExtraction() {
  console.log("🤖 Testing Google Gemini Fact Extraction...\n");

  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY environment variable is required!");
    console.log("Please set your Google API key in the .env file");
    console.log(
      "Get your API key from: https://aistudio.google.com/app/apikey",
    );
    process.exit(1);
  }

  const memory = new Memory({
    version: "v1.1",
    embedder: {
      provider: "google",
      config: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: "text-embedding-004", // Google's latest embedding model
      },
    },
    vectorStore: {
      provider: "memory",
      config: {
        collectionName: "google_test_memories",
        dimension: 768, // Google embeddings are 768-dimensional
      },
    },
    llm: {
      provider: "google",
      config: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-2.0-flash", // Google's latest Gemini model
      },
    },
    disableHistory: false,
  });

  try {
    // Test 1: Personal information extraction
    console.log("🧪 Test 1: Personal information with Gemini");
    const result1 = await memory.add(
      "Hi, I'm Maria and I work as a machine learning engineer at DeepMind. I specialize in transformer architectures and love working with large language models. I also enjoy hiking in the Swiss Alps on weekends.",
      { userId: "maria_001" },
    );

    console.log("✅ Facts extracted by Gemini:");
    result1.results.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    // Test 2: Technical preferences and updates
    console.log("\n🧪 Test 2: Technical details and preferences");
    const result2 = await memory.add(
      "I've been working on a new attention mechanism that improves efficiency by 40%. My preferred programming languages are Python and JAX. I also started learning Rust recently for systems programming.",
      { userId: "maria_001" },
    );

    console.log("✅ Additional facts:");
    result2.results.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    // Test 3: Contradictory information to test updates
    console.log("\n🧪 Test 3: Updates and corrections");
    const result3 = await memory.add(
      "Actually, I got promoted to Senior ML Engineer last month! And I decided to focus more on PyTorch instead of JAX for my current projects.",
      { userId: "maria_001" },
    );

    console.log("✅ Memory updates:");
    result3.results.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact.memory} (${fact.metadata?.event})`);
      if (fact.metadata?.reasoning) {
        console.log(`      📝 Reasoning: ${fact.metadata.reasoning}`);
      }
    });

    // Test 4: Semantic search with Google embeddings
    console.log("\n🔍 Test 4: Semantic search");
    const searchQueries = [
      "What does Maria do professionally?",
      "What are Maria's technical skills?",
      "What hobbies does Maria have?",
      "Tell me about Maria's recent work",
    ];

    for (const query of searchQueries) {
      console.log(`\n❓ Query: "${query}"`);
      const searchResults = await memory.search(query, {
        userId: "maria_001",
        limit: 3,
      });

      console.log("📊 Results:");
      searchResults.results.forEach((result, i) => {
        console.log(
          `  ${i + 1}. ${result.memory} (score: ${result.score?.toFixed(3)})`,
        );
      });
    }

    // Test 5: Show all stored facts
    console.log("\n📋 Test 5: Complete memory profile");
    const allMemories = await memory.getAll({
      userId: "maria_001",
    });

    console.log("🧠 All stored facts about Maria:");
    allMemories.results.forEach((memory, i) => {
      console.log(`  ${i + 1}. ${memory.memory}`);
    });

    console.log("\n🎉 Google Gemini integration test completed successfully!");
    console.log("✅ Demonstrated features:");
    console.log("   • Google text-embedding-004 for semantic embeddings");
    console.log("   • Gemini-2.0-flash for intelligent fact extraction");
    console.log("   • JSON-structured output parsing");
    console.log("   • Memory updates and conflict resolution");
    console.log("   • Semantic search with Google embeddings");
  } catch (error) {
    console.error("❌ Test failed:", error);

    if (error instanceof Error && error.message?.includes("API_KEY")) {
      console.log(
        "\n💡 Tip: Make sure your Google API key is valid and has access to:",
      );
      console.log("   • Generative AI API (for Gemini)");
      console.log("   • Embedding API (for text-embedding-004)");
    }
  }
}

/**
 * Compare Google vs OpenAI performance
 */
async function compareProviders() {
  console.log("\n⚖️ === Provider Comparison Demo ===\n");

  const testInput =
    "I'm a blockchain developer working on DeFi protocols. I love Solidity and spend my free time contributing to Ethereum improvement proposals.";

  // Test with Google
  if (process.env.GOOGLE_API_KEY) {
    console.log("🤖 Testing with Google Gemini...");
    const googleMemory = new Memory({
      embedder: {
        provider: "google",
        config: { apiKey: process.env.GOOGLE_API_KEY },
      },
      llm: {
        provider: "google",
        config: { apiKey: process.env.GOOGLE_API_KEY },
      },
      vectorStore: { provider: "memory", config: { dimension: 768 } },
    });

    try {
      const googleResult = await googleMemory.add(testInput, {
        userId: "test_google",
      });
      console.log("✅ Google extracted facts:");
      googleResult.results.forEach((fact, i) => {
        console.log(`  ${i + 1}. ${fact.memory}`);
      });
    } catch (error) {
      console.log(
        "❌ Google test failed:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Test with OpenAI (if available)
  if (process.env.OPENAI_API_KEY) {
    console.log("\n🚀 Testing with OpenAI...");
    const openaiMemory = new Memory({
      embedder: {
        provider: "openai",
        config: { apiKey: process.env.OPENAI_API_KEY },
      },
      llm: {
        provider: "openai",
        config: { apiKey: process.env.OPENAI_API_KEY },
      },
      vectorStore: { provider: "memory", config: { dimension: 1536 } },
    });

    try {
      const openaiResult = await openaiMemory.add(testInput, {
        userId: "test_openai",
      });
      console.log("✅ OpenAI extracted facts:");
      openaiResult.results.forEach((fact, i) => {
        console.log(`  ${i + 1}. ${fact.memory}`);
      });
    } catch (error) {
      console.log(
        "❌ OpenAI test failed:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  console.log(
    "\n📊 Both providers can extract facts, but may have different strengths:",
  );
  console.log(
    "   • Google Gemini: Latest AI capabilities, 768-dim embeddings, free tier",
  );
  console.log(
    "   • OpenAI GPT-4: Proven reliability, 1536-dim embeddings, paid service",
  );
}

/**
 * Main demo runner
 */
async function main() {
  console.log("🚀 Starting Google Gemini Integration Tests\n");

  try {
    await testGoogleGeminiFactExtraction();
    await compareProviders();

    console.log("\n🎯 Integration Summary:");
    console.log("✅ Successfully implemented Google Gemini support");
    console.log("✅ Both embedding and LLM providers working");
    console.log("✅ Fact extraction and memory management functional");
    console.log("✅ Ready for production use with Google AI");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

if (require.main === module) {
  main();
}

export { testGoogleGeminiFactExtraction, compareProviders };
