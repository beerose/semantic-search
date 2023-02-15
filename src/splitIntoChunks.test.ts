import { describe, expect, it } from "vitest";

import { splitIntoChunks } from "./splitIntoChunks.js";

describe("splitIntoChunks", () => {
  it("should not lose tokens", async () => {
    const text =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    const chunks = splitIntoChunks(text);

    const textInChunks = chunks.map((chunk) => chunk.text).join("");

    expect(text.length).toBe(textInChunks.length);
    expect(text).toBe(textInChunks);
  });
});
