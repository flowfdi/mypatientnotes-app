/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    if (process.env.DISABLE_CSP === 'true') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.accounts.dev; object-src 'none'; base-uri 'self'; worker-src blob: 'self'; connect-src 'self' https://*.clerk.dev https://api.clerk.dev wss://*.clerk.dev; img-src * data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' https://*.clerk.dev data:"
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
