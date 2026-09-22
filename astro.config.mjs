import { defineConfig } from "astro/config";
import apphosting from "@apphosting/astro-adapter";

export default defineConfig({
  site: "https://agmobile.crem.be",
  output: "server",
  adapter: apphosting({
    mode: "standalone",
  }),
});
