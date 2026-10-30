import { defineConfig } from 'vite';

// base 用相对路径：electron 以 file:// 加载同一份 dist 时不能有前导 /
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: {
    port: 5173,
    open: false,
  },
});
