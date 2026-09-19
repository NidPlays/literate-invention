import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The shop is deployed alongside the valentine app, under /literate-invention/mugshop/.
export default defineConfig({
  plugins: [react()],
  base: '/literate-invention/mugshop/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
