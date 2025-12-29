// testSetup.js

// Importa la función afterEach de Vitest para ejecutar código después de cada test
import { afterEach } from 'vitest'
// Importa la función cleanup de @testing-library/react para limpiar el DOM después de cada test
import { cleanup } from '@testing-library/react'
// Importa los matchers extendidos de @testing-library/jest-dom para usar con Vitest
// Esto te permite usar aserciones como .toBeInTheDocument(), .toHaveTextContent(), etc.
import '@testing-library/jest-dom/vitest'

// Configura un hook que se ejecuta después de cada test
afterEach(() => {
  // Llama a cleanup() para resetear el DOM simulado (jsdom) después de cada prueba.
  // Esto es crucial para evitar que los efectos de una prueba afecten a la siguiente.
  cleanup()
})
