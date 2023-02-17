# @beerose/semantic-search

An OpenAI-powered CLI to build a semantic search index from your MDX files. It
allows you to perform complex searches across your content and integrate it with
your platform.

## 🧳 Prerequisites

This project uses [OpenAI](https://openai.com/api) to generate vector embeddings
and [Pinecone](https://pinecone.io/) to host the embeddings, which means you
need to have accounts in OpenAI and Pinecone to use it.

<details>
<summary>Setting up a Pinecone project</summary>

After creating an account in Pinecone, go to the dashboard and click on the
`Create Index` button:

![CleanShot 2023-02-17 at 16 10 32@2x](https://user-images.githubusercontent.com/9019397/219693945-6d656f53-6dc2-4010-8ee8-f9d3e69913a1.png)

Fill the form with your new index name (e.g. your blog name) and set the number
of dimensions to 1536:

![CleanShot 2023-02-17 at 16 11 54@2x](https://user-images.githubusercontent.com/9019397/219693863-ccaa2105-db44-4838-b94b-40689945c8f2.png)

</details>

## 🚀 CLI Usage

<details>
<summary>How to get your env keys from Pinecone and OpenAI?</summary>

**Pinecone**

![CleanShot 2023-02-17 at 16 15 32@2x](https://user-images.githubusercontent.com/9019397/219693780-bee0e02b-3961-4a92-b505-8076ef67295e.png)
![CleanShot 2023-02-17 at 16 13 22@2x](https://user-images.githubusercontent.com/9019397/219693831-794c88ce-a763-4415-84f6-08b00c0aab0e.png)

**OpenAI**

![CleanShot 2023-02-17 at 16 18 00@2x](https://user-images.githubusercontent.com/9019397/219693739-3c5e0b31-425b-4cef-8aa9-066dd24d9ab2.png)

</details>

The CLI requires four env keys:

```sh
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_BASE_URL=
PINECONE_NAMESPACE=
```

Make sure to add them before using it!

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

Install deps:

```sh
$ pnpm add pinecone-client openai @beerose/semantic-search

# or `yarn add` or `npm i`
```

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

Here's an example API route from [aleksandra.codes](https://aleksandra.codes):
https://github.com/beerose/aleksandra.codes/blob/main/api/search.ts

## ✨ How does it work?

Semantic search can understand the meaning of words in documents and return
results that are more relevant to the user's intent.

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

## 🍿 Demo

![](https://user-images.githubusercontent.com/9019397/219777236-d9c4cbb6-b408-40ca-be22-cd01eefa4e53.gif)

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

Run the CLI locally:

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
