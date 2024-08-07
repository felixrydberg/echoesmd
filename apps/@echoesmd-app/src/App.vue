<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { useEchoesStore } from './store/echoes';
  import { EchoesUiContainer } from '@echoesmd/ui';
  import LoadingVue from './pages/loading.vue';

  const echoes = useEchoesStore();
  const options = computed(() => echoes.getOptions);

  onMounted(() => {
    const _window = (window as any).__TAURI__;
    if (_window !== undefined) {
      echoes.setOptions({
        ...options.value,
        loading: true,
      })
    }
  })
</script>

<template>
  <echoes-ui-container class="flex flex-col w-screen h-screen">
    <div class="h-full">
      <loading-vue v-if="options.loading" />
      <RouterView v-else class="h-full" />
    </div>
  </echoes-ui-container>
  <div id="overlay-container" class="top-0 left-0 absolute"></div>
</template>
