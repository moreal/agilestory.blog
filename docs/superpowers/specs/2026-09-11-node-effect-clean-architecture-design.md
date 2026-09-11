# agilestory.blog — Node.js + Effect v4 클린 아키텍처 재설계

날짜: 2026-09-11

## 목표

- Deno 런타임에서 벗어나 Node.js + Yarn(nodeLinker: pnpm) + Nix 개발환경으로 이전한다.
- 로직을 Effect v4(rc)로 작성한다. 서비스는 `Context.Service`, 조립은 `Layer`, 검증은 `Schema`.
- 파이프라인을 독립 모듈로 분리하고, 모듈 간 인터페이스(port)를 `packages/core`에 모아
  이글루스 외 다른 블로그/아카이브 소스로도 확장 가능하게 한다.

## 모듈 구조 (Yarn workspaces)

```
packages/core       도메인 모델(Schema) + 포트 인터페이스 + 도메인 에러. 외부 의존성 없음.
packages/wayback    Internet Archive 어댑터. ArchiveIndex / ArchiveFetcher 포트 구현.
packages/parser     HTML → RawPost. PostParser 포트 구현 (egloos 파서, 확장 가능).
packages/sanitizer  RawPost → Post 정제. 규칙(rule) 조합 파이프라인 + 링크 재작성.
packages/storage    KeyValueStore(fs/memory) + Snapshot/Post 리포지토리 구현.
packages/pipeline   유스케이스: 스냅샷 목록 동기화, 포스트 수집(캐시→아카이브→대체 스냅샷 폴백), 데이터셋 내보내기.
packages/cli        Effect CLI 진입점. `agilestory sync`, `agilestory export <path>`.
packages/web        Astro 통합 `agilestoryWeb(options)`. 페이지·컴포넌트·스타일·Tailwind 설정을 모두 포함.
apps/agilestory.blog  얇은 사이트. astro.config 에서 사이트 정보 + `egloos("agile")` + data.json 경로만 지정.
```

의존 방향: `cli → pipeline → (wayback | parser | sanitizer | storage) → core`. `web → core, sanitizer`, `apps/* → web, core`.

`packages/web` 은 가상 모듈(`virtual:agilestory-web/config`, `.../dataset`)로 앱 설정과 데이터셋을 페이지에 전달한다.
렌더러(preact)만은 Astro 가 앱 루트 기준으로 해석하므로 앱이 직접 의존한다.

## 도메인 모델 (`packages/core`)

- `Snapshot { timestamp, url }` — 아카이브 스냅샷 한 건.
- `ArchivedDocument { snapshot, html }` — 가져온 원문.
- `RawPost { title, body, createdAt: string | null }` — 파싱 직후, 정제 전.
- `Post { id, sourceUrl, archiveUrl, title, body, createdAt }` — 정제 완료, 데이터셋 단위.
- `Dataset = ReadonlyArray<Post>` — data.json 형식. 기존 data.json 과 필드 호환(`internetArchiveUrl` 유지).
- `ArchiveSource { url, pattern }` — 수집 대상 정의(이글루스: `agile.egloos.com/`, `^http://agile.egloos.com/[0-9]+$`).

## 포트 (`packages/core/ports`)

| 포트 | 시그니처 | 구현 |
| --- | --- | --- |
| `ArchiveIndex` | `list(source) → Effect<Snapshot[], IndexError>` / `snapshotsOf(url) → Effect<Snapshot[], IndexError>` | wayback |
| `ArchiveFetcher` | `fetch(snapshot) → Effect<ArchivedDocument, FetchError>` | wayback |
| `PostParser` | `parse(doc) → Effect<RawPost, ParseError>` | parser (egloos) |
| `PostSanitizer` | `sanitize(raw) → RawPost` (순수) | sanitizer |
| `SnapshotRepository` | `get(source) → Effect<Option<Snapshot[]>>`, `save(source, snapshots)` | storage |
| `PostRepository` | `get(url) → Effect<Option<RawPost>>`, `save(url, raw)` | storage |
| `KeyValueStore` | `get(key) → Effect<Option<unknown>>`, `set(key, value)` | storage (fs, memory) |

에러는 `Data.TaggedError` 로 정의하고 `_tag` 로 분기한다. 네트워크 재시도는 wayback 어댑터에서
`Effect.retry`(지수 백오프, 504/전송 오류만 재시도)로 처리한다.

## 데이터 흐름

```
sync:    ArchiveIndex.list(source) ─▶ SnapshotRepository.save
collect: SnapshotRepository.get ─▶ 각 snapshot 에 대해
           PostRepository.get ─(miss)─▶ ArchiveFetcher.fetch ─▶ PostParser.parse
           ─(ParseError)─▶ ArchiveIndex.snapshotsOf(url) 의 다른 스냅샷을 최신순으로 재시도
           ─▶ PostRepository.save
export:  collect 결과 ─▶ PostSanitizer ─▶ Post(id, archiveUrl 부여) ─▶ createdAt 정렬 ─▶ data.json
```

## 개발환경

- `flake.nix`: nodejs_24, yarn-berry, direnv 용 `.envrc`(`use flake`).
- Yarn 4, `.yarnrc.yml` 의 `nodeLinker: pnpm`.
- 테스트: vitest + `@effect/vitest`. 설명은 한국어, spy 사용 금지, InMemory 스토어로 격리.
- 타입체크: 루트 `tsc -b`(project references). 포맷/린트: Biome.
- CI: nix 설치 후 `nix develop -c yarn build`.

## 범위 밖

- 검색 UI 개선, 디자인 변경. 기존 화면은 그대로 옮긴다.
- Deno KV 스토어는 제거한다(사용처 없음).
