import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    allowedHosts:true,
    origin:"281a-2409-40d0-3038-f3e1-31b0-1a0f-ec1d-392f.ngrok-free.app"
  },
  plugins: [react()],
})
