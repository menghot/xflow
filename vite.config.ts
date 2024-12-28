import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    console.log(`Vite mode: ${mode}`); // Debugging or logging
  return {
    plugins: [react()],
    base: './',
  };
});
