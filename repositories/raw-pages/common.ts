import type { RawPages } from "../../models/raw-pages.ts";

export interface RawPagesRepository {
  get(): Promise<RawPages | undefined>;
  save(data: RawPages): Promise<void>;
}
