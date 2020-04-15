importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

workbox.googleAnalytics.initialize()
workbox.routing.registerRoute(
  /assets/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-files',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        purgeOnQuotaError: true,
      })
    ]
  })
)
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'webpages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        purgeOnQuotaError: true,
      })
    ]
  })
)
workbox.routing.registerRoute(
  /api\/news/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'newsfeed',
    plugins:[
      new workbox.expiration.ExpirationPlugin({
        purgeOnQuotaError:true,
      })
    ]
  })
)
workbox.routing.registerRoute(
  /api\/live/,
  new workbox.strategies.NetworkOnly()
)
workbox.routing.registerRoute(
  /api/,
  new workbox.strategies.NetworkFirst()
)

var version = "v2.0.2";
var swPath;
var urlObject = new URL(location);
var host;
if (urlObject.searchParams.get("swPath")) {
    swPath = urlObject.searchParams.get("swPath");
}
else {
    if (urlObject.searchParams.get("version")) {
        version = urlObject.searchParams.get("version");
    }
    if (urlObject.searchParams.get("swJSHost")) {
        host = "https://" + urlObject.searchParams.get("swJSHost");
    }
    else {
        host = "https://sdki.truepush.com/sdk/";
    }
    swPath = host + version + "/sw.js";
}
importScripts(swPath);

