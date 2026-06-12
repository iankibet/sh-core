import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.js',
            name: 'ShCore',
            formats: ['es', 'cjs'],
            fileName: (format) => `sh-core.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'pinia', 'vue-router', 'axios', 'sweetalert2', 'luxon'],
            output: {
                globals: {
                    vue: 'Vue',
                    pinia: 'Pinia'
                }
            }
        }
    }
})
