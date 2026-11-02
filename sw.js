/* Die alte App unter dieser Adresse gibt es nicht mehr (Mirko 02.11.2026:
   "komplett loeschen! nur noch rieb-spesen soll bestehen bleiben!").
   Ersetzt den alten Service Worker, sobald das Geraet nach einem Update sieht
   (die alte App tut das beim Oeffnen und beim Zurueckholen aus dem
   Hintergrund): loescht den Offline-Speicher und die Datenbanken, meldet sich
   ab und laedt offene Fenster neu - dort raeumt index.html den Rest weg
   (localStorage erreicht ein Service Worker nicht). Kein fetch-Handler: ab
   jetzt geht alles ans Netz, und dort liegt nur noch das leere Blatt. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    try { const namen = await caches.keys(); await Promise.all(namen.map(function (n) { return caches.delete(n); })); } catch (e) {}
    try {
      const weg = function (n) { try { indexedDB.deleteDatabase(n); } catch (e) {} };
      ["spesen-pdf-archiv", "stoerungsliste", "firebaseLocalStorageDb", "firebase-heartbeat-database",
       "firebase-installations-database", "firestore/[DEFAULT]/hall-cd0f1/main"].forEach(weg);
      if (indexedDB.databases) (await indexedDB.databases()).forEach(function (d) { if (d && d.name) weg(d.name); });
    } catch (e) {}
    try { await self.clients.claim(); } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
    try {
      const fenster = await self.clients.matchAll({ type: "window" });
      fenster.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
    } catch (e) {}
  })());
});
