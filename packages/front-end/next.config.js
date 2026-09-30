const cspHeader = `
    frame-ancestors 'none';
`;

module.exports = {
  // next/image is unused; this disables the public /_next/image endpoint
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
