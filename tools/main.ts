import { getLogger } from "@logtape/logtape";
import { configureLogging } from "./logging.ts";
import { Dependencies, prepareDependencies } from "./dependency.ts";
import {
  buildArchiveUrl,
  ContentProcessor,
  ContentProvider,
} from "@/services/mod.ts";
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

    await Promise.all(timeMap.map(async (entry) => {
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

        throw error;
      }
    }));

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
            .then((processed) => ({
              id: Number(entry.url.match(/(\d+)$/)?.[0]),
              internetArchiveUrl: buildArchiveUrl(entry),
              ...processed,
            }))
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
`);
}

await main();
