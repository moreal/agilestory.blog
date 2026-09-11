import { fileURLToPath } from "node:url"
import type { Blog } from "@agilestory/core"
import preact from "@astrojs/preact"
import type { AstroIntegration } from "astro"
import tailwindcss from "tailwindcss"

export type { Blog }

/** 아카이브 뷰어 사이트 하나를 정의하는 옵션. */
export interface SiteOptions {
  /** 사이트 제목. 탭 제목과 헤더에 쓰인다. */
  readonly title: string
  /** 사이트 운영자 표기. */
  readonly author: string
  /** 코드 저장소 링크. */
  readonly githubUrl: string
  /** 페이지 하단 저작권·출처 안내(HTML 허용). */
  readonly notice: string
  /** 원본 블로그. `egloos("agile")` 처럼 core 의 헬퍼로 만든다. */
  readonly blog: Blog
  /** 아카이브 래핑을 벗겨 원본 그대로 연결할 외부 도메인 prefix. */
  readonly allowedLinkPrefixes?: ReadonlyArray<string>
  /** 게시글 데이터셋(data.json) 경로. 앱 루트 기준 상대 경로 또는 절대 경로. */
  readonly dataset: string
  readonly messages?: {
    readonly previousPost?: string
    readonly nextPost?: string
  }
}

/** 페이지에서 가상 모듈로 읽는 설정. SiteOptions 에서 dataset 경로만 뺀 것. */
export interface SiteConfig {
  readonly title: string
  readonly author: string
  readonly githubUrl: string
  readonly notice: string
  readonly origin: string
  readonly allowedLinkPrefixes: ReadonlyArray<string>
  readonly messages: { readonly previousPost: string; readonly nextPost: string }
}

export const CONFIG_MODULE = "virtual:agilestory-web/config"
export const DATASET_MODULE = "virtual:agilestory-web/dataset"

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const virtualModules = (config: SiteConfig, datasetPath: string) => {
  const modules: Record<string, string> = {
    [CONFIG_MODULE]: `export default ${JSON.stringify(config)}`,
    [DATASET_MODULE]: `export { default } from ${JSON.stringify(datasetPath)}`,
  }
  return {
    name: "agilestory-web:virtual",
    resolveId: (id: string) => (id in modules ? `\0${id}` : undefined),
    load: (id: string) => (id.startsWith("\0") ? modules[id.slice(1)] : undefined),
  }
}

/**
 * 아카이브 뷰어 Astro 통합. 페이지·컴포넌트·스타일을 모두 제공하므로
 * 앱은 이 통합에 사이트 정보만 넘기면 된다.
 */
export const agilestoryWeb = (options: SiteOptions): AstroIntegration => ({
  name: "@agilestory/web",
  hooks: {
    "astro:config:setup": ({ config, updateConfig, injectRoute }) => {
      const siteConfig: SiteConfig = {
        title: options.title,
        author: options.author,
        githubUrl: options.githubUrl,
        notice: options.notice,
        origin: options.blog.origin,
        allowedLinkPrefixes: options.allowedLinkPrefixes ?? [],
        messages: {
          previousPost: options.messages?.previousPost ?? "이전 글",
          nextPost: options.messages?.nextPost ?? "다음 글",
        },
      }
      const datasetPath = fileURLToPath(new URL(options.dataset, config.root))

      updateConfig({
        integrations: [preact()],
        vite: {
          plugins: [virtualModules(siteConfig, datasetPath)],
          // Tailwind 설정과 콘텐츠 경로는 이 패키지 안에 있으므로 PostCSS 플러그인을 직접 넣는다.
          css: { postcss: { plugins: [tailwindcss({ config: here("../tailwind.config.mjs") })] } },
        },
      })

      injectRoute({ pattern: "/", entrypoint: here("./pages/index.astro") })
      injectRoute({ pattern: "/[id]", entrypoint: here("./pages/[id].astro") })
      injectRoute({ pattern: "/search", entrypoint: here("./pages/search.astro") })
      injectRoute({ pattern: "/404", entrypoint: here("./pages/404.astro") })
    },
  },
})

export default agilestoryWeb
