import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),

        dashboard: resolve(__dirname, 'pages/dashboard.html'),

        clientes: resolve(__dirname, 'pages/Clientes/clientes.html'),

        facturacion: resolve(__dirname, 'pages/Facturacion/facturacion.html'),

        reservas: resolve(__dirname, 'pages/Reservas/reservas.html'),

        habitaciones: resolve(__dirname, 'pages/habitaciones/habitaciones.html')
      }
    }
  }
})