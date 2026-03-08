import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.VITE_APP_BASE || "/";

export default defineConfig({
  plugins: [react()],
  base,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js"
  }
});
