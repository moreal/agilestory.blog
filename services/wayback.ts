import { getLogger } from "@logtape/logtape";
import {
  parseRawTimeMap,
  parseTimeMap,
  type TimeMap,
  type TimeMapEntry,
} from "../models/timemap.ts";
import { delay } from "@std/async/delay";

export interface HttpClient {
  fetch(url: string): Promise<Response>;
}

export class DefaultHttpClient implements HttpClient {
  async fetch(url: string): Promise<Response> {
    return await fetch(url);
  }
}

// Interface for the WaybackMachine service
export interface WaybackMachineService {
  getTimemap(url: string, pattern: string): Promise<TimeMap>;
  getArchive(page: TimeMapEntry): Promise<string>;
  listAvailableArchives(url: string): Promise<TimeMap>;
}

export function buildArchiveUrl(
  { timestamp, url }: TimeMapEntry,
): string {
  return `https://web.archive.org/web/${timestamp}/${url}`;
}

// Configuration for the Wayback Machine service
export interface WaybackMachineConfig {
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
}

// Actual implementation of the Wayback Machine service
export class WaybackMachineServiceImpl implements WaybackMachineService {
  private readonly logger = getLogger([
    "downloader",
    "wayback-machine-service",
  ]);
  private readonly httpClient: HttpClient;
  private readonly config: Required<WaybackMachineConfig>;

  constructor(
    httpClient?: HttpClient,
    config?: WaybackMachineConfig,
  ) {
    this.httpClient = httpClient || new DefaultHttpClient();
    this.config = {
      maxRetries: config?.maxRetries || 3,
      retryDelay: config?.retryDelay || 2000,
    };
  }

  async getTimemap(url: string, pattern: string): Promise<TimeMap> {
    this.logger.debug(`Called getTimemap({url}, {pattern})`, { url, pattern });

    const timeMapUrl = this.buildTimeMapUrl(url, pattern);
    const response = await this.fetchWithRetry(timeMapUrl);

    try {
      const data = await response.json();
      const rawTimeMap = parseRawTimeMap((data as unknown[]).slice(1));
      return rawTimeMap.map(([timestamp, url]) => ({
        timestamp,
        url,
      }));
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error("Unexpected error");
      }
      this.logger.error(`Failed to parse timemap for ${url}: ${error}`);
      throw new Error(`Failed to parse timemap for ${url}: ${error.message}`);
    }
  }

  async getArchive(page: TimeMapEntry): Promise<string> {
    const { timestamp, url } = page;
    this.logger.debug(`Called getArchive({timestamp}, {url})`, {
      timestamp,
      url,
    });

    const archiveUrl = buildArchiveUrl(page);
    const response = await this.fetchWithRetry(archiveUrl);

    try {
      const contentType = response.headers.get("content-type");
      const charsetMatch = contentType?.match(/charset=([^;]+)/i);
      const charset = charsetMatch ? charsetMatch[1] : null;
      const decoder = new TextDecoder(charset || "utf-8");
      const buffer = await response.arrayBuffer();
      return decoder.decode(buffer);
    } catch (error) {
      this.#mustError(error);

      this.logger.error(
        `Failed to decode archive content for ${url} at ${timestamp}: ${error}`,
      );
      throw new Error(
        `Failed to decode archive content for ${url} at ${timestamp}: ${error.message}`,
      );
    }
  }

  async listAvailableArchives(url: string): Promise<TimeMap> {
    this.logger.debug(`Called listAvailableArchives({url})`, { url });

    const availableArchiveUrl = this.buildAvailableArchivesUrl(url);
    const response = await this.fetchWithRetry(availableArchiveUrl);

    try {
      const data = await response.json();
      this.logger.debug(`Inspect archives list: {data}`, { data });
      return parseRawTimeMap(data.slice(1)).map(([timestamp, url]) => ({
        timestamp,
        url,
      }));
    } catch (error) {
      this.#mustError(error);

      this.logger.error(
        `Failed to parse available archives for ${url}: ${error}`,
      );
      throw new Error(
        `Failed to parse available archives for ${url}: ${error.message}`,
      );
    }
  }

  // Private methods to handle URL generation and retries
  private buildTimeMapUrl(url: string, pattern: string): string {
    return `https://web.archive.org/web/timemap/json?url=${
      encodeURIComponent(url)
    }&fl=endtimestamp,original&matchType=prefix&filter=statuscode:200&filter=original:${
      encodeURIComponent(pattern)
    }&filter=mimetype:text/html&collapse=urlkey&limit=150000`;
  }

  private buildAvailableArchivesUrl(url: string): string {
    return `https://web.archive.org/cdx/search/cdx?url=${url}&output=json&fl=timestamp,original&filter=mimetype:text/html&filter=statuscode:200`;
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.config.maxRetries) {
      try {
        const response = await this.httpClient.fetch(url);

        // If response is 504 Gateway Timeout, retry
        if (response.status === 504) {
          this.logger.warn(
            `Gateway timeout on attempt ${
              attempts + 1
            } for ${url}, retrying...`,
          );
          attempts++;
          await delay(this.config.retryDelay);
          continue;
        }

        // If response is not OK, throw error
        if (!response.ok) {
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`,
          );
        }

        return response;
      } catch (error) {
        this.#mustError(error);

        lastError = error;
        this.logger.warn(
          `Fetch error on attempt ${attempts + 1} for ${url}: ${error.message}`,
        );
        attempts++;

        if (attempts < this.config.maxRetries) {
          await delay(this.config.retryDelay);
        }
      }
    }

    throw lastError ||
      new Error(
        `Failed to fetch ${url} after ${this.config.maxRetries} attempts`,
      );
  }

  #mustError(
    error: unknown,
  ): asserts error is Error {
    if (!(error instanceof Error)) {
      throw new Error("Unexpected error");
    }
  }
}
