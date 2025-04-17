import { getLogger } from "@logtape/logtape";
import { configureLogging } from "./logging.ts";
import { Dependencies, prepareDependencies } from "./dependency.ts";
import { db } from "@/db.ts";
import { postsTable } from "@/schema.ts";
import {
  buildArchiveUrl,
  ContentProcessor,
  ContentProvider,
  TimeMapLoader,
} from "@/services/mod.ts";
import { TimeMap } from "@/models/mod.ts";
import { EmbeddingService } from "@/services/embedding/mod.ts";
import { TimeMapProvider } from "@/services/loaders/timemap.ts";

// Interface for command handlers
export interface CommandHandler {
  execute(args: string[]): Promise<void>;
}

// Download command handler
export class DownloadCommandHandler implements CommandHandler {
  private logger = getLogger(["downloader", "main", "download"]);

  constructor(
    private timeMapProvider: TimeMapProvider,
    private contentProvider: ContentProvider,
    private contentProcessor: ContentProcessor,
  ) {}

  async execute(_args: string[]): Promise<void> {
    const timeMap = await this.timeMapProvider.load();

    this.logger.info`Loaded ${timeMap.length} pages.`;
    for (const entry of timeMap) {
      try {
        const content = this.contentProcessor.process(
          await this.contentProvider.load(entry),
        );
        this.logger.info(
          `Loaded page {timestamp} {url} with title {title} {body}`,
          {
            url: entry.url,
            title: content.title,
            timestamp: entry.timestamp,
            body: content.body,
          },
        );
      } catch (error) {
        this.logger
          .error`Failed to load page ${entry.url} at ${entry.timestamp}: ${error}`;
      }
    }

    this.logger.info`Finished loading pages.`;
  }
}

// Dump file command handler
export class DumpFileCommandHandler implements CommandHandler {
  private logger = getLogger(["downloader", "main", "dump-file"]);

  constructor(
    private timeMapProvider: TimeMapProvider,
    private contentProvider: ContentProvider,
    private contentProcessor: ContentProcessor,
  ) {}

  async execute(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.error`Missing output file path`;
      Deno.exit(1);
    }

    const outputPath = args[0];
    const timeMap = await this.timeMapProvider.load();
    this.logger.info`Loaded ${timeMap.length} pages for dump.`;

    try {
      const allContents = await Promise.all(
        timeMap.map((entry) =>
          this.contentProvider.load(entry)
            .then((content) => this.contentProcessor.process(content))
            .catch((error) => {
              this.logger
                .error`Failed to load content for ${entry.url}: ${error}`;
              return null;
            })
        ),
      );

      const validContents = allContents.filter((content) => content !== null);
      this.logger
        .info`Successfully processed ${validContents.length} out of ${timeMap.length} pages.`;

      Deno.writeTextFileSync(
        outputPath,
        JSON.stringify(
          validContents.toSorted((a, b) =>
            Number(a?.createdAt || 0) - Number(b?.createdAt || 0)
          ),
        ),
      );

      this.logger.info`Dumped content to ${outputPath}`;
    } catch (error) {
      this.logger.error`Failed to dump content: ${error}`;
      Deno.exit(1);
    }
  }
}

// Dump to database command handler
export class DumpDatabaseCommandHandler implements CommandHandler {
  private logger = getLogger(["downloader", "main", "dump-db"]);
  private batchSize = 50; // Process in batches for better performance

  constructor(
    private timeMapProvider: TimeMapProvider,
    private contentProvider: ContentProvider,
    private contentProcessor: ContentProcessor,
    private embeddingService: EmbeddingService,
  ) {}

