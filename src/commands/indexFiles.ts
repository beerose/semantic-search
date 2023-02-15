import { assert } from "node:console";
import * as fs from "node:fs";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";
import glob from "tiny-glob";

import { getEmbeddingsForPostContent } from "../getEmbeddings";
import { mdxToPlainText } from "../mdxToPlainText";
import { splitIntoChunks } from "../splitIntoChunks";
import { titleCase } from "../titleCase";
import type { PineconeMetadata } from "../types";

const getTitle = (content: string, path: string): string => {
  const title = /(?<=title: ).*/.exec(content)?.[0];
  if (title) {
    return title.replace(/"/g, "");
  }
  return titleCase(path.replace(/-/g, " ").replace(/\.mdx$/, ""));
};

export async function indexFiles(postsDir: string) {
  assert(process.env.OPENAI_API_KEY, "OPENAI_API_KEY is required");
  assert(process.env.PINECONE_API_KEY, "PINECONE_API_KEY is required");
  assert(process.env.PINECONE_BASE_URL, "PINECONE_BASE_URL is required");
  assert(process.env.PINECONE_NAMESPACE, "PINECONE_NAMESPACE is required");

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  );

  const pinecone = new PineconeClient<PineconeMetadata>({
    apiKey: process.env.PINECONE_API_KEY!,
    baseUrl: process.env.PINECONE_BASE_URL!,
    namespace: process.env.PINECONE_NAMESPACE!,
  });

  console.log("Resolving posts...");
  const files = await glob(`${postsDir}/**/*.{mdx, md}`);
  console.log(`Found ${files.length} posts.`);
  for (const post of files) {
    if (!post.endsWith(".mdx") && !post.endsWith(".md")) continue;

    console.log(`Processing post: ${post}...`);

    const rawContent = fs.readFileSync(post, "utf-8");
    const title = getTitle(rawContent, post);
    const plainText = await mdxToPlainText(rawContent);

    const chunks = splitIntoChunks(plainText);
    console.log(`Split post "${title}" into ${chunks.length} chunks.`);

    console.log("Generating embeddings for post content...");
    const itemEmbeddings = await getEmbeddingsForPostContent({
      id: post,
      content: { chunks },
      title,
      openai,
    });
    console.log(
      `Generated ${itemEmbeddings.length} vectors for post: ${title}`
    );

    console.log(
      `Upserting ${itemEmbeddings.length} vectors for post: ${post}...`
    );
    await pinecone.upsert({
      vectors: itemEmbeddings,
    });
    console.log(`Upserted ${itemEmbeddings.length} vectors for post: ${post}`);

    console.log(`Finished processing post: ${post}.\n`);
  }
}
