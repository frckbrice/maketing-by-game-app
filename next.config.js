const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts-cache",
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                    return `${request.url}`;
                },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                    return `${request.url}`;
                },
            },
        },
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-font-assets",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-image-assets",
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\/_next\/image\?url=.+$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "next-image",
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\.(?:mp3|wav|ogg)$/i,
            handler: "CacheFirst",
            options: {
                rangeRequests: true,
                cacheName: "static-audio-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\.(?:mp4)$/i,
            handler: "CacheFirst",
            options: {
                rangeRequests: true,
                cacheName: "static-video-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\.(?:js)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-js-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\.(?:css|less)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-style-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\/_next\/static\/.+$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "next-static-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\/api\/.*$/i,
            handler: "NetworkFirst",
            method: "GET",
            options: {
                cacheName: "apis",
                expiration: {
                    maxEntries: 16,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 10, // fall back to cache if api does not response within 10 seconds
            },
        },
        {
            urlPattern: /.*/i,
            handler: "NetworkFirst",
            options: {
                cacheName: "others",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 10,
            },
        },
    ],
});

// set up the plugin which links your i18n/request.ts file to next-intl.
/** @type {import('next').NextConfig} */
// const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
    // Enable standalone output for Docker deployment
    output: 'standalone',
    
    // Enable experimental features
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },


    // i18n: {
    //     locales: ['en', 'fr'],
    //     defaultLocale: 'en',
    //     localeDetection: false,
    // },
    // trailingSlash: true,
    images: {
        unoptimized: true,
    },
    // Enhanced compression and performance
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
    reactStrictMode: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    // Enhanced webpack configuration
    webpack: (config, { dev, isServer, webpack }) => {
        // Performance optimizations
        if (!dev && !isServer) {
            // Optimize bundle size
            config.optimization.splitChunks = {
                chunks: "all",
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all",
                        priority: 10,
                    },
                    common: {
                        name: "common",
                        minChunks: 2,
                        chunks: "all",
                        enforce: true,
                        priority: 5,
                    },
                    // Separate large libraries
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: "react",
                        chunks: "all",
                        priority: 20,
                    },
                    // Separate UI libraries
                    ui: {
                        test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|react-icons)[\\/]/,
                        name: "ui",
                        chunks: "all",
                        priority: 15,
                    },
                    // Separate utility libraries
                    utils: {
                        test: /[\\/]node_modules[\\/](lodash|date-fns|clsx)[\\/]/,
                        name: "utils",
                        chunks: "all",
                        priority: 12,
                    },
                },
            };

            // Enable tree shaking
            config.optimization.usedExports = true;
            config.optimization.sideEffects = false;

            // Optimize module resolution
            config.resolve.modules = ["node_modules"];
            config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx"];

            // Enable module concatenation
            config.optimization.concatenateModules = true;

            // Optimize chunk size
            config.optimization.minimize = true;
        }

        // Add compression for better performance
        config.plugins.push(
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        );

        // Optimize for production
        if (!dev) {
            config.optimization.minimize = true;
            config.optimization.minimizer = config.optimization.minimizer || [];
        }

        return config;
    },
    // Enhanced headers for security and performance
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value:
                            "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains; preload",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
                            "style-src 'self' 'unsafe-inline' https:",
                            "font-src 'self' https: data:",
                            "img-src 'self' data: https: blob: 'unsafe-inline'",
                            "connect-src 'self' https: wss:",
                            "frame-src 'self' https:",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'none'",
                            "upgrade-insecure-requests",
                        ].join("; "),
                    },
                ],
            },
            {
                source: "/api/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600, s-maxage=3600",
                    },
                ],
            },
            {
                source: "/_next/static/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
    // Redirects for better UX
//   middleware: true,
//   async redirects() {
//     return [];
//   },
};

// module.exports = withPWA(withNextIntl(nextConfig));
module.exports = withPWA(nextConfig);

