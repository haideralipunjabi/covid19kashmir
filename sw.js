const VERSION = "1"

var networkFirstAPI = [
  '/api/patients/',
  '/api/news',
  '/api/live'
]
var cacheFirstAPI = [
  '/api/phones/',
  '/api/bulletin/',
  '/api/news/',
  '/api/analytics/',
  '/api/stores/'
]
var cacheFirstFiles = [
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
'/assets/css/datalab.css',
'/assets/js/datalab.js',
'/assets/js/apexcharts.js',
'/assets/js/leaflet.js',
'/assets/css/leaflet.css',
'/assets/css/montserrat.css',
'/assets/css/images/layers-2x.png',
'/assets/css/images/layers.png',
'/assets/css/images/marker-icon-2x.png',
'/assets/css/images/marker-icon.png',
'/assets/css/images/marker-shadow.png',
];

var pagesToCache = [
'/index.html',
'/404.html',
'/about.html',
'/allnews.html',
'/datalab.html',
'/datapolicy.html',
'/faq.html',
'/gmc.html',
'/mythbuster.html',
'/phones.html',
'/press.html',
'/sources.html',
'/statistics.html',
'/stores.html'
]
var linksPreferingNetwork=[];
var linksPreferingCached=[...cacheFirstFiles];

let isLocal = (location.href.includes("127.0.0.1")||location.href.includes("localhost"))
if(isLocal){
  linksPreferingCached=linksPreferingCached.concat(pagesToCache)
  linksPreferingCached=linksPreferingCached.concat(cacheFirstAPI.map(item=>`https://covidkashmir.org${item}`))
  linksPreferingNetwork=linksPreferingNetwork.concat(networkFirstAPI.map(item=>`https://covidkashmir.org${item}`))
}
else {
  linksPreferingCached=linksPreferingCached.concat(pagesToCache.map(item=>item.replace(".html","")))
  linksPreferingCached.push("/")
  linksPreferingCached=linksPreferingCached.concat(cacheFirstAPI)
  linksPreferingNetwork=linksPreferingNetwork.concat(networkFirstAPI)
}

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(VERSION)
      .then(function(cache) {     
        return cache.addAll([
          ...linksPreferingCached,
          ...linksPreferingNetwork
        ]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  function fetchAndUpdate(){
    return fetch(event.request).then(
      function(response) {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
      
        caches.open(VERSION)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });       
        return response;
      }
    );
  }
  if(linksPreferingCached.includes(event.request.url)){
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (!response) {
            return fetchAndUpdate();
          }
          fetchAndUpdate();
          return response;        
        })
      );
  }
  else if(linksPreferingNetwork.includes(event.request.url)){
    event.respondWith(
      fetch(event.request).then(function(response){
        caches.open(VERSION)
        .then(function(cache) {
          cache.put(event.request, responseToCache);
        });       
      return response;
      }).catch(function() {
        fetchFails.push(event.request.url)
        return caches.match(event.request);
      })
    );
  }
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [VERSION];
  console.log("activates")
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

