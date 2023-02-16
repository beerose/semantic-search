import type { OpenAIApi } from "openai";
import type { PineconeClient } from "pinecone-client";

import { OPENAI_EMBEDDING_MODEL, SemanticSearchMetadata } from "./types.js";

export interface SemanticQueryOptions {
  /** Default: 10 */
  limit?: number;
  /** Default: false */
  includeValues?: boolean;
}
export async function semanticQuery(
  query: string,
  openai: OpenAIApi,
  pinecone: PineconeClient<SemanticSearchMetadata>,
  options?: SemanticQueryOptions
) {
  const embed = (
    await openai.createEmbedding({
      input: query,
      model: OPENAI_EMBEDDING_MODEL,
    })
  ).data;

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
