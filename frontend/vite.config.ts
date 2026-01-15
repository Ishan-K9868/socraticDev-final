import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks - split large dependencies
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-gsap': ['gsap', '@gsap/react'],
                    'vendor-monaco': ['@monaco-editor/react'],
                    'vendor-flow': ['reactflow', '@reactflow/core', '@reactflow/background', '@reactflow/controls'],
                    'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
    },
});
