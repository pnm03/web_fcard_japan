import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        widget: resolve(__dirname, 'widget.html'),
        widgetPrompt: resolve(__dirname, 'widget-prompt.html'),
        widgetInput: resolve(__dirname, 'widget-input.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      ignored: ['**/release/**', '**/dist/**', '**/src-tauri/target/**']
    }
  }
});
