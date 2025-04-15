import type { Content } from "../../models/content.ts";

export interface ContentRepository {
  get(url: string): Promise<Content | undefined>;
  save(url: string, content: Content): Promise<void>;
}
