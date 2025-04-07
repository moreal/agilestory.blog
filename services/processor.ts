import type { Content } from "../models/content.ts";
import type { RawContent } from "../models/raw-content.ts";

export class RawContentProcessor {
  process(rawContent: RawContent): Content {
    return {
      title: rawContent.title,
      body: rawContent.body
        .replaceAll(/onclick="[^"]*"/g, "") // Remove onclick attributes
        .replaceAll(/<!--[\s\S]*?-->/g, ""), // Remove HTML comments
      createdAt: rawContent.createdAt,
    };
  }
}
