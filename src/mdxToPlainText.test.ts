import { assert, describe, it } from "vitest";

import { mdxToPlainText } from "../src/mdxToPlainText";

describe("mdxToPlainText", () => {
  it("should remove JSX elements", async () => {
    assert.equal(await mdxToPlainText("<Bagel />"), "");
    assert.equal(await mdxToPlainText("<Bagel>Sesame</Bagel>"), "");
    assert.equal(await mdxToPlainText("<Bagel></Bagel>"), "");
  });

  it.only("should handle code", async () => {
    assert.equal(
      await mdxToPlainText(["```", "Bagel", "```"].join("\n")),
      "Bagel"
    );
    assert.equal(
      await mdxToPlainText('```js\nconsole.log("world");\n```'),
      'console.log("world");'
    );
  });

  it("should remove frontmatter", async () => {
    const rawInput = ["---", "title: Hello World", "---", "Hello"].join("\n");
    const expectedOutput = "Hello";
    const output = await mdxToPlainText(rawInput);
    assert.equal(output, expectedOutput);
  });

  it("should remove markdown elements", async () => {
    assert.equal(await mdxToPlainText("Alfred"), "Alfred");
    assert.equal(await mdxToPlainText("*Alfred*"), "Alfred");
    assert.equal(await mdxToPlainText("_Alfred_"), "Alfred");
    assert.equal(await mdxToPlainText("**Alfred**"), "Alfred");
    assert.equal(await mdxToPlainText("__Alfred__"), "Alfred");
    assert.equal(await mdxToPlainText("~~Alfred~~"), "Alfred");
    assert.equal(await mdxToPlainText("`Alfred`"), "Alfred");
    assert.equal(await mdxToPlainText("[Hello](world)"), "Hello");
    assert.equal(await mdxToPlainText("[**H**ello](world)"), "Hello");
    assert.equal(
      await mdxToPlainText(
        '[Hello][id]\n\n[id]: http://example.com "optional title"'
      ),
      "Hello"
    );
    assert.equal(await mdxToPlainText("Hello.\n\nWorld."), "Hello.\n\nWorld.");
    assert.equal(await mdxToPlainText("## Alfred"), "Alfred");
    assert.equal(await mdxToPlainText("Alfred\n====="), "Alfred");
    assert.equal(
      await mdxToPlainText("- Hello\n    * World\n        + !"),
      "Hello\n\nWorld\n\n!"
    );
    assert.equal(
      await mdxToPlainText("- Hello\n\n- World\n\n- !"),
      "Hello\n\nWorld\n\n!",
      "list"
    );

    assert.equal(
      await mdxToPlainText("- Hello\n- \n- World!"),
      "Hello\n\nWorld!",
      "empty list item"
    );

    assert.equal(
      await mdxToPlainText("> Hello\n> World\n> !"),
      "Hello\nWorld\n!",
      "blockquote"
    );

    assert.equal(
      await mdxToPlainText('![An image](image.png "test")'),
      "An image",
      "image (1)"
    );
    assert.equal(
      await mdxToPlainText('![](image.png "test")'),
      "test",
      "image (2)"
    );
    assert.equal(await mdxToPlainText("![](image.png)"), "", "image (3)");
    assert.equal(
      await mdxToPlainText("![An image][id]\n\n[id]: http://example.com/a.jpg"),
      "An image"
    );

    assert.equal(await mdxToPlainText("---"), "", "thematic break");
    assert.equal(await mdxToPlainText("A  \nB"), "A\nB", "hard line break");
    assert.equal(await mdxToPlainText("A\nB"), "A\nB", "soft line break");
    assert.equal(await mdxToPlainText("| A | B |\n| - | - |\n| C | D |"), "");

    assert.equal(await mdxToPlainText('<script>alert("world");</script>'), "");
    assert.equal(
      await mdxToPlainText(
        '[<img src="http://example.com/a.jpg" />](http://example.com)'
      ),
      ""
    );
  });

  it("should handle import/export", async () => {
    assert.equal(
      await mdxToPlainText("import Bagel from 'noahs-bagels';"),
      "",
      "import"
    );
    assert.equal(
      await mdxToPlainText("import {Bagel} from 'noahs-bagels';"),
      "",
      "import"
    );
    assert.equal(
      await mdxToPlainText("import * as Bagel from 'noahs-bagels';"),
      "",
      "import"
    );

    assert.equal(
      await mdxToPlainText(`export const Bagel = "sesame"`),
      "",
      "export"
    );
  });
});
