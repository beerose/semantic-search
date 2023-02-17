import { intro, outro, spinner, text } from "@clack/prompts";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

import { getEnvKeys } from "../getEnvKeys.js";
import { semanticQuery } from "../semanticQuery.js";
import { SemanticSearchMetadata } from "../types.js";

export async function search() {
  intro(`@beerose/semantic-search search`);
  await getEnvKeys();

  const s = spinner();

  const query = (await text({
    message: "Enter a search query:",
  })) as string;

  s.start("Searching...");

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

  const response = await semanticQuery(query, openai, pinecone);

  console.log(JSON.stringify(response, null, 2));

  s.stop();
  outro("Done!");
}
