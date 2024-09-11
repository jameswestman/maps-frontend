import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { execSync } from "child_process";

const commitHash = execSync("git rev-parse HEAD").toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [svelte()],
});
