// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  output: "static",

  // Integrations
  integrations: [tailwind(), preact()],

  // Site configuration for Korean language support
  site: "https://agilestory.blog",
});
