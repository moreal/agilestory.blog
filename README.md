# [agilestory.blog]

본 저장소는 `agile.egloos.com` 의 글을 검색하여 읽을 수 있도록 돕는
`agilestory.blog` 사이트의 저장소입니다.

## 프로젝트 구조

이 프로젝트는 Deno monorepo로 구성되어 있습니다:

- **`shared/`**: 공통 라이브러리 및 유틸리티
  - 모델, 리포지토리, 서비스, 인프라 코드 포함
  - 데이터 처리 도구 및 Wayback Machine 연동
- **`astro/`**: 웹 프론트엔드 (Astro + Preact)
  - 사용자 인터페이스 및 검색 기능

## 개발 환경 설정

### 요구사항

- Deno 2.x

### 개발 서버 실행

```bash
# 웹 개발 서버 시작
deno task web:dev

# 데이터 다운로드 도구 실행
deno task tool:download
```

### 프로젝트 빌드

```bash
# 웹사이트 빌드
deno task web:build

# 전체 프로젝트 검사
deno task check
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
