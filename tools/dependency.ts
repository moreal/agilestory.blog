import { join } from "jsr:@std/path";
import { FileSystemKeyValueStore } from "@/infra/storage/kv/mod.ts";
import {
  type ContentRepository,
  KVPersistentContentRepository,
} from "@/repositories/content/mod.ts";
import {
  KVPersistentTimeMapRepository,
  type TimeMapRepository,
} from "@/repositories/timemap/mod.ts";
import {
  ContentProcessor,
  FallbackContentLoader,
  PersistingContentProvider,
  RepositoryContentWriter,
  type WaybackMachineService,
  WaybackMachineServiceImpl,
} from "@/services/mod.ts";
import {
  ContentProvider,
  RepositoryContentLoader,
  WaybackContentLoader,
  WaybackFallbackContentLoader,
} from "@/services/loaders/page.ts";
import {
  FallbackTimeMapLoader,
  PersistingTimeMapProvider,
  RepositoryTimeMapLoader,
  RepositoryTimeMapWriter,
  TimeMapProvider,
  WaybackTimeMapProvider,
} from "@/services/loaders/timemap.ts";

// Configuration interface to allow for environment overrides
export interface AppConfig {
  dataPath: string;
}

// Service factory interface for dependency injection
export interface ServiceFactory {
  createTimeMapRepository(): Promise<TimeMapRepository>;
  createContentRepository(): Promise<ContentRepository>;
  createWaybackMachineService(): WaybackMachineService;
  createContentProcessor(): ContentProcessor;
}

// Default implementation of ServiceFactory
export class DefaultServiceFactory implements ServiceFactory {
  constructor(private config: AppConfig) {}

  async createTimeMapRepository(): Promise<TimeMapRepository> {
    return new KVPersistentTimeMapRepository(
      await FileSystemKeyValueStore.create(join(this.config.dataPath, "pages")),
    );
  }

  async createContentRepository(): Promise<ContentRepository> {
    return new KVPersistentContentRepository(
      await FileSystemKeyValueStore.create(
        join(this.config.dataPath, "contents"),
      ),
    );
  }

  createWaybackMachineService(): WaybackMachineService {
    return new WaybackMachineServiceImpl();
  }

  createContentProcessor(): ContentProcessor {
    return new ContentProcessor();
  }
}

// Function to load configuration from environment variables
export function loadConfig(): AppConfig {
  return {
    dataPath: Deno.env.get("AGILEDATA") || "data",
  };
}

export type Dependencies = {
  timeMapProvider: TimeMapProvider;
  contentProvider: ContentProvider;
  contentProcessor: ContentProcessor;
};

// Create the application dependencies
export async function prepareDependencies(
  serviceFactory?: ServiceFactory,
): Promise<Dependencies> {
  // Use provided factory or create default
  const factory = serviceFactory || new DefaultServiceFactory(loadConfig());

  // Create the services
  const timeMapRepository = await factory.createTimeMapRepository();
  const contentRepository = await factory.createContentRepository();
  const waybackService = factory.createWaybackMachineService();
  const contentProcessor = factory.createContentProcessor();

  // Create the providers using the repositories and services
  const timeMapProvider: TimeMapProvider = new FallbackTimeMapLoader(
    [
      new RepositoryTimeMapLoader(timeMapRepository),
      new PersistingTimeMapProvider(
        new WaybackTimeMapProvider(
          waybackService,
          {
            url: "agile.egloos.com/",
            pattern: "^http://agile.egloos.com/[0-9]+$",
          },
        ),
        new RepositoryTimeMapWriter(timeMapRepository),
      ),
    ],
  );

  const contentProvider: ContentProvider = new FallbackContentLoader(
    [
      new RepositoryContentLoader(contentRepository),
      new PersistingContentProvider(
        new FallbackContentLoader(
          [
            new WaybackContentLoader(waybackService),
            new WaybackFallbackContentLoader(
              waybackService,
            ),
          ],
        ),
        new RepositoryContentWriter(contentRepository),
      ),
    ],
  );

  return {
    timeMapProvider,
    contentProvider,
    contentProcessor,
  };
}
