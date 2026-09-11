import type { StorageError } from "@agilestory/core"
import { Context, type Effect, type Option } from "effect"

/** JSON 직렬화 가능한 값을 키로 저장하는 최소 KV 스토어. */
export class KeyValueStore extends Context.Service<
  KeyValueStore,
  {
    readonly get: (key: string) => Effect.Effect<Option.Option<unknown>, StorageError>
    readonly set: (key: string, value: unknown) => Effect.Effect<void, StorageError>
  }
>()("@agilestory/storage/KeyValueStore") {}
