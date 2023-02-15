import { cac } from "cac";
import dotenv from "dotenv";

import { indexFiles } from "../commands/indexFiles.js";
import { search } from "../commands/search.js";

dotenv.config();

const cli = cac("@beerose/semantic-search");

cli
  .command(
    "index <dir>",
    "Process files with your content and upload them to Pinecone"
  )
  .example("index ./posts")
  .action(async (postsDir) => {
    try {
      await indexFiles(postsDir);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

cli
  .command("search <query>", "Search by a given query")
  .example("search 'Hello world'")
  .action(async (query) => {
    try {
      await search(query);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

cli.command("", "").action(() => {
  cli.outputHelp();
});

cli.help();

try {
  cli.parse(process.argv, { run: false });
  cli.runMatchedCommand();
} catch (error: any) {
  if (error.name === "CACError") {
    console.error(error.message + "\n");
    cli.outputHelp();
  } else {
    console.log(error.stack);
  }
  process.exit(1);
}
