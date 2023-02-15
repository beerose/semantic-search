import type { Code, Content, Paragraph, Parent, Text } from "mdast";
import type { Root } from "remark-mdx";
import type { Plugin } from "unified";

type Node = Root | Content;

type Handler = (node: any) => Node | Node[];

/**
 * Expose modifiers for available node types.
 * Node types not listed here are not changed (but their children are).
 *
 * @type {Handlers}
 */
const defaultHandlers: Partial<Record<Node["type"], Handler>> = {
  heading: paragraph,
  text,
  inlineCode: text,
  code: text,
  paragraph,

  image,
  imageReference: image,
  break: lineBreak,

  blockquote: children,
  list: children,
  listItem: children,
  strong: children,
  emphasis: children,
  delete: children,
  link: children,
  linkReference: children,

  thematicBreak: empty,
  html: empty,
  table: empty,
  tableCell: empty,
  definition: empty,
  yaml: empty,

  // @ts-expect-error: custom frontmatter node.
  toml: empty,

  footnoteReference: empty,
  footnoteDefinition: empty,

  mdxjsEsm: empty,
  mdxJsxTextElement: empty,
  mdxJsxFlowElement: empty,
};

/**
 * Clean nodes: merges literals.
 */
function clean(values: Node[]): Node[] {
  let index = -1;
  /** @type {Node[]} */
  const result: Node[] = [];
  /** @type {Node|undefined} */
  let previous: Node | undefined;

  while (++index < values.length) {
    const value = values[index];
    if (!value) continue;

    if (previous && value.type === previous.type && "value" in value) {
      // @ts-expect-error: we just checked that they’re the same node.
      previous.value += value.value;
    } else {
      result.push(value);
      previous = value;
    }
  }

  return result;
}

function image(
  node: import("mdast").Image | import("mdast").ImageReference
): Text {
  const title = "title" in node ? node.title : "";
  return { type: "text", value: node.alt || title || "" };
}

function text(node: Text | Code): Text {
  return { type: "text", value: node.value };
}

function paragraph(node: Paragraph): Paragraph {
  return { type: "paragraph", children: node.children };
}

function children(node: Extract<Node, Parent>): Content[] {
  return node.children || [];
}

function empty(): Text {
  return { type: "text", value: "" };
}

function lineBreak(): Text {
  return { type: "text", value: "\n" };
}

export const remarkMdxToPlainText: Plugin<[], Root> = () => {
  const handlers = { ...defaultHandlers };

  return stripOne as (node: Root) => Root;

  function stripOne(node: Node): Node | Node[] {
    let result: Node | Node[] = node;

    if (node.type in handlers) {
      const handler = handlers[node.type];
      if (handler) result = handler(result);
    }

    result = Array.isArray(result) ? stripMany(result) : result;

    if ("children" in result) {
      result.children = stripMany(result.children) as Content[];
    }

    return result;
  }

  function stripMany(nodes: Node[]): Node[] {
    let index = -1;
    /** @type {Node[]} */
    const result: Node[] = [];

    while (++index < nodes.length) {
      const value = stripOne(nodes[index]!);

      if (Array.isArray(value)) {
        result.push(...value.flatMap(stripOne));
      } else {
        result.push(value);
      }
    }

    return clean(result);
  }
};

export const mdxToPlainText = async (rawContent: string) => {
  const remark = (await import("remark")).remark;
  const remarkFrontmatter = (await import("remark-frontmatter")).default;
  const remarkGfm = (await import("remark-gfm")).default;
  const remarkMdx = (await import("remark-mdx")).default;
  const remarkSmartypants = (await import("remark-smartypants")).default;

  try {
    const vfile = await remark()
      .use(remarkFrontmatter)
      .use(remarkSmartypants)
      .use(remarkGfm)
      .use(remarkMdx)
      .use(remarkMdxToPlainText)
      .process(rawContent);

    return vfile.value.toString().trim();
  } catch (err) {
    return rawContent;
  }
};
