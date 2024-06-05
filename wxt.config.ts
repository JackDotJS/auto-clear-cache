import { defineConfig } from 'wxt';
import Solid from 'vite-plugin-solid';

export default defineConfig({
  // @ts-expect-error because idfk why its complaining
  vite: () => ({
    build: {
      target: "esnext"
    },
    plugins: [
      Solid()
    ]
  }),
  browser: "firefox",
  manifestVersion: 2,
  manifest: {
    permissions: [
      "browsingData",
      "storage",
      "alarms"
    ],
    optional_permissions: [
      "notifications"
    ],
    browser_specific_settings: {
      gecko: {
        id: "{CE7F5E81-77D0-49AF-A480-FF3F5581F4E9}"
      }
    }
  }
});
