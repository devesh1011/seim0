import { GoogleGenAI } from "@google/genai";
import { LLM, LLMResponse } from "./base";
import { LLMConfig, Message } from "../types";

export class GoogleLLM implements LLM {
  private google: GoogleGenAI;
  private model: string;

  constructor(config: LLMConfig) {
    if (!config.apiKey) {
      throw new Error("Google API key is required");
    }
    this.google = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || "gemini-2.0-flash";
  }

  async generateResponse(
    messages: Message[],
    responseFormat?: { type: string },
    tools?: any[],
  ): Promise<string | LLMResponse> {
    try {
      // Convert messages to Google's format
      const contents = messages.map((msg) => ({
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
        // Google uses "model" for system/assistant and "user" for user
        role:
          msg.role === "assistant" || msg.role === "system" ? "model" : "user",
      }));

      // For JSON output, we'll add instructions to the last message
      if (responseFormat?.type === "json_object") {
        const lastContent = contents[contents.length - 1];
        if (lastContent && lastContent.parts[0]) {
          lastContent.parts[0].text +=
            "\n\nPlease respond with valid JSON only.";
        }
      }

      const completion = await this.google.models.generateContent({
        contents,
        model: this.model,
      });

      let text = completion.text || "";

      // Clean up JSON formatting if needed
      if (responseFormat?.type === "json_object") {
        text = text
          .replace(/^```json\n/, "")
          .replace(/\n```$/, "")
          .trim();
      }

      return text;
    } catch (error) {
      console.error("Error generating Google LLM response:", error);
      throw error;
    }
  }

  async generateChat(messages: Message[]): Promise<LLMResponse> {
    try {
      const contents = messages.map((msg) => ({
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
        role:
          msg.role === "assistant" || msg.role === "system" ? "model" : "user",
      }));

      const completion = await this.google.models.generateContent({
        contents,
        model: this.model,
      });

      const response = completion.candidates![0].content;
      return {
        content: response!.parts![0].text || "",
        role: response!.role!,
      };
    } catch (error) {
      console.error("Error generating Google LLM chat response:", error);
      throw error;
    }
  }
}
