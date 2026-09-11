# CLAUDE.md

Guidance for AI coding agents working in this repository.

## Toolchain

- Node.js 24 + Yarn 4 (`nodeLinker: pnpm`). Enter the dev shell with `nix develop` (or direnv `use flake`).
- All logic is written with **Effect v4 (rc)**: services are `Context.Service` classes, wiring is `Layer`,
  validation is `Schema`, errors are `Data.TaggedError`.
- Relative imports use the `.ts` extension (`rewriteRelativeImportExtensions`), so the CLI runs on plain
  Node type stripping without a build step.

## Commands

```bash
nix develop                       # dev shell (node, yarn)
yarn install
yarn typecheck                    # tsc -b over all packages
yarn test                         # vitest (+ @effect/vitest)
yarn lint / yarn fmt              # biome
yarn cli --help                   # data pipeline CLI
AGILEDATA=/path yarn cli sync     # refresh snapshot list from Internet Archive
AGILEDATA=/path yarn cli collect  # fetch + parse every post into the cache
AGILEDATA=/path yarn cli export data.json
yarn web dev | build | check      # apps/agilestory.blog (Astro, reads ./data.json)
```

## Layout

```
packages/core       models (Schema), ports (Context.Service), errors — no external deps
packages/wayback    Internet Archive adapter: ArchiveIndex, ArchiveFetcher (HttpClient + retry)
packages/parser     HTML → RawPost (EgloosPostParser via linkedom)
packages/sanitizer  RawPost → RawPost body rules; rewriteArchivedLinks for rendering
packages/storage    KeyValueStore (fs / memory), Snapshot/Post repositories, JSON dataset writer
packages/pipeline   use cases: syncSnapshots, collectPost(s) with snapshot fallback, exportDataset
packages/cli        Effect CLI entry (`agilestory sync|collect|export`), production Layer wiring
packages/web        Astro integration `agilestoryWeb(options)`: pages, components, styles, tailwind
apps/agilestory.blog  thin site: astro.config passes site info + `egloos("agile")` + dataset path
docs/superpowers/specs  design documents
```

Dependency direction: `cli → pipeline → {wayback, parser, sanitizer, storage} → core`; `web → core, sanitizer`; `apps/* → web, core`.
To support another blog service, add a `PostParser` implementation and a `Blog` helper like `egloos(id)` in core.
To publish another archive site, create a new `apps/<domain>` with only an `astro.config.mjs`.

## Conventions

- Strict TypeScript, no `any`. Prefer `Effect.gen` / `Effect.fn`; keep pure functions pure.
- Tests live next to code as `*.test.ts`, descriptions in Korean
  (e.g. `get()은 KeyValueStore에서 RawPost를 가져와야 합니다.`), no spies — use fake Layers and
  `InMemoryKeyValueStore`.
- External calls: retry only transient failures (504, transport errors); fall back to alternative
  snapshots when parsing fails.
- Content rights belong to the original authors; code is AGPL-3.0.
