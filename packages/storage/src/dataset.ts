import { DatasetWriter, StorageError } from "@agilestory/core"
import { Effect, FileSystem, Layer } from "effect"

/** 데이터셋을 JSON 파일 하나로 쓴다. */
export const JsonFileDatasetWriter = (outputPath: string) =>
  Layer.effect(DatasetWriter)(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      return {
        write: (posts) =>
          fs
            .writeFileString(outputPath, JSON.stringify(posts))
            .pipe(
              Effect.mapError(
                (cause) =>
                  new StorageError({ key: outputPath, cause, message: "데이터셋 쓰기 실패" }),
              ),
            ),
      }
    }),
  )
