var prodCache = version.version + "_" + version.client_cache;
var processMsg = false

const prodAssets = [
	 "/pwa/swKWBBall.min.js",
	 "/html/KWBBall.html",
	 "/javascripts/KWBBall.min.js",
	 "/stylesheets/Modal.min.css",
	 "/stylesheets/KWBBall.min.css",
	
	 "/images/favicon-96x96.png",
	 "/images/favicon.svg",
	 "/images/favicon.ico",
	 "/images/apple-touch-icon.png",
	 "/images/KWBBallBackground.jpg",
	 "/images/KWBBallBullpen.png",
	 "/images/KWBBallGame.png",
	 "/images/KWBBallScrimmage.jpg",
/*	 "/images/KWBBallLogo.svg", */
	
	 "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js",
	 "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js",
	 "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap",
	 "https://code.jquery.com/jquery-3.7.1.min.js",	 
	 "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",//integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous")
	 "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
	 "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css", //integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous")
	 "https://cdn.datatables.net/2.1.5/css/dataTables.dataTables.min.css",
	 "https://cdn.datatables.net/fixedcolumns/5.0.1/css/fixedColumns.dataTables.min.css",
	 "https://cdn.datatables.net/fixedheader/4.0.1/css/fixedHeader.dataTables.min.css",
	 "https://cdn.datatables.net/responsive/3.0.3/css/responsive.dataTables.min.css",
	 "https://cdn.datatables.net/2.1.5/css/dataTables.bootstrap5.min.css",
	 "https://cdn.datatables.net/2.1.5/js/dataTables.min.js",
	 "https://cdn.datatables.net/fixedcolumns/5.0.1/js/dataTables.fixedColumns.min.js",
	 "https://cdn.datatables.net/fixedheader/4.0.1/js/dataTables.fixedHeader.min.js",
	 "https://cdn.datatables.net/responsive/3.0.3/js/dataTables.responsive.min.js",
	 "https://cdn.datatables.net/2.1.5/js/dataTables.bootstrap5.min.js"
	]
	
postMsg = function(str)
   {
   if (processMsg == true)
      console.log(str)
   };
   
self.addEventListener("install", event => {
   postMsg('install event listener...');
	
   event.waitUntil(
      caches.open(prodCache).then(async cache=>
	 {
	 console.log('NUM ASSETS: ' + prodAssets.length);
	 for (var i = 0; i < prodAssets.length; i++)
	    {
	    try
	       {
	       console.log('CACHING: ' +  prodAssets[i])
	       await cache.add(prodAssets[i]);
	     //  cache.addAll(prodAssets)
	       }
	    catch(error)
	       {
	       console.log(error)
	       postMsg(error);
	       }
	    }
	 })
      )
   self.skipWaiting();
   });

self.addEventListener('activate', async function(event) 
   {
   postMsg('activate event listener...');
	
   event.waitUntil(
      caches.keys().then(function(cacheNames) 
	 {
	 return Promise.all(
	    cacheNames.filter(function(cacheName) 
	       {
	       postMsg('processing cache: ' + cacheName);
	       if (!cacheName.startsWith(prodCache) ) 
		  return true;

	       }).map(function(cacheName) 
		  {
		  // completely deregister for ios to get changes too
		  if ('serviceWorker' in navigator) 
		     {
		     postMsg('deregistering Serviceworker')
		     navigator.serviceWorker.getRegistrations().then(function(registrations) 
			{
			registrations.map(function(r){r.unregister()})
			})
		     }
		  //postMsg('forcing page reload...');
		  //window.location.reload(true)
		  
		  postMsg('removing cache: ' + cacheName);
		  return (caches.delete(cacheName));
		  })
	    )
	 })
      )
   // Enable navigation preload if it's supported.
   //if ("navigationPreload" in self.registration)
      //await event.waitUntil(self.registration.navigationPreload.enable());
      
   // Tell the active service worker to take control of the page immediately.
   //self.clients.claim();
});

verifyIfCached = function(url)
   {
   if(! url.includes (version.client_subdomain()))
      return('nocache')
   else if (url.includes('greenpasturetech.com') == true)
      {
      if (url.includes('/api/') == true)
	 return('nocache'); // return('neworkFirst');
      else
	 return('cacheFirst')
      }
   
   var array = url.split('/')
   var cachecomp = array[array.length - 1];
    
   for (var i= 0; i < prodAssets.length; i++)
      {
      var tmparray = prodAssets[i].split('/')
      var tmpcomp = tmparray[tmparray.length - 1]
      
      if (cachecomp == tmpcomp)
	 return('cacheFirst')
      }
      
   return('cacheFirst')
   }
   
self.addEventListener("fetch", event => 
   {
   postMsg('FETCH: ' + event.request.url)

   var cacheType = verifyIfCached(event.request.url);
   
   if (cacheType == 'nocache')
      {
//console.log('URL = ' + event.request.url);
      postMsg('Not cached : ' + event.request.url)
      const newHeaders = new Headers(event.request.headers);

//var newreponse  = event.request.clone()
//     return (newreponse);
      
      return new Response("not cached", 
	       {
	       status: 200,
	       headers: newHeaders // { "Content-Type": "text/plain"}
			 // "Cache-Control": "max-age=" + 365 * 24 * 60 * 60 * 1000},
	       });
      }
   else if (cacheType == 'networkFirst')
      {
      postMsg('NetworkFirst : ' + event.request.url)
      event.respondWith(
	 networkFirst({
	    request: event.request,
	    fallbackUrl: "/KWBBALL.html",
	    })
	)
     }
   else //(cacheType == 'cacheFirst')
      {
      postMsg('cacheFirst : ' + event.request.url)
      event.respondWith(
	 cacheFirst({
	    request: event.request,
	    fallbackUrl: "/KWBBALL.html",
	    })
	)
     }
});

