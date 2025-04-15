import type { TimeMap } from "../../models/timemap.ts";
import type { TimeMapRepository } from "../../repositories/timemap/mod.ts";
import type { WaybackMachineService } from "../wayback.ts";

export class TimeMapLoader {
  constructor(
    private readonly timeMapRepository: TimeMapRepository,
    private readonly waybackMachineService: WaybackMachineService,
  ) {}

  async load(): Promise<TimeMap> {
    let timeMap: TimeMap | undefined = await this.timeMapRepository.get();
    if (timeMap) {
      return timeMap;
    }

    // TODO: Make this configurable
    timeMap = await this.waybackMachineService.getTimemap(
      "agile.egloos.com/",
      "^https://agile.egloos.com/[0-9]+$",
    );
    await this.timeMapRepository.save(timeMap);

    return timeMap;
  }
}
