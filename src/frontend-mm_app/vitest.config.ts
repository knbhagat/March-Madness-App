import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true, // This enables global functions like describe, it, expect
        environment: 'jsdom', // To simulate a browser environment
        setupFiles: ['./vitest.setup.ts']
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});