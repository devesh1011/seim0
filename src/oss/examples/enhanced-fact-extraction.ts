import { Memory } from "../src";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Enhanced fact extraction example demonstrating mem0's intelligence
 * This example shows how conversations are transformed into structured facts
 * and stored efficiently for later retrieval and reasoning
 */
async function demonstrateFactExtraction() {
  console.log("\n🧠 === Enhanced Fact Extraction Demo ===\n");

  // Initialize with OpenAI for optimal fact extraction
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
      provider: "memory", // In-memory for demo
      config: {
        collectionName: "enhanced_memories",
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
    // Reset memories for clean demo
    console.log("🔄 Resetting all memories...");
    await memory.reset();

    console.log("\n📝 === Stage 1: Initial Conversation ===");

    // Add a rich conversation with multiple facts
    const conversation1 = [
      {
        role: "user",
        content:
          "Hi, I'm Sarah. I work as a data scientist at Tesla and I love working with machine learning models.",
      },
      {
        role: "assistant",
        content:
          "Nice to meet you Sarah! Data science at Tesla must be exciting. What kind of ML models do you work with most?",
      },
      {
        role: "user",
        content:
          "I mainly work on computer vision for autonomous driving. I prefer Python and use PyTorch mostly. My favorite coffee is Ethiopian single origin - I drink it every morning at 7 AM before work.",
      },
      {
        role: "assistant",
        content:
          "That's fascinating! Computer vision for self-driving cars is cutting-edge. Ethiopian coffee is excellent - that morning routine sounds perfect for starting a productive day.",
      },
    ];

    console.log("💡 Adding conversation with fact extraction...");
    const result1 = await memory.add(conversation1, {
      userId: "sarah_001",
      metadata: { session: "demo_1", type: "personal_intro" },
    });

    console.log("✅ Extracted facts:");
    result1.results.forEach((fact, index) => {
      console.log(`   ${index + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    console.log("\n📝 === Stage 2: Additional Information ===");

    // Add conflicting/updating information
    const conversation2 = [
      {
        role: "user",
        content:
          "Actually, I got promoted last week! I'm now a Senior Data Scientist and I'm leading a team of 5 engineers.",
      },
      {
        role: "assistant",
        content:
          "Congratulations on your promotion! Leading a team is a big responsibility.",
      },
      {
        role: "user",
        content:
          "Thanks! Oh, and I've switched to drinking green tea instead of coffee - it's better for my anxiety.",
      },
    ];

    console.log("💡 Adding updates and changes...");
    const result2 = await memory.add(conversation2, {
      userId: "sarah_001",
      metadata: { session: "demo_2", type: "update" },
    });

    console.log("✅ Memory updates:");
    result2.results.forEach((fact, index) => {
      console.log(`   ${index + 1}. ${fact.memory} (${fact.metadata?.event})`);
      if (fact.metadata?.reasoning) {
        console.log(`      Reasoning: ${fact.metadata.reasoning}`);
      }
    });

    console.log("\n📝 === Stage 3: More Complex Information ===");

    // Add complex preferences and relationships
    const conversation3 = [
      {
        role: "user",
        content:
          "My colleague John from the perception team and I are working on a new project. We meet every Tuesday at 2 PM to discuss progress.",
      },
      {
        role: "assistant",
        content:
          "Collaboration is key in complex projects like autonomous driving.",
      },
      {
        role: "user",
        content:
          "Yes! I also have a project deadline coming up on September 15th. I'm planning to take a vacation to Japan after that - I've always wanted to visit during cherry blossom season.",
      },
      {
        role: "assistant",
        content:
          "Japan during cherry blossom season sounds amazing! Perfect timing for a well-deserved break after your project.",
      },
    ];

    console.log("💡 Adding complex relationships and plans...");
    const result3 = await memory.add(conversation3, {
      userId: "sarah_001",
      metadata: { session: "demo_3", type: "work_plans" },
    });

    console.log("✅ New facts extracted:");
    result3.results.forEach((fact, index) => {
      console.log(`   ${index + 1}. ${fact.memory} (${fact.metadata?.event})`);
    });

    console.log("\n🔍 === Stage 4: Semantic Search ===");

    // Demonstrate intelligent retrieval
    const searchQueries = [
      "What does Sarah do for work?",
      "What are Sarah's beverage preferences?",
      "Tell me about Sarah's upcoming plans",
      "Who does Sarah work with?",
    ];

    for (const query of searchQueries) {
      console.log(`\n❓ Query: "${query}"`);
      const searchResults = await memory.search(query, {
        userId: "sarah_001",
        limit: 3,
      });

      console.log("📊 Relevant memories:");
      searchResults.results.forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.memory} (score: ${result.score?.toFixed(3)})`,
        );
      });
    }

    console.log("\n📋 === Stage 5: All Stored Facts ===");

    // Show all current memories
    const allMemories = await memory.getAll({
      userId: "sarah_001",
    });

    console.log("🧠 Complete knowledge base:");
    allMemories.results.forEach((memory, index) => {
      console.log(`   ${index + 1}. ${memory.memory}`);
      console.log(`      Created: ${memory.createdAt}`);
      console.log(`      ID: ${memory.id}`);
    });

    console.log("\n🎯 === Demonstration Complete ===");
    console.log("✅ Successfully demonstrated:");
    console.log("   • Intelligent fact extraction from natural conversations");
    console.log("   • Automatic memory updates when information changes");
    console.log("   • Semantic search across stored facts");
    console.log("   • Conflict resolution (coffee → green tea)");
    console.log("   • Complex relationship tracking (colleagues, meetings)");
    console.log("   • Future planning recognition (deadlines, vacation)");
  } catch (error) {
    console.error("❌ Error in fact extraction demo:", error);
  }
}

