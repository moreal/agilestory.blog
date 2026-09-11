# 본 프로젝트의 시작 동기 및 저장소 아카이브 메시지

이 프로젝트는 이글루스 블로그 서비스가 사업을 종료하면서 원본 사이트에서 읽을 수
없게된 애자일 이야기<sup>agile.egloos.com</sup> 글을 쉽게 찾기 위해
시작하였습니다. 우선 제가 예전에 봤던 글을 찾고 싶었던 동기가 있었는데 그 글은
[더 많은 일을 하면서 더 빨리 하기](https://agilestory.blog/1762301/) 였습니다.
또한 몇몇 분들도 애자일 이야기 블로그의 글을 검색해서 찾고 싶어하는 모습을
지나가다 보았습니다. 하지만 Internet Archive 서비스 특성상 그런걸 지원하지는
않는 것 같았고, 그래서 이 프로젝트를 시작했습니다.

우선 Internet Archive에서 페이지들을 긁어 모으고 간단히 보여주는 것으로
시작하였습니다. 그러다 비슷한 느낌을 가져오고 싶어서 CSS 스타일을 가져오고,
가독성을 위해 너비 및 줄간격을 조정하고, 다음 글로 넘어가는 것이 불편해서 아래
네비게이션 버튼을 추가하였습니다. 그리고 Internet Archive 링크를 첨부하여 원본도
확인할 수 있도록 하였습니다.

이렇게 불편함을 해결하며 글을 읽어갔고, 지금은 애자일 이야기 블로그 글의 글들을
모두 읽어 추가적으로 작업할 동기가 줄어든 상태입니다. 기존에는 Deno Deploy로
배포하게 되면서 비용에 대한 괜한 고민이 있어 신경이 쓰였지만 그것도 Astro로
옮기면서 정적 사이트 빌드 방식으로 변경하여 해결하였습니다. 명확한 동기 없이
진행하는 것은 효율이 떨어진다고 생각이 들어 제 주의력을 위해 아카이브 상태로
돌리고 더 중요하다고 생각이 드는 것을 하려고 합니다. 다만 수정이 필요하신 경우
AGPL-3.0 라이센스이므로 편하게 포크해서 재배포 해주시면 될 것 같습니다.

https://agilestory.blog 도메인은 제가 금전적인 어려움이 있지 않는 이상 계속
유지될 예정입니다.

---

# [agilestory.blog]

본 저장소는 `agile.egloos.com` 의 글을 검색하여 읽을 수 있도록 돕는
`agilestory.blog` 사이트의 저장소입니다.

## 프로젝트 구조

Node.js + Yarn workspaces 모노레포이며, 로직은 [Effect](https://effect.website/) v4 로 작성되어 있습니다.

- **`packages/core`**: 도메인 모델과 모듈 간 인터페이스(port)
- **`packages/wayback`**: Internet Archive 에서 스냅샷 목록과 원문을 가져오는 어댑터
- **`packages/parser`**: 원문 HTML 에서 게시글을 추출 (이글루스 파서)
- **`packages/sanitizer`**: 본문 정제 규칙과 아카이브 링크 재작성
- **`packages/storage`**: 파일/메모리 KV 스토어와 리포지토리
- **`packages/pipeline`**: 동기화 → 수집(대체 스냅샷 폴백) → 내보내기 유스케이스
- **`packages/cli`**: `agilestory sync | collect | export` 명령
- **`packages/web`**: 아카이브 뷰어 Astro 통합(페이지·컴포넌트·스타일)
- **`apps/agilestory.blog`**: 위 통합에 사이트 정보와 이글루스 아이디(`egloos("agile")`)만 넘기는 얇은 앱

설계 문서: `docs/superpowers/specs/`

## 개발 환경 설정

### 요구사항

- [Nix](https://nixos.org/) (flakes) — `nix develop` 로 Node.js 24 와 Yarn 4 가 준비됩니다.
  direnv 를 쓰면 `.envrc` 가 자동으로 셸을 불러옵니다.

### 명령

```bash
nix develop
yarn install

# 데이터 파이프라인 (AGILEDATA: 캐시 디렉터리, 기본값 ./data)
AGILEDATA=/path/to/store yarn cli sync
AGILEDATA=/path/to/store yarn cli collect
AGILEDATA=/path/to/store yarn cli export data.json

# 웹
yarn web dev
yarn web build

# 검사
yarn typecheck && yarn test && yarn lint
```

## 전제

[agilestory.blog](https://agilestory.blog) 사이트에서 보여지는 글을 본래 제가 쓴
글이 절대 아닙니다. [Internet Archive](archive.org)에 아카이빙된 "애자일 이야기"
블로그의 글들을 쉽게 읽고, 검색할 수 있도록 돕는 것이 프로젝트가 하고자 하는
것의 전부입니다. 원 글에 대한 권리를 일체 보유하고 있지 않고 주장하지 않습니다.

## 라이센스

글을 제외한 코드에 대해서는 AGPL-3.0을 따릅니다. 모든 글의 권리는 원작자인
애자일컨설팅에 있습니다.

[agilestory.blog]: https://agilestory.blog
