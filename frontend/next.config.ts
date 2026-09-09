import type { NextConfig } from "next";

// Logos uploaded in Directus are served from its /assets endpoint, so
// next/image needs that host allow-listed.
const directusUrl = (() => {
  try {
    return new URL(process.env.DIRECTUS_URL ?? "https://edit.webmo.ch");
  } catch {
    return new URL("https://edit.webmo.ch");
  }
})();
const directusHost = directusUrl.hostname;
// Origin allowed to frame the site for the visual editor. Defaults to the
// Directus origin, but is separate so a Studio on another host — or a local
// test harness — can be allowed without repointing the content API.
const visualEditorOrigin = process.env.VISUAL_EDITOR_ORIGIN ?? directusUrl.origin;

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: directusHost, pathname: "/assets/**" },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // X-Frame-Options has no third-party allow-list, so framing is
            // governed by frame-ancestors below instead. Browsers that support
            // both let CSP win; this header is kept off deliberately rather
            // than set to SAMEORIGIN, which would block the Directus editor.
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${visualEditorOrigin}`,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // Origin isolation; the site opens no cross-origin popups.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

};

export default nextConfig;
