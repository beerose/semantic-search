import { cac } from "cac";
import dotenv from "dotenv";
import color from "picocolors";

import { indexFiles } from "../commands/indexFiles.js";
import { search } from "../commands/search.js";
import { isAuthError } from "../errors.js";

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
    } catch (err: any) {
      if (isAuthError(err)) {
        console.error(
          color.red(
            "\n❌ Authorization error — please check your environment variables.\n"
          )
        );
        process.exit(1);
      }
      console.error(color.red(err.message));
      process.exit(1);
    }
  });

cli
  .command("search", "Search by a provided query")
  .example("search")
  .action(async () => {
    try {
      await search();
    } catch (err: any) {
      if (isAuthError(err)) {
        console.error(
          color.red(
            "\n❌ Authorization error — please check your environment variables.\n"
          )
        );
        process.exit(1);
      }
      console.error(color.red(err.message));
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
    console.error(color.red(error.stack));
  }
  process.exit(1);
}
