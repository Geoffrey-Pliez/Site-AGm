import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://agmobile.crem.be",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
