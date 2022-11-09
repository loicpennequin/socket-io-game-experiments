<script setup lang="ts">
const route = useRoute();

const layoutMap = {
  default: defineAsyncComponent(
    () => import('@/ui/components/layouts/DefaultLayout.vue')
  ),
  fullPage: defineAsyncComponent(
    () => import('@/ui/components/layouts/FullPageLayout.vue')
  )
} as const;
const layoutComponent = computed(
  () => layoutMap[route.meta.layout as keyof typeof layoutMap]
);
</script>

<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>
