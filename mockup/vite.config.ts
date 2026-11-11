import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Mockup UI Android SUSI Connect — tanpa backend, tanpa request jaringan.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
