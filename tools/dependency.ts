import { join } from "jsr:@std/path";
import { FileSystemKeyValueStore } from "@/repositories/kv/mod.ts";
import { KVPersistentContentRepository } from "@/repositories/content/mod.ts";
import { KVPersistentTimeMapRepository } from "@/repositories/timemap/mod.ts";
import {
  ContentProcessor,
  TimeMapLoader,
  WaybackMachineServiceImpl,
} from "@/services/mod.ts";
import {
  EmbeddingService,
  OllamaEmbeddingService,
} from "@/services/embedding/mod.ts";
import { ContentLoader } from "@/services/loaders/page.ts";

export async function prepareDependencies() {
  const AGILEDATA_PATH = Deno.env.get("AGILEDATA") || "data";
  const timeMapRepository = new KVPersistentTimeMapRepository(
    await FileSystemKeyValueStore.create(join(AGILEDATA_PATH, "pages")),
  );
  const rawContentRepository = new KVPersistentContentRepository(
    await FileSystemKeyValueStore.create(join(AGILEDATA_PATH, "contents")),
  );
  const contentProcessor = new ContentProcessor();
  const timeMapLoader = new TimeMapLoader(
    timeMapRepository,
    new WaybackMachineServiceImpl(),
  );
  const contentLoader = new ContentLoader(
    rawContentRepository,
    new WaybackMachineServiceImpl(),
  );
  const embeddingService: EmbeddingService = new OllamaEmbeddingService({
    model: "bge-m3",
    truncate: true,
  });

  return {
    timeMapLoader,
    contentLoader,
    contentProcessor,
    embeddingService,
  };
}
