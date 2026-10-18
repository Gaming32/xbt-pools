export default defineEventHandler((event) => {
  if (event.path.startsWith("/api/") || event.path.startsWith("/_nuxt/")) {
    return;
  }
  setResponseHeaders(event, {
    "Accept-CH": "Sec-CH-Prefers-Color-Scheme",
    "Critical-CH": "Sec-CH-Prefers-Color-Scheme",
    Vary: "Sec-CH-Prefers-Color-Scheme",
  });
});
