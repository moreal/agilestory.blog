import { StorageError } from "@agilestory/core"
import { Effect, FileSystem, Layer, Option, Path } from "effect"
import { KeyValueStore } from "./interface.ts"

/**
 * 디렉터리 하나에 `<encodeURIComponent(key)>.json` 파일로 값을 저장한다.
 * 파일 내용은 `{ "value": ... }` 로 감싸 기존 Deno 버전의 캐시와 호환된다.
 */
export const makeFileSystemKeyValueStore = (directory: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    yield* fs
      .makeDirectory(directory, { recursive: true })
      .pipe(
        Effect.mapError(
          (cause) => new StorageError({ key: directory, cause, message: "mkdir 실패" }),
        ),
      )

    const fileOf = (key: string) => path.join(directory, `${encodeURIComponent(key)}.json`)

    const store: KeyValueStore["Service"] = {
      get: (key) =>
        Effect.gen(function* () {
          const file = fileOf(key)
          const exists = yield* fs.exists(file)
          if (!exists) return Option.none()
          const text = yield* fs.readFileString(file)
          const parsed = JSON.parse(text) as { value?: unknown }
          return Option.fromNullishOr(parsed.value)
        }).pipe(
          Effect.mapError(
            (cause) => new StorageError({ key, cause, message: `읽기 실패: ${key}` }),
          ),
        ),
      set: (key, value) =>
        fs
          .writeFileString(fileOf(key), JSON.stringify({ value }))
          .pipe(
            Effect.mapError(
              (cause) => new StorageError({ key, cause, message: `쓰기 실패: ${key}` }),
            ),
          ),
    }
    return store
  })

export const FileSystemKeyValueStore = (directory: string) =>
  Layer.effect(KeyValueStore)(makeFileSystemKeyValueStore(directory))
