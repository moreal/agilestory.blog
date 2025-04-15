import { join } from "jsr:@std/path";
import { FileSystemKeyValueStore } from "@/repositories/kv/mod.ts";
import { KVPersistentRawContentRepository } from "@/repositories/raw-content/mod.ts";
import { KVPersistentTimeMapRepository } from "@/repositories/timemap/mod.ts";
import {
  RawContentLoader,
  RawContentProcessor,
  TimeMapLoader,
  WaybackMachineServiceImpl,
} from "@/services/mod.ts";
import {
  EmbeddingService,
  OllamaEmbeddingService,
} from "@/services/embedding/mod.ts";

export async function prepareDependencies() {
  const AGILEDATA_PATH = Deno.env.get("AGILEDATA") || "data";
  const timeMapRepository = new KVPersistentTimeMapRepository(
    await FileSystemKeyValueStore.create(join(AGILEDATA_PATH, "pages")),
  );
  const rawContentRepository = new KVPersistentRawContentRepository(
    await FileSystemKeyValueStore.create(join(AGILEDATA_PATH, "contents")),
  );
  const rawContentProcessor = new RawContentProcessor();
  const timeMapLoader = new TimeMapLoader(
    timeMapRepository,
    new WaybackMachineServiceImpl(),
  );
  const rawContentLoader = new RawContentLoader(
    rawContentRepository,
    new WaybackMachineServiceImpl(),
  );
  const embeddingService: EmbeddingService = new OllamaEmbeddingService({
    model: "bge-m3",
    truncate: true,
  });

  return {
    timeMapLoader,
    rawContentLoader,
    rawContentProcessor,
    embeddingService,
  };
}
