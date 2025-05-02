import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://restcountries.com/v3.1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false, // añade esto si tienes problemas con SSL
      },
    },
  },
  base: "/",
  // Configuración para Vercel
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
