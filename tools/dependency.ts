import { join } from "jsr:@std/path";
import { FileKeyValueStore } from "@/repositories/kv/mod.ts";
import { KVPersistentRawContentRepository } from "@/repositories/raw-content/mod.ts";
import { KVPersistentRawPagesRepository } from "@/repositories/raw-pages/mod.ts";
import {
  RawContentLoader,
  RawContentProcessor,
  RawPagesLoader,
  WaybackMachineServiceImpl,
} from "@/services/mod.ts";
import {
  EmbeddingService,
  OllamaEmbeddingService,
} from "@/services/embedding/mod.ts";

export async function prepareDependencies() {
  const AGILEDATA_PATH = Deno.env.get("AGILEDATA") || "data";
  const rawPagesRepository = new KVPersistentRawPagesRepository(
    await FileKeyValueStore.create(join(AGILEDATA_PATH, "pages")),
  );
  const rawContentRepository = new KVPersistentRawContentRepository(
    await FileKeyValueStore.create(join(AGILEDATA_PATH, "contents")),
  );
  const rawContentProcessor = new RawContentProcessor();
  const rawPagesLoader = new RawPagesLoader(
    rawPagesRepository,
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
    rawPagesLoader,
    rawContentLoader,
    rawContentProcessor,
    embeddingService,
  };
}
