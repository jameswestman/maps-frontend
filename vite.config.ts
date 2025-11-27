import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { execSync } from "child_process";
import { VitePWA } from "vite-plugin-pwa";

const commitHash = execSync("git rev-parse HEAD").toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    svelte(),
    VitePWA({
      manifest: {
        name: "Maps",
        theme_color: "#f904a4",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    /* index.js is going to be big, not much we can do about it, but do
       still complain if it gets much bigger */
    chunkSizeWarningLimit: 1500,
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
});