const putInCache = async (request, response) => 
   {
   if (request.method.toUpperCase() == 'POST')
      {
      const newHeaders = new Headers(request.headers);
      return new Response("not cached", 
	       {
	       status: 200,
	       headers: newHeaders //{ "Content-Type": "text/plain"}
			 //  "Cache-Control": "max-age=" + 365 * 24 * 60 * 60 * 1000}
	       });
      }
   postMsg('Updating local cache with response from network : ' + request.url)
   const cache = await caches.open(prodCache);
   
   //const requestClone = new Request(request.url, {'headers': request.headers,'method': "GET"})
   await cache.put(request, response);
   };

const networkFirst = async ({ request, fallbackUrl }) => 
   {
   try 
      {
      postMsg('Checking network...')
      const responseFromNetwork = await fetch(request);

      // If the network request succeeded, clone the response:
      // - put one copy in the cache, for the next time
      // - return the original to the app
      // Cloning is needed because a response can only be consumed once.
      if ( (responseFromNetwork) && (responseFromNetwork.ok == true) )
	 {
	 putInCache(request, responseFromNetwork.clone());
	 return responseFromNetwork;
	 }

      // Tty to get the resource from the cache.
      postMsg('Retrieve from network failed. Trying local cache')
      //const requestClone = new Request(request.url, {'headers': request.headers,'method': "GET"})
      const responseFromCache = await caches.match(request);
	 
      if ( (responseFromCache) && (responseFromCache.ok == true) )
	 return responseFromCache;
      else
	 {
	 postMsg('Trying cache fallback : ' + fallbackUrl);
	 const fallbackResponse = await caches.match(fallbackUrl);
	 if ( (fallbackResponse) && (fallbackResponse.ok == true) )
	    return fallbackResponse;
	 else
	    {
	    return new Response("Cache error happened", 
	       {
	       status: 408,
	       headers: { "Content-Type": "text/plain" },
	       });
	    }
	 }
      } 
   catch (error) 
      {
      // If the network request failed,
      // get the fallback response from the cache.
      postMsg('Local cache failed ERROR: ' + error)
      postMsg('Retrieve from network failed. Trying local cache')
      const responseFromCache = await caches.match(request);
      
      if ( (responseFromCache) && (responseFromCache.ok == true) )
	 return responseFromCache; 
      else
	 {
	 const fallbackResponse = await caches.match(fallbackUrl);
	 if ( (fallbackResponse) && (fallbackResponse.ok == true) )
	    return fallbackResponse;
	 else
	    {
	    return new Response("Cache error happened", 
	       {
	       status: 408,
	       headers: { "Content-Type": "text/plain" },
	       });
	    }
	 }
      }
};


const cacheFirst = async ({ request, fallbackUrl }) => 
   {
   // Tty to get the resource from the cache.
   postMsg('Checking local cache: ' + request.url)
   const responseFromCache = await caches.match(request);
	 
   if ( (responseFromCache) && (responseFromCache.ok == true) )
      {
      postMsg('Returning local cache response : ' + request.url)
      return responseFromCache;
      }
      
   var responseFromNetwork = null;
   try
      {
      postMsg('Checking network: ' + request.url)
      responseFromNetwork = await fetch(request, { signal: AbortSignal.timeout(10000) });
      
      // If the network request succeeded, clone the response:
      // - put one copy in the cache, for the next time
      // - return the original to the app
      // Cloning is needed because a response can only be consumed once.
      if ( (responseFromNetwork) && (responseFromNetwork.ok == true) )
	 putInCache(request, responseFromNetwork.clone())
      }
   catch (error)
      {
      postMsg('ERROR: = ' + error)  
      }

   if ( (responseFromCache) && (responseFromCache.ok == true) )
      {
      postMsg('Returning local cache response : ' + request.url)
      return responseFromCache;
      }
   else if ( (responseFromNetwork) && (responseFromNetwork.ok == true) )
      {
      postMsg('Returning network response : ' + request.url)
      return responseFromNetwork;
      }
      
   postMsg('Checking fallback URL : ' + fallbackUrl)
   const fallbackResponse = await caches.match(fallbackUrl);
   if ( (fallbackResponse) && (fallbackResponse.ok == true) )
      {
      postMsg('Returning fallback response')
      return fallbackResponse;
      }
   else
      {
      return new Response("Cache error happened", 
	 {
	 status: 408,
	 headers: { "Content-Type": "text/plain" },
	 });
      }
};


self.addEventListener("push", function(event)
   {
   postMsg('push event listener...');

   var data = JSON.parse(event.data.text());
   var options = 
		{
		body: data.body,
		icon: data.icon,
		badge: data.icon,
		vibrate: [200, 100, 200, 100, 200, 100, 200],
		tag: data.title
		};
   event.waitUntil(self.registration.showNotification(data.title, options))
   });
			
self.addEventListener("sync", async (event) => 
   {
   if (navigator.onLine == true)
      {
      postMsg('PROCESSING: Worker Uploading timesheet')
      if (event.tag == 'uploadTimesheet') 
	 {
	 event.waitUntil(gptcomm.processTimesheetUpload())
	 }
      }
   });

//trying to use this to get a message when app gains focus.
// then trigger an version update check
self.addEventListener('message', async (event) => 
   {
   console.log('Service Worker received:', event.data);

   if (event.data === 'visibility')
      event.waitUntil(gptmain.checkForAppVersionUpdate())
  });
