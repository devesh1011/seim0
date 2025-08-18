import { GoogleGenAI } from "@google/genai";
import { Embedder } from "./base";
import { EmbeddingConfig } from "../types";

export class GoogleEmbedder implements Embedder {
  private google: GoogleGenAI;
  private model: string;

  constructor(config: EmbeddingConfig) {
    if (!config.apiKey) {
      throw new Error("Google API key is required");
    }
    this.google = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || "text-embedding-004";
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.google.models.embedContent({
        model: this.model,
        contents: text,
        config: { outputDimensionality: 768 },
      });
      return response.embeddings![0].values!;
    } catch (error) {
      console.error("Error generating Google embedding:", error);
      throw error;
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.google.models.embedContent({
        model: this.model,
        contents: texts,
        config: { outputDimensionality: 768 },
      });
      return response.embeddings!.map((item) => item.values!);
    } catch (error) {
      console.error("Error generating Google batch embeddings:", error);
      throw error;
    }
  }
}
