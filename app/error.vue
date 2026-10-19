<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const isNotFound = computed(() => props.error.status === 404);

useHead({
  title: () => `${props.error.status} · ${$t("title")}`,
});

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <NuxtLayout>
    <v-container class="py-12 py-md-16" max-width="640">
      <v-card variant="flat" border class="text-center">
        <v-card-text class="pa-8 pa-md-12">
          <v-avatar color="primary" variant="tonal" size="72" class="mb-6">
            <v-icon
              :icon="isNotFound ? 'lucide:search-x' : 'lucide:triangle-alert'"
              size="36"
            />
          </v-avatar>
          <div class="status-code text-primary mb-2">
            {{ error.status }}
          </div>
          <h1 class="text-h5 font-weight-bold mb-3">
            {{ isNotFound ? $t("error.notFound.title") : $t("error.title") }}
          </h1>
          <p class="text-medium-emphasis mb-8">
            {{ isNotFound ? $t("error.notFound.body") : $t("error.body") }}
          </p>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="xl"
            prepend-icon="lucide:house"
            @click="goHome"
            >{{ $t("error.goHome") }}</v-btn
          >
        </v-card-text>
      </v-card>
    </v-container>
  </NuxtLayout>
</template>

<style lang="css" scoped>
.status-code {
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
</style>
