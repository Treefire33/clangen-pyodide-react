import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { VitePWA } from 'vite-plugin-pwa';

import react from '@vitejs/plugin-react'

const PYODIDE_EXCLUDE = [
  "!**/*.{md,html}",
  "!**/*.d.ts",
  "!**/*.whl",
  "!**/node_modules",
  "!**/package.json",
  "!**/package-lock.json",
];
const DIR = dirname(fileURLToPath(import.meta.url));


export function viteStaticCopyPyodide() {
  const pyodideDir = dirname(fileURLToPath(import.meta.resolve("pyodide")));
  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, "*")].concat(PYODIDE_EXCLUDE),
        dest: "assets",
      },
    ],
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopyPyodide(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ["clangen-simulator-icon.png"],
      manifest: {
        name: "ClanGen Simulator",
        short_name: "ClanGenSim",
        description: "Play ClanGen online in your web browser with no download! Mobile-friendly.",
        theme_color: "#655934",
        background_color: "#4a432b",
        icons: [
          {
            "src": "/public/favicons/web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/public/favicons/web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/public/favicons/web-app-manifest-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/public/favicons/web-app-manifest-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(DIR, "index.html"),
        credits: resolve(DIR, "credits.html"),
        reset: resolve(DIR, "reset.html")
      }
    }
  },
  optimizeDeps: {
    exclude: [
      "pyodide",
    ],
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  },
  worker: {
    format: "es",
  }
})
