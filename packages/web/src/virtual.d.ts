declare module "virtual:agilestory-web/config" {
  const config: import("./integration.ts").SiteConfig
  export default config
}

declare module "virtual:agilestory-web/dataset" {
  const dataset: unknown
  export default dataset
}
