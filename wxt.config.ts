import { defineConfig } from 'wxt';
import Solid from 'vite-plugin-solid';

export default defineConfig({
  vite: () => ({
    build: {
      target: "esnext"
    },
    plugins: [
      // @ts-expect-error because idfk why its complaining
      Solid()
    ]
  }),
  browser: "firefox",
  manifestVersion: 3,
  manifest: {
    name: "Auto Clear Cache",
    version: "1.0.0",
    description: "Automatically clears your browsing data on a regular basis.",
    homepage_url: "https://github.com/JackDotJS/auto-clear-cache",
    author: "JackDotJS",
    // @ts-expect-error because idfk why its complaining
    background: {
      scripts: [ "src/background.ts" ],
      type: "module"
    },
    permissions: [
      "browsingData",
      "storage",
      "alarms"
    ],
    optional_permissions: [
      "notifications"
    ],
    options_ui: {
      page: "src/options.html",
      browser_style: false,
      open_in_tab: true
    },
    action: {
      default_popup: "src/popup.html",
      default_icon: {
        16: "icon/light_16x.png",
        32: "icon/light_32x.png",
        64: "icon/light_64x.png"
      },
      theme_icons: [
        {
          dark: "icon/dark_16x.png",
          light: "icon/light_16x.png",
          size: 16
        },
        {
          dark: "icon/dark_32x.png",
          light: "icon/light_32x.png",
          size: 32
        },
        {
          dark: "icon/dark_64x.png",
          light: "icon/light_64x.png",
          size: 64
        }
      ]
    },
    browser_specific_settings: {
      gecko: {
        id: "{CE7F5E81-77D0-49AF-A480-FF3F5581F4E9}"
      }
    }
  }
});
