import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://shinki0325.github.io",
  output: "static",
  integrations: [react()]
});
