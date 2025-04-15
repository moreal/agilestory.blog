import type { TimeMap } from "../../models/timemap.ts";

export interface TimeMapRepository {
  get(): Promise<TimeMap | undefined>;
  save(data: TimeMap): Promise<void>;
}
