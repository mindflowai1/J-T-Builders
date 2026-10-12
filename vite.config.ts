import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: isSsrBuild
    ? {}
    : {
        // scripts/build-blog.mjs reads the manifest to find the hashed files
        // of the blog entry, then deletes it from dist.
        manifest: true,
        // The admin bundle (rich text editor + Supabase) is ~650 kB and only
        // ever loads on /admin/; the public pages stay small.
        chunkSizeWarningLimit: 700,
        rollupOptions: {
          input: {
            main: 'index.html',
            admin: 'admin/index.html',
            // JS-only entry: the static blog pages are written by the script
            blog: 'src/blog/client.tsx',
          },
        },
      },
}))
