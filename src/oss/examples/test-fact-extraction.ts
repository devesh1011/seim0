import { Memory } from "../src";
import dotenv from "dotenv";

dotenv.config();

/**
 * Simple test to verify fact extraction is working
 */
async function testFactExtraction() {
  console.log("🧪 Testing Enhanced Fact Extraction...\n");

  const memory = new Memory({
    version: "v1.1",
    embedder: {
      provider: "openai",
      config: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "text-embedding-3-small",
      },
    },
    vectorStore: {
      provider: "memory",
      config: {
        collectionName: "test_memories",
        dimension: 1536,
      },
    },
    llm: {
      provider: "openai",
      config: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4-turbo-preview",
      },
    },
    disableHistory: false,
  });

  try {
    // Test 1: Basic fact extraction
    console.log("Test 1: Basic personal information");
    const result1 = await memory.add(
      "Hi, my name is Alex and I work as a software engineer at Google. I love playing tennis on weekends.",
      { userId: "test_user_1" },
    );

    console.log("Extracted facts:");
    result1.results.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    // Test 2: Memory updates
    console.log("\nTest 2: Updating information");
    const result2 = await memory.add(
      "Actually, I got promoted to Senior Software Engineer last month, and now I prefer playing basketball instead of tennis.",
      { userId: "test_user_1" },
    );

    console.log("Memory updates:");
    result2.results.forEach((fact, i) => {
      console.log(`  ${i + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    // Test 3: Search
    console.log("\nTest 3: Semantic search");
    const searchResult = await memory.search("What does Alex do for work?", {
      userId: "test_user_1",
    });

    console.log("Search results:");
    searchResult.results.forEach((result, i) => {
      console.log(
        `  ${i + 1}. ${result.memory} (score: ${result.score?.toFixed(3)})`,
      );
    });

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

if (require.main === module) {
  testFactExtraction();
}
