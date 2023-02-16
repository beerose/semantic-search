import type { OpenAIApi } from "openai";

import { isRateLimitExceeded } from "./isRateLimitExceeded.js";
import {
  type PostContent,
  type SemanticSearchVector,
  OPENAI_EMBEDDING_MODEL,
} from "./types.js";

export async function getEmbeddings({
  content,
  id,
  title,
  openai,
  model = OPENAI_EMBEDDING_MODEL,
}: {
  content: PostContent;
  title: string;
  id: string;
  openai: OpenAIApi;
  model?: string;
}) {
  const pendingVectors = content.chunks.map(({ text, start, end }, index) => {
    return {
      id: `${id}:${index}`,
      input: text,
      metadata: {
        index,
        id,
        title,
        text,
        end,
        start,
      },
    };
  });

  const vectors: SemanticSearchVector[] = [];

  let timeout = 10_000;
  while (pendingVectors.length) {
    // We have 20 RPM on Free Trial, and 60 RPM on Pay-as-you-go plan, so we'll do exponential backoff.
    const pendingVector = pendingVectors.shift()!;
    try {
      const { data: embed } = await openai.createEmbedding({
        input: pendingVector.input,
        model,
      });

      const vector: SemanticSearchVector = {
        id: pendingVector.id,
        metadata: pendingVector.metadata,
        values: embed.data[0]?.embedding || [],
      };

      vectors.push(vector);
    } catch (err: unknown) {
      if (isRateLimitExceeded(err)) {
        pendingVectors.unshift(pendingVector);
        console.log("OpenAI rate limit exceeded, retrying in", timeout, "ms");
        await new Promise((resolve) => setTimeout(resolve, timeout));
        timeout *= 2;
      } else {
        throw err;
      }
    }
  }

  return vectors;
}
