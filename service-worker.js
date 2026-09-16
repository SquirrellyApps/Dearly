const CACHE="dearly-push-v3";
const ASSETS=["./","./index.html","./style.css","./app.js","./push-fix.js","./manifest.json","./icon.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request))));
self.addEventListener("push",event=>{
  let data={title:"Dearly ❤️",body:"Send her something sweet. ❤️",url:"./"};
  try{if(event.data)data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:"./icon.svg",badge:"./icon.svg",data:{url:data.url},tag:"dearly-reminder",renotify:true}));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){if("focus" in client)return client.focus()}
    if(clients.openWindow)return clients.openWindow(event.notification.data?.url||"./");
  }));
});
