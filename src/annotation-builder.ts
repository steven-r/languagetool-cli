import * as annotatedtext from "annotatedtext";
import remarkDirective from "remark-directive";
import frontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkparse from "remark-parse";
import { unified } from "unified";
import { IAnnotationBuilderOptions } from "./interfaces";

const defaults: IAnnotationBuilderOptions = {
  children(node: annotatedtext.INode): annotatedtext.INode[] {
    return annotatedtext.defaults.children(node);
  },
  annotatetextnode(
    node: annotatedtext.INode,
    text: string,
  ): annotatedtext.IAnnotation | null {
    return annotatedtext.defaults.annotatetextnode(node, text);
  },
  interpretmarkup(text = ""): string {
    return "\n".repeat((text.match(/\n/g) || []).length);
  },
  // See: https://github.com/syntax-tree/mdast-util-from-markdown#frommarkdowndoc-encoding-options
  remarkoptions: {},
};

function build(
  text: string,
  options: IAnnotationBuilderOptions = defaults,
): annotatedtext.IAnnotatedtext {
  const processor = unified()
    .use(remarkparse, options.remarkoptions)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(frontmatter, ["yaml", "toml"]);
  return annotatedtext.build(text, processor.parse, options);
}

export { build, defaults };