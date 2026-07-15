declare module "*.css";

declare module "*.mdx" {
  import type { MDXContent } from "mdx/types";

  const MDXComponent: MDXContent;
  export default MDXComponent;
}
