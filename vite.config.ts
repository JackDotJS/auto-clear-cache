import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    solidPlugin(),
    webExtension({
      browser: "firefox"
    })
  ]
});
