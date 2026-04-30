// Configuracao do Vite para compilar o frontend React durante desenvolvimento e build.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
