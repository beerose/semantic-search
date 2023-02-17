import { intro, outro, spinner } from "@clack/prompts";
import * as fs from "node:fs";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";
import glob from "tiny-glob";

import { getEmbeddings } from "../getEmbeddings.js";
import { getEnvKeys } from "../getEnvKeys.js";
import { mdxToPlainText } from "../mdxToPlainText.js";
import { splitIntoChunks } from "../splitIntoChunks.js";
import { titleCase } from "../titleCase.js";
import type { SemanticSearchMetadata } from "../types.js";

const debug = (...args: Parameters<typeof console.debug>) => {
  if (process.env.DEBUG) {
    console.debug(...args);
  }
};

const getTitle = (content: string, path: string): string => {
  const title = /(?<=title: ).*/.exec(content)?.[0];
  if (title) {
    return title.replace(/"/g, "");
  }
  return titleCase(path.replace(/-/g, " ").replace(/\.mdx$/, ""));
};

export async function indexFiles(postsDir: string) {
  intro(`@beerose/semantic-search index`);
  await getEnvKeys();

  const s = spinner();

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  );

  const pinecone = new PineconeClient<SemanticSearchMetadata>({
    apiKey: process.env.PINECONE_API_KEY!,
    baseUrl: process.env.PINECONE_BASE_URL!,
    namespace: process.env.PINECONE_NAMESPACE!,
  });

  const files = await glob(`${postsDir}/**/*.{mdx, md}`);
  let count = 1;
  for (const post of files) {
    if (!post.endsWith(".mdx") && !post.endsWith(".md")) continue;

    const fileName = post.split("/").pop();

    s.start(`[${count}/${files.length}] Processing file: ${fileName}`);

    const rawContent = fs.readFileSync(post, "utf-8");
    const title = getTitle(rawContent, post);
    const plainText = await mdxToPlainText(rawContent);

    const chunks = splitIntoChunks(plainText);
    debug(`Split post "${title}" into ${chunks.length} chunks.`);

    debug("Generating embeddings for post content...");
    const itemEmbeddings = await getEmbeddings({
      id: post,
      content: { chunks },
      title,
      openai,
    });
    debug(`Generated ${itemEmbeddings.length} vectors for post: ${title}`);

    debug(`Upserting ${itemEmbeddings.length} vectors for post: ${post}...`);
    await pinecone.upsert({
      vectors: itemEmbeddings,
    });
    s.stop(
      `[${count}/${files.length}] Upserted ${itemEmbeddings.length} vectors for file: ${fileName}`
    );
    count++;
  }

  outro("Done! 🎉");
}
