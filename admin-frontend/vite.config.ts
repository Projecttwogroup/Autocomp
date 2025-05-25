import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  server: {
    host: "::",
    port: 8081,
    https: {},
  },
  plugins: [
    react(),
    mkcert(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
