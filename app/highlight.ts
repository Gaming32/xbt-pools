// Replaces the full highlight.js bundle imported by @wdns/vue-code-block, so we only ship the languages we use
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json); // Also provides json5

export default hljs;
