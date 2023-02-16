export type SemanticSearchMetadata = {
  id: string;
  title: string;
  text: string;
  start: number;
  end: number;
};

export type SemanticSearchVector = {
  id: string;
  values: number[];
  metadata: SemanticSearchMetadata;
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

export const OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002";
export const MAX_INPUT_TOKENS = 100;
