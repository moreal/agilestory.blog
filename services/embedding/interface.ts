export interface EmbeddingService {
  getEmbeddings(text: string): Promise<number[]>;
}
