/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    // The page content (src/content/content.json, ~100 kB gzipped) is data, kept in its own
    // long-cacheable chunk; it is larger than the default warning size by design.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'content', test: /content\.json/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
})
