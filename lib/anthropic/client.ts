import Anthropic from "@anthropic-ai/sdk";

export interface AnthropicClientConfig {
  apiKey: string;
  baseURL?: string;
}

export function createAnthropicClient(config: AnthropicClientConfig): Anthropic {
  if (!config.apiKey) {
    throw new Error("createAnthropicClient: apiKey is required");
  }
  return new Anthropic({ apiKey: config.apiKey, baseURL: config.baseURL });
}
