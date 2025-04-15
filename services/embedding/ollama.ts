import { EmbeddingService } from "@/services/embedding/interface.ts";
import { OllamaEmbeddings } from "@langchain/ollama";

export interface OllamaEmbeddingServiceParams {
  model: string;
  truncate?: boolean;
}

export class OllamaEmbeddingService implements EmbeddingService {
  private readonly ollama: OllamaEmbeddings;

  constructor({ model, truncate }: OllamaEmbeddingServiceParams) {
    this.ollama = new OllamaEmbeddings({
      model,
      truncate,
    });
  }

  getEmbeddings(text: string): Promise<number[]> {
    return this.ollama.embedQuery(text);
  }
}
