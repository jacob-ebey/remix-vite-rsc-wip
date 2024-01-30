import {
  unstable_vitePlugin as remix,
  unstable_viteRSCPlugin as remixRSC,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), remixRSC(), tsconfigPaths()],
});
