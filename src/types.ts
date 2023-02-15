export type PineconeMetadata = {
  id: string;
  title: string;
  text: string;
  start: number;
  end: number;
};

export type PineconeVector = {
  id: string;
  values: number[];
  metadata: PineconeMetadata;
};

export type PineconeVectorPending = {
  id: string;
  input: string;
  metadata: PineconeMetadata;
};

export interface PostDetails {
  title: string;
  path: string;
  content: PostContent;
}

export type PostContent = {
  chunks: Chunk[];
};

export type Chunk = {
  text: string;
  start: number;
  end: number;
};

export const openaiEmbeddingModel = "text-embedding-ada-002";
export const MAX_INPUT_TOKENS = 100;
