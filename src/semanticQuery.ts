import type { CreateEmbeddingResponse, OpenAIApi } from "openai";
import type { PineconeClient } from "pinecone-client";

import { isRateLimitExceeded } from "./isRateLimitExceeded";
import { openaiEmbeddingModel, PineconeMetadata } from "./types";

export interface SemanticQueryOptions {
  /** Default: 10 */
  limit?: number;
  /** Default: false */
  includeValues?: boolean;
}
export async function semanticQuery(
  query: string,
  openai: OpenAIApi,
  pinecone: PineconeClient<PineconeMetadata>,
  options?: SemanticQueryOptions
) {
  let embed: CreateEmbeddingResponse | null = null;

  try {
    embed = (
      await openai.createEmbedding({
        input: query,
        model: openaiEmbeddingModel,
      })
    ).data;
  } catch (err) {
    if (isRateLimitExceeded(err)) {
      throw new Error(
        "OpenAI rate limit exceeded. Try again in a few minutes."
      );
    }

    throw err;
  }

  if (!embed.data.length || !embed.data[0]) {
    throw new Error(`Error generating embedding for query: ${query}`);
  }

  const response = await pinecone.query({
    vector: embed.data[0].embedding,
    topK: options?.limit ?? 10,
    includeMetadata: true,
    includeValues: options?.includeValues ?? false,
  });

  return response;
}
