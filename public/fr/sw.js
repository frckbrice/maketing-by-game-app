if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    a[s] ||
      new Promise(a => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, n) => {
    const i =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[i]) return;
    let t = {};
    const r = e => s(e, i),
      o = { module: { uri: i }, exports: t, require: r };
    a[i] = Promise.all(c.map(e => o[e] || r(e))).then(e => (n(...e), t));
  };
}
define(['./workbox-f1770938'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/PJTlu-5sPjkFroJgZmSFO/_buildManifest.js',
          revision: 'cf32dcdff17ca0590d45bda5872fbd2d',
        },
        {
          url: '/_next/static/PJTlu-5sPjkFroJgZmSFO/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/admin/create-game/page-e4bf6e58b5eeb10a.js',
          revision: 'e4bf6e58b5eeb10a',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/admin/page-723d3b9d9214a9bd.js',
          revision: '723d3b9d9214a9bd',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/auth/login/page-e689c28c9f78b511.js',
          revision: 'e689c28c9f78b511',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/auth/register/page-ab8b599811e50a58.js',
          revision: 'ab8b599811e50a58',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/dashboard/page-607af82cd2e6d834.js',
          revision: '607af82cd2e6d834',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/error-8538c9593eff8891.js',
          revision: '8538c9593eff8891',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/games/page-e3ac48b23a9f3962.js',
          revision: 'e3ac48b23a9f3962',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/layout-978631c92fba5633.js',
          revision: '978631c92fba5633',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/not-found-1a5fff8c4d4395f6.js',
          revision: '1a5fff8c4d4395f6',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/page-b4d3ad6b4ad621c5.js',
          revision: 'b4d3ad6b4ad621c5',
        },
        {
          url: '/_next/static/chunks/app/%5Blocale%5D/test/page-31570571a34d1e7e.js',
          revision: '31570571a34d1e7e',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-1c79877baa9c48b3.js',
          revision: '1c79877baa9c48b3',
        },
        {
          url: '/_next/static/chunks/app/layout-b2d3f39c9dc7bc62.js',
          revision: 'b2d3f39c9dc7bc62',
        },
        {
          url: '/_next/static/chunks/app/page-b75341edc2f004d9.js',
          revision: 'b75341edc2f004d9',
        },
        {
          url: '/_next/static/chunks/main-202aa4e8ae0a8079.js',
          revision: '202aa4e8ae0a8079',
        },
        {
          url: '/_next/static/chunks/main-app-d0365122cc4c17f1.js',
          revision: 'd0365122cc4c17f1',
        },
        {
          url: '/_next/static/chunks/pages/_app-c5cb7cddb290e2c2.js',
          revision: 'c5cb7cddb290e2c2',
        },
        {
          url: '/_next/static/chunks/pages/_error-85c969c7489c32e6.js',
          revision: '85c969c7489c32e6',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/ui-18ed985a9731e848.js',
          revision: '18ed985a9731e848',
        },
        {
          url: '/_next/static/chunks/webpack-734cc499c397f2a2.js',
          revision: '734cc499c397f2a2',
        },
        {
          url: '/_next/static/css/931b179cff3131dc.css',
          revision: '931b179cff3131dc',
        },
        {
          url: '/_next/static/css/9f1fe96f8d7ce529.css',
          revision: '9f1fe96f8d7ce529',
        },
        {
          url: '/_next/static/media/26a46d62cd723877-s.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/fr/favicon.ico',
          revision: '13146f9bfafc3426cdc978bbf7598fc6',
        },
        {
          url: '/fr/icons/apple-touch-icon.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/fr/icons/favicon-16x16.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/fr/icons/icon.svg',
          revision: '2d4bee9d64da3349208db199f64ae15c',
        },
        {
          url: '/fr/icons/lottery_logo.jpeg',
          revision: '13146f9bfafc3426cdc978bbf7598fc6',
        },
        {
          url: '/fr/images/lottery_1.jpg',
          revision: 'ac6a0d129f611424f2403b304624ca00',
        },
        {
          url: '/fr/images/winner_1.png',
          revision: '736d79de072f65e53baea61d6ca9670c',
        },
        {
          url: '/fr/images/winner_2.png',
          revision: 'afe0b7748a408945a574be2b12659dfe',
        },
        {
          url: '/fr/images/winner_3.png',
          revision: 'c28139c49727dae419e2b8f90c7907c8',
        },
        {
          url: '/fr/images/winner_4.png',
          revision: '9cefc4833c4a6baeb714743c1a6fa519',
        },
        {
          url: '/fr/manifest.json',
          revision: '44219d6b6453c29e4326adb00e5c202e',
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: a } }) =>
        !(!e || a.startsWith('/api/auth/callback') || !a.startsWith('/api/')),
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        s &&
        !a.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        '1' === e.headers.get('RSC') && s && !a.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: a }) => a && !e.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      'GET'
    ));
});
