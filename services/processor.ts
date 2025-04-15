import type { Content } from "../models/content.ts";

export class ContentProcessor {
  process(rawContent: Content): Content {
    return {
      title: rawContent.title,
      body: rawContent.body
        .replaceAll(/onclick="[^"]*"/g, "") // Remove onclick attributes
        .replaceAll(/<!--[\s\S]*?-->/g, ""), // Remove HTML comments
      createdAt: rawContent.createdAt,
    };
  }
}
