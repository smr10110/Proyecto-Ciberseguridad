<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Sirve data/results/ desde la raiz del proyecto como archivos estáticos
  publicDir: resolve(__dirname, '../data'),
  server: {
    port: 5173,
    host: '0.0.0.0',
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
})
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RESULTS_DIR = resolve(__dirname, '../data/results')

// Plugin: escanea results/ en tiempo real y expone la lista de repos
function resultsIndexPlugin() {
  return {
    name: 'results-index',
    configureServer(server) {
      server.middlewares.use('/results/_index', (_req, res) => {
        try {
          const files = fs.readdirSync(RESULTS_DIR)
          const repos = [...new Set(
            files
              .filter(f => f.match(/-(grype|codeql|sbom)\.json$/))
              .map(f => f.replace(/-(grype|codeql|sbom)\.json$/, ''))
          )].sort()
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify(repos))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), resultsIndexPlugin()],
  publicDir: resolve(__dirname, '../data'),
  server: {
    port: 5173,
    host: '0.0.0.0',
    fs: {
      allow: [resolve(__dirname, '..')],
    },
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
>>>>>>> main