/**
 * Demonstrate IPFS integration for decentralized storage
 */
async function demonstrateDecentralizedStorage() {
  console.log("\n🌐 === Decentralized Memory Storage Demo ===\n");

  // For now, use in-memory storage with logging to simulate IPFS integration
  console.log("📡 Note: IPFS integration would be configured here with:");
  console.log("   • IPFS gateway: https://ipfs.io");
  console.log("   • Pinata API for content pinning");
  console.log("   • Smart contract registry on Sei blockchain");
  console.log("   • Content addressing via CID");

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
      provider: "memory", // Local for embeddings - would be distributed in production
      config: {
        collectionName: "decentralized_memories",
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
    console.log("📡 Adding facts to simulated decentralized storage...");

    const result = await memory.add(
      "I'm building a decentralized AI assistant that stores memories on IPFS and uses blockchain for access control. It's going to revolutionize how we think about personal AI.",
      {
        userId: "developer_001",
        metadata: {
          project: "decentralized_ai",
          storage: "ipfs",
          access_control: "blockchain",
          simulated_cid: "QmXxX...abc123", // Would be real CID in production
        },
      },
    );

    console.log("✅ Facts extracted and ready for IPFS storage:");
    result.results.forEach((fact, index) => {
      console.log(`   ${index + 1}. ${fact.memory}`);
      console.log(`      Event: ${fact.metadata?.event}`);
      console.log(`      Would store to IPFS with CID generation`);
    });

    console.log("\n🔍 Searching decentralized memories...");
    const searchResult = await memory.search("Tell me about the AI project", {
      userId: "developer_001",
    });

    console.log("📊 Retrieved from memory (would fetch from IPFS):");
    searchResult.results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.memory}`);
    });
  } catch (error) {
    console.error("❌ Error in decentralized storage demo:", error);
  }
}

/**
 * Main demo runner
 */
async function main() {
  console.log("🚀 Starting seim0 Enhanced Fact Extraction Demonstrations\n");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable is required!");
    console.log("Please set your OpenAI API key in the .env file");
    process.exit(1);
  }

  try {
    // Run fact extraction demo
    await demonstrateFactExtraction();

    // Run decentralized storage demo
    await demonstrateDecentralizedStorage();

    console.log("\n🎉 All demonstrations completed successfully!");
    console.log("🔮 Next steps:");
    console.log("   • Deploy to Sei testnet for full blockchain integration");
    console.log("   • Set up IPFS pinning service for production storage");
    console.log("   • Implement smart contract access controls");
    console.log("   • Add encryption for sensitive memory data");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Run the demo
if (require.main === module) {
  main();
}

export { demonstrateFactExtraction, demonstrateDecentralizedStorage };
