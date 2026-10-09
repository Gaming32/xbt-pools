import { fetchServerPoolsCached } from "../utils/pool-fetch";

export default defineEventHandler((event) => {
  if (event.path === "/") {
    fetchServerPoolsCached();
  }
});
