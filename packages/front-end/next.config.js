const cspHeader = `
    frame-ancestors 'none';
`;

module.exports = {
  // The app doesn't use next/image anywhere, so the /_next/image optimizer is
  // unused product surface: a public, unauthenticated endpoint for SSRF /
  // path-traversal probing and (via its uncapped disk cache) disk-fill risk.
  // Disabling it closes the route entirely (404) instead of serving it.
  images: {
    unoptimized: true,
  },
  // We already run eslint and typescript in CI/CD
  // Disable here to speed up production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  headers: () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: cspHeader.replace(/\n/g, ""),
        },
        {
          key: "X-Frame-Options",
          value: "deny",
        },
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
      ],
    },
  ],
};
