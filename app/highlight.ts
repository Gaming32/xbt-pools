// Only register the languages we use, instead of shipping the full highlight.js bundle
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json); // Also provides json5

export default hljs;
