import { text } from "@clack/prompts";

import { password } from "./password.js";

export const getEnvKeys = async () => {
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = (await password({
      message: "Enter your OpenAI API key.",
    })) as string;
  }

  if (!process.env.PINECONE_API_KEY) {
    process.env.PINECONE_API_KEY = (await password({
      message: "Enter your Pinecone API key.",
    })) as string;
  }

  if (!process.env.PINECONE_BASE_URL) {
    process.env.PINECONE_BASE_URL = (await text({
      message: "Enter your Pinecone base URL.",
    })) as string;
  }

  if (!process.env.PINECONE_NAMESPACE) {
    process.env.PINECONE_NAMESPACE = (await text({
      message: "Enter your Pinecone namespace.",
    })) as string;
  }
};
