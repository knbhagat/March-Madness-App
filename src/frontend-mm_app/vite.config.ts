import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // 🔑 allow access from external hosts
    allowedHosts: [
      "frontend-e4ce.onrender.com", // 🔑 allow your Render frontend domain
    ],
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
