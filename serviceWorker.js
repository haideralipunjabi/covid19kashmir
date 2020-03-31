const VERSION = "1"
var networkFirstFiles = [
  '/api/patients/'
]
var cacheFirstFiles = [
'/404.html',
'/404',
'/',
'/index.html',
'/about.html',
'/sources.html',
'/phones.html',
'/gmc.html',
'/mythbuster.html',
'/statistics.html',
'/press.html',
'/allnews.html',
'/index',
'/about',
'/sources',
'/phones',
'/gmc',
'/press',
'/mythbuster',
'/allnews',
'/statistics',
'/assets/js/jquery-3.4.1.min.js',
'/assets/js/widgetFunction.js',
'/assets/js/gmc.js',
'/assets/js/snap.svg-min.js',
'/assets/js/html2canvas.min.js',
'/assets/js/localDebug.js',
'/assets/js/canvas2image.js',
'/assets/js/hitcounter.js',
'/assets/js/utils.js',
'/assets/js/index.js',
'/assets/js/sortable.min.js',
'/assets/js/phones.js',
'/assets/js/newsFeed.js',
'/assets/js/statistics.js',
'/assets/webfonts/fa-solid-900.woff2',
'/assets/webfonts/fa-solid-900.woff',
'/assets/webfonts/fa-solid-900.ttf',
'/assets/webfonts/fa-brands-400.svg',
'/assets/webfonts/fa-solid-900.eot',
'/assets/webfonts/fa-brands-400.woff2',
'/assets/webfonts/fa-brands-400.eot',
'/assets/webfonts/fa-brands-400.woff',
'/assets/webfonts/fa-solid-900.svg',
'/assets/webfonts/fa-brands-400.ttf',
'/assets/media/jk_districts.svg',
'/assets/css/bulma.min.css',
'/assets/css/index.css',
'/assets/css/solid.min copy.css',
'/assets/css/sortable-theme-minimal.css',
'/assets/css/bulma.css.map',
'/assets/css/bulma.css',
'/assets/css/solid.min.css',
'/assets/css/fontawesome.min.css',
'/assets/css/brands.min copy.css',
'/assets/css/about.css',
'/assets/css/brands.min.css',
'/assets/favicons/favicon.ico',
'/assets/favicons/icon-150x150.png',
'/assets/favicons/icon-192x192.png',
'/assets/favicons/icon-32x32.png',
'/assets/favicons/icon-70x70.png',
'/assets/favicons/ieconfig.xml',
'/assets/favicons/icon-128x128.png',
'/assets/favicons/icon-152x152.png',
'/assets/favicons/icon-196x196.png',
'/assets/favicons/icon-384x384.png',
'/assets/favicons/icon-72x72.png',
'/assets/favicons/icon-144x144.png',
'/assets/favicons/icon-180x180.png',
'/assets/favicons/icon-310x310.png',
'/assets/favicons/icon-512x512.png',
'/assets/favicons/icon-96x96.png',
'/api/phones/',
'/api/bulletin/',
'/api/news/',
];
                 
        
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(VERSION)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(cacheFirstFiles);
      })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        function fetchAndUpdate(){
          return fetch(event.request).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
  
              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              var responseToCache = response.clone();
            
              caches.open(VERSION)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              
              
              return response;
            }
          );
        }
        if (!response) {
          return fetchAndUpdate();
        }
        fetchAndUpdate();
        return response;        
      })
    );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [VERSION];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});