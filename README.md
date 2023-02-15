# @beerose/semantic-search

An OpenAI-powered CLI to build a semantic search index from your MDX files. It
allows you to perform complex searches across your content and integrate it with
your platform.

## 🚀 CLI Usage

```sh
$ @beerose/semantic-search
```

### 🛠 Commands:

`index <dir>` — processes files with your content and upload them to Pinecone.

Example:

```sh
$ @beerose/semantic-search index ./posts
```

`search <query>` — performs a semantic search by a given query.

Example:

```sh
$ @beerose/semantic-search search "hello world"
```

For more info, run any command with the `--help` flag:

```sh
$ @beerose/semantic-search index --help
$ @beerose/semantic-search search --help
$ @beerose/semantic-search --help
```

## ➕ Project integration

You can use the `semanticQuery` function exported from this library and
integrate it with your website or application.

An example usage:

```ts
import { PineconeMetadata, semanticQuery } from "@beerose/semantic-search";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "pinecone-client";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const pinecone = new PineconeClient<PineconeMetadata>({
  apiKey: process.env.PINECONE_API_KEY,
  baseUrl: process.env.PINECONE_BASE_URL,
  namespace: process.env.PINECONE_NAMESPACE,
});

const result = await semanticQuery("hello world", openai, pinecone);
```

## ✨ How does it work?

Semantic search is a system that can understand the meaning of words in
documents and return results that are more relevant to the user's intent.

This tool uses [OpenAI](https://openai.com/) to generate vector embeddings with
a `text-embedding-ada-002` model.

> Embeddings are numerical representations of concepts converted to number
> sequences, which make it easy for computers to understand the relationships
> between those concepts.
> https://openai.com/blog/new-and-improved-embedding-model/

It also uses [Pinecone](https://pinecone.io/) — a hosted database for vector
search. It lets us perform k-NN searches across the generated embeddings.

### Processing MDX content

The `@beerose/sematic-search index` CLI command performs the following steps for
each file in a given directory:

1.  Converts the MDX files to raw text.
2.  Extracts the title.
3.  Splits the file into chunks of a maximum of 100 tokens.
4.  Generates OpenAI embeddings for each chunk.
5.  Upserts the embeddings to Pinecone.

Depending on your content, the whole process requires a bunch of calls to OpenAI
and Pinecone, which can take some time. For example, it takes around thirty
minutes for a directory with ~25 blog posts and an average of 6 minutes of
reading time.

### Performing semantic searches

To test the semantic search, you can use `@beerose/sematic-search search` CLI
command, which:

1. Creates an embedding for a provided query.
2. Sends a request to Pinecone with the embedding.

## 📦 What's inside?

```sh
.
├── bin
│   └── cli.js
├── src
│   ├── bin
│   │   └── cli.ts
│   ├── commands
│   │   ├── indexFiles.ts
│   │   └── search.ts
│   ├── getEmbeddings.ts
│   ├── isRateLimitExceeded.ts
│   ├── mdxToPlainText.test.ts
│   ├── mdxToPlainText.ts
│   ├── semanticQuery.ts
│   ├── splitIntoChunks.test.ts
│   ├── splitIntoChunks.ts
│   ├── titleCase.ts
│   └── types.ts
├── tsconfig.build.json
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

- `bin/cli.js` — The CLI entrypoint.
- `src`:
  - `bin/cli.ts` — Files where you can find CLI commands and settings. This
    project uses [CAC](https://github.com/cacjs/cac) for building CLIs.
  - `commands/indexFiles.ts` — A CLI command that handles processing md/mdx
    content, generating embeddings and uploading vectors to Pinecone.
  - `command/search.ts` — A semantic search command. It generates an embedding
    for a given search query and then calls Pinecone for the results.
  - `getEmbeddings.ts` — Generating embeddings logic. It handles a call to Open
    AI.
  - `isRateLimitExceeded.ts` — Error handling helper.
  - `mdxToPlainText.ts` — Converts MDX files to raw text. Uses remark and a
    custom `remarkMdxToPlainText` plugin (also defined in that file).
  - `semanticQuery.ts` — Core logic for performing semantic searches. It's being
    used in `search` command, and also it's exported from this library so that
    you can integrate it with your projects.
  - `splitIntoChunks.ts` — Splits the text into chunks with a maximum of 100
    tokens.
  - `titleCase.ts` — Extracts a title from a file path.
  - `types.ts` — Types and utilities used in this project.
- `tsconfig.json` - TypeScript compiler configuration.
- `tsconfig.build.json` - TypeScript compiler configuration used for
  `pnpm build`.

Tests:

- `src/mdxToPlainText.test.ts`
- `src/splitIntoChunks.test.ts`

## 👩‍💻 Local development

Install deps and build the project:

```sh
pnpm i

pnpm build
```

Run the CLI:

```sh
node bin/cli.js
```

## 🧪 Running tests

```sh
pnpm test
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome.<br /> Feel free to check
[issues page](https://github.com/beerose/semantic-search/issues) if you want to
contribute.<br />

## 📝 License

Copyright © 2023 [Aleksandra Sikora](https://github.com/beerose).<br /> This
project is [MIT](https://github.com/beerose/semantic-search/blob/master/LICENSE)
licensed.
