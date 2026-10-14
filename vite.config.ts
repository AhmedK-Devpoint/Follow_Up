import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // L'URI de redirection Microsoft Entra est liée à ce port : on refuse d'en changer.
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        // Pont de redirection requis par MSAL v5 pour les connexions popup et silencieuses.
        redirect: 'redirect.html',
      },
    },
  },
});
