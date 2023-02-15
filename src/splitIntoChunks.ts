import GPT3TokenizerImport from "gpt3-tokenizer";

const GPT3Tokenizer =
  "default" in GPT3TokenizerImport
    ? GPT3TokenizerImport.default
    : GPT3TokenizerImport;

import { Chunk, MAX_INPUT_TOKENS } from "./types.js";

export const splitIntoChunks = (
  content: string,
  maxInputTokens = MAX_INPUT_TOKENS
) => {
  const chunks: Chunk[] = [];
  let chunk = {
    tokens: [] as string[],
    start: 0,
    end: 0,
  };
  let start = 0;

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  const { text } = tokenizer.encode(content);

  for (const word of text) {
    const newChunkTokens = [...chunk.tokens, word];
    if (newChunkTokens.length > maxInputTokens) {
      const text = chunk.tokens.join("");
      chunks.push({
        text,
        start,
        end: start + text.length,
      });
      start += text.length + 1;
      chunk = {
        tokens: [word],
        start,
        end: start,
      };
    } else {
      chunk = {
        ...chunk,
        tokens: newChunkTokens,
      };
    }
  }
  chunks.push({
    ...chunk,
    text: chunk.tokens.join(""),
  });

  return chunks;
};
