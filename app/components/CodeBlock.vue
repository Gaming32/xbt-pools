<script setup lang="ts">
import darkTheme from "highlight.js/styles/base16/google-dark.css?inline";
import lightTheme from "highlight.js/styles/base16/google-light.css?inline";
import hljs from "~/highlight";

const props = defineProps<{
  code: string;
  lang: string;
}>();

const theme = useTheme();

// Both themes style the same selectors, so only the active one is included. The key dedupes multiple code blocks.
useHead({
  style: [
    {
      key: "hljs-theme",
      innerHTML: computed(() =>
        theme.current.value.dark ? darkTheme : lightTheme,
      ),
    },
  ],
});

const highlighted = computed(
  () => hljs.highlight(props.code, { language: props.lang }).value,
);

const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;
async function copy() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  clearTimeout(copiedTimeout);
  copiedTimeout = setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="code-block-root">
    <!-- eslint-disable-next-line vue/no-v-html -- Escaped by highlight.js -->
    <pre><code class="hljs" v-html="highlighted" /></pre>
    <v-btn
      class="copy-button"
      :icon="copied ? 'lucide:check' : 'lucide:copy'"
      :aria-label="copied ? $t('codeBlock.copied') : $t('codeBlock.copy')"
      variant="text"
      size="x-small"
      @click="copy"
    />
  </div>
</template>

<style scoped>
.code-block-root {
  position: relative;

  pre {
    /* The copy button is positioned relative to the top of the root */
    margin-top: 0;
  }

  code {
    border-radius: 0.5rem;
  }

  .copy-button {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover .copy-button,
  .copy-button:focus-visible {
    opacity: 1;
  }
}
</style>
