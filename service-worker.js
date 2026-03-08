self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("marathon").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./followup.csv",
      ]);
    }),
  );
});
