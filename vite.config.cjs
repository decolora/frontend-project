import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    // to bypass the JWT cookie being blocked "due to user preferences"
    proxy: {
      "/local": {
        target: "http://localhost:8747",
        changeOrigin: true,
        secure: false,
        ws: true
      },
      "/api": {
        target: "https://pretorial-portliest-vertie.ngrok-free.dev",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:8747",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})