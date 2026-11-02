import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  appType: "spa",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "icons.svg",
      ],

      manifest: {
        id: "/",
        name: "FeatureOps",
        short_name: "FeatureOps",
        description:
          "Enterprise Feature Management and Release Control System",

        theme_color: "#14B8A6",
        background_color: "#F8FAFC",

        display: "standalone",
        display_override: [
          "window-controls-overlay",
          "standalone",
          "browser",
        ],

        orientation: "portrait",

        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],

        screenshots: [
          {
            src: "/screenshots/desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/mobile.png",
            sizes: "390x844",
            type: "image/png",
          },
        ],

        protocol_handlers: [
          {
            protocol: "web+featureops",
            url: "/?protocol=%s",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        navigateFallback: "/index.html",

        navigateFallbackDenylist: [
          /^\/api\//,
        ],

        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/fonts\.googleapis\.com\/.*/i,

            handler: "CacheFirst",

            options: {
              cacheName: "google-fonts",

              expiration: {
                maxEntries: 10,
                maxAgeSeconds:
                  60 * 60 * 24 * 365,
              },
            },
          },

          {
            urlPattern:
              /^https:\/\/fonts\.gstatic\.com\/.*/i,

            handler: "CacheFirst",

            options: {
              cacheName: "google-fonts-webfonts",

              expiration: {
                maxEntries: 10,
                maxAgeSeconds:
                  60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});