import type { TimeMap } from "../../models/timemap.ts";
import type { TimeMapRepository } from "../../repositories/timemap/mod.ts";
import type { WaybackMachineService } from "../wayback.ts";

export interface TimeMapLoader {
  load(): Promise<TimeMap | undefined>;
}

export interface TimeMapProvider extends TimeMapLoader {
  load(): Promise<TimeMap>;
}

export interface TimeMapWriter {
  write(timeMap: TimeMap): Promise<void>;
}

export class RepositoryTimeMapLoader implements TimeMapLoader {
  constructor(private readonly timeMapRepository: TimeMapRepository) {}

  async load(): Promise<TimeMap | undefined> {
    return await this.timeMapRepository.get();
  }
}

export class RepositoryTimeMapWriter implements TimeMapWriter {
  constructor(private readonly timeMapRepository: TimeMapRepository) {}

  async write(timeMap: TimeMap): Promise<void> {
    await this.timeMapRepository.save(timeMap);
  }
}

export interface WaybackTimeMapProviderParams {
  url: string;
  pattern: string;
}

export class WaybackTimeMapProvider implements TimeMapProvider {
  constructor(
    private readonly waybackMachineService: WaybackMachineService,
    private readonly params: WaybackTimeMapProviderParams,
  ) {}

  load(): Promise<TimeMap> {
    return this.waybackMachineService.getTimemap(
      this.params.url,
      this.params.pattern,
    );
  }
}

/**
 * Loads a TimeMap from a primary provider and persists it using a writer function.
 * This acts as a decorator, adding persistence behavior to an existing TimeMapProvider.
 */
export class PersistingTimeMapProvider implements TimeMapProvider {
  /**
   * Creates an instance of PersistingTimeMapProvider.
   * @param timeMapProvider The primary provider to load the TimeMap from.
   * @param timeMapWriter A function to write/persist the loaded TimeMap.
   */
  constructor(
    private readonly timeMapProvider: TimeMapProvider,
    private readonly timeMapWriter: TimeMapWriter,
  ) {}

  /**
   * Loads the TimeMap from the underlying provider and then persists it.
   * @returns A promise that resolves with the loaded TimeMap.
   */
  async load(): Promise<TimeMap> {
    const timeMap = await this.timeMapProvider.load();
    await this.timeMapWriter.write(timeMap);
    return timeMap;
  }
}

export class FallbackTimeMapLoader implements TimeMapLoader, TimeMapProvider {
  constructor(private readonly loaders: TimeMapLoader[]) {}

  async load(): Promise<TimeMap> {
    for (const loader of this.loaders) {
      const timeMap = await loader.load();
      if (timeMap) {
        return timeMap;
      }
    }
    throw new Error("Failed to load TimeMap from all loaders.");
  }
}
