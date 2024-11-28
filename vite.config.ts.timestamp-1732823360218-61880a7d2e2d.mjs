// vite.config.ts
import { defineConfig } from "file:///home/jwestman/Documents/maps-frontend/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/jwestman/Documents/maps-frontend/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { execSync } from "child_process";
import { VitePWA } from "file:///home/jwestman/Documents/maps-frontend/node_modules/vite-plugin-pwa/dist/index.js";
var commitHash = execSync("git rev-parse HEAD").toString().trim();
var vite_config_default = defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash)
  },
  plugins: [
    svelte(),
    VitePWA({
      manifest: {
        name: "Maps",
        theme_color: "#f904a4"
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    /* index.js is going to be big, not much we can do about it, but do
       still complain if it gets much bigger */
    chunkSizeWarningLimit: 1500
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9qd2VzdG1hbi9Eb2N1bWVudHMvbWFwcy1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvandlc3RtYW4vRG9jdW1lbnRzL21hcHMtZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvandlc3RtYW4vRG9jdW1lbnRzL21hcHMtZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5cbmNvbnN0IGNvbW1pdEhhc2ggPSBleGVjU3luYyhcImdpdCByZXYtcGFyc2UgSEVBRFwiKS50b1N0cmluZygpLnRyaW0oKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGRlZmluZToge1xuICAgIF9fQ09NTUlUX0hBU0hfXzogSlNPTi5zdHJpbmdpZnkoY29tbWl0SGFzaCksXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6IFwiTWFwc1wiLFxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjZjkwNGE0XCIsXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICAvKiBpbmRleC5qcyBpcyBnb2luZyB0byBiZSBiaWcsIG5vdCBtdWNoIHdlIGNhbiBkbyBhYm91dCBpdCwgYnV0IGRvXG4gICAgICAgc3RpbGwgY29tcGxhaW4gaWYgaXQgZ2V0cyBtdWNoIGJpZ2dlciAqL1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTUwMCxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUyxTQUFTLG9CQUFvQjtBQUNqVSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxlQUFlO0FBRXhCLElBQU0sYUFBYSxTQUFTLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxLQUFLO0FBR2xFLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLGlCQUFpQixLQUFLLFVBQVUsVUFBVTtBQUFBLEVBQzVDO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsTUFDTixVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQTtBQUFBLElBR0wsdUJBQXVCO0FBQUEsRUFDekI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
