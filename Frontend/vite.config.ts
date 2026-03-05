import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://gestiloc-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'https://gestiloc-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://gestiloc-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
