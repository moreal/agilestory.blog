import { configure, getConsoleSink } from "@logtape/logtape";

export function configureLogging() {
  return configure({
    sinks: {
      console: getConsoleSink(),
    },
    loggers: [
      {
        category: "downloader",
        lowestLevel: "debug",
        sinks: ["console"],
      },
    ],
  });
}
