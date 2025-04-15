import {
  type EmbeddingService,
  OllamaEmbeddingService,
} from "@/services/embedding/mod.ts";

export const embeddingService: EmbeddingService = new OllamaEmbeddingService({
  model: "bge-m3",
  truncate: true,
});
