import type { RawContent } from "../../models/raw-content.ts";

export interface RawContentRepository {
  get(url: string): Promise<RawContent | undefined>;
  save(url: string, content: RawContent): Promise<void>;
}
