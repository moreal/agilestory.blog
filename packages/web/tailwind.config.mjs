import { fileURLToPath } from "node:url"

const src = fileURLToPath(new URL("./src", import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [`${src}/**/*.{astro,ts,tsx}`],
}
