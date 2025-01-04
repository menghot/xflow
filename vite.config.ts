import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    base: './', // Set the base path dynamically
    plugins: [
        react(),
        // monacoEditorPlugin(
        //     {
        //         publicPath: '/'
        //     }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined, // Ensure all dependencies are bundled
            },
        },
    },
});

