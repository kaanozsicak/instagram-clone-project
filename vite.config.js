import { defineConfig } from 'vite';

export default defineConfig({
    define: {
        'process.env': {},
    },
    build: {
        sourcemap: true,
    },
    server: {
        host: true,
        port: 3000,
    },
});
