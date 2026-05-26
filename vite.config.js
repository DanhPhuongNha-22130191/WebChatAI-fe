import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

    const env = loadEnv(mode, process.cwd(), '')

    const apiBaseUrl = env.VITE_API_BASE_URL
    if (!apiBaseUrl) {
        console.warn('VITE_API_BASE_URL is not set in environment variables')
    }

    const proxyTarget = apiBaseUrl ? apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') : null

    return {
        plugins: [react()],
        server: {
            ...(proxyTarget && {
                proxy: {
                    '/api': {
                        target: proxyTarget,
                        changeOrigin: true,
                        secure: true,
                        rewrite: (path) => path.replace(/^\/api/, '/api')
                    }
                },
                host: '0.0.0.0',
                port: 5173,
                strictPort: true,
            })
        }
    }
})