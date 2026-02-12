import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {resolve} from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        'meet-observer': resolve(__dirname, 'src/content/meet-observer.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if(chunkInfo.name === 'background' || chunkInfo.name === 'meet-observer') return '[name].js';
          return '[name].[hash].js';
        }
      }
    }
  }
})
