import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The SOC console (NIDS-frontend) runs on 5173; this app uses 5174.
    port: 5174,
  },
  preview: {
    port: 5174,
  },
})