  async execute(_args: string[]): Promise<void> {
    const timeMap = await this.timeMapProvider.load();
    this.logger.info`Loaded ${timeMap.length} pages for database import.`;

    // Process content and prepare for database in batches
    for (let i = 0; i < timeMap.length; i += this.batchSize) {
      this.logger.info`Processing batch ${i / this.batchSize + 1} of ${
        Math.ceil(timeMap.length / this.batchSize)
      }`;

      const batch = timeMap.slice(i, i + this.batchSize);
      const contents = await this.processContentBatch(batch);

      if (contents.length > 0) {
        try {
          await db.insert(postsTable).values(contents).execute();
          this.logger
            .info`Inserted ${contents.length} records into the database.`;
        } catch (error) {
          this.logger.error`Failed to insert batch into database: ${error}`;
        }
      }
    }

    this.logger.info`Database import completed.`;
  }

  private async processContentBatch(entries: TimeMap) {
    const insertValues = [];

    const processedContents = await Promise.all(
      entries.map((entry) =>
        this.contentProvider.load(entry)
          .then((content) => this.contentProcessor.process(content))
          .then((processed) => ({
            id: Number(entry.url.match(/(\d+)$/)?.[0]),
            internetArchiveUrl: buildArchiveUrl(entry),
            ...processed,
          }))
          .catch((error) => {
            this.logger
              .error`Failed to process content for ${entry.url}: ${error}`;
            return null;
          })
      ),
    );

    for (const content of processedContents) {
      if (!content) continue;

      try {
        const strippedBody = this.prepareTextForEmbedding(content.body);
        const embedding = await this.embeddingService.getEmbeddings(
          strippedBody,
        );

        insertValues.push({
          id: content.id,
          title: content.title,
          body: content.body,
          createdAt: content.createdAt !== null
            ? new Date(content.createdAt)
            : null,
          internetArchiveUrl: content.internetArchiveUrl,
          embedding,
        });
      } catch (error) {
        this.logger
          .error`Failed to generate embedding for ${content.id}: ${error}`;
      }
    }

    return insertValues;
  }

  private prepareTextForEmbedding(text: string): string {
    return text
      .replaceAll("�", "")
      .replaceAll(/<[^>]*>/g, " ")
      .replaceAll(/(https?:\/\/[^\s]+)/g, "")
      .replaceAll("&nbsp;", " ")
      .replaceAll(/\s+/g, " ")
      .trim();
  }
}

// Command factory to create appropriate handlers
export class CommandFactory {
  static createHandler(
    command: string,
    dependencies: Dependencies,
  ): CommandHandler {
    switch (command) {
      case "download":
        return new DownloadCommandHandler(
          dependencies.timeMapProvider,
          dependencies.contentProvider,
          dependencies.contentProcessor,
        );
      case "dump-file":
        return new DumpFileCommandHandler(
          dependencies.timeMapProvider,
          dependencies.contentProvider,
          dependencies.contentProcessor,
        );
      case "dump-db":
        return new DumpDatabaseCommandHandler(
          dependencies.timeMapProvider,
          dependencies.contentProvider,
          dependencies.contentProcessor,
          dependencies.embeddingService,
        );
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
}

async function main() {
  await configureLogging();
  const baseLogger = getLogger(["downloader", "main"]);

  try {
    if (Deno.args.length < 1) {
      baseLogger.error`Invalid arguments: ${Deno.args.join(", ")}`;
      printUsage();
      Deno.exit(1);
    }

    const command = Deno.args[0];
    const commandArgs = Deno.args.slice(1);

    const dependencies = await prepareDependencies();

    try {
      const handler = CommandFactory.createHandler(command, dependencies);
      await handler.execute(commandArgs);
    } catch (error: unknown) {
      if (
        error instanceof Error && error.message.startsWith("Unknown command:")
      ) {
        baseLogger.error`${error.message}`;
        printUsage();
      } else {
        baseLogger.error`Error executing command: ${error}`;
      }
      Deno.exit(1);
    }
  } catch (error) {
    baseLogger.error`Unhandled error: ${error}`;
    Deno.exit(1);
  }
}

function printUsage() {
  console.log(`
Usage: deno run -A tools/main.ts <command> [args]

Commands:
  download                Download and process all pages from the Wayback Machine
  dump-file <filepath>    Dump processed content to a JSON file
  dump-db                 Import processed content into the database
`);
}

await main();
