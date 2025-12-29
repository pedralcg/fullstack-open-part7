import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom', // Usa jsdom para simular el entorno del navegador
    globals: true,        // Permite el uso de test, expect, describe, vi.fn() sin importación explícita
    setupFiles: './testSetup.js', // Ruta a tu archivo de configuración de tests
    // Opcional: Configuración de cobertura si deseas generarla
    coverage: {
      provider: 'v8', // O 'istanbul', según el paquete que tengas instalado
      reporter: ['text', 'json', 'html'], // Formatos de reporte: texto en consola, JSON, HTML
      reportsDirectory: './coverage', // Dónde guardar el informe HTML
    },
  },
})