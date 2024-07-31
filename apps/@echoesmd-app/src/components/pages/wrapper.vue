<script setup lang="ts">
  import { nextTick, onMounted, onUnmounted, PropType, ref, toRaw } from 'vue'
  import { useInstance } from '../../instance'
  import { ItemTab } from '../../types';
  import { useEchoesStore } from '../../store/echoes';
  import * as Y from 'yjs'
  const props = defineProps({
    page: {
      type: Object as PropType<ItemTab>,
      required: true,
    },
  })

  const instance = useInstance();
  const echoes = useEchoesStore();  
  const synced = ref(false);
  onMounted(async () => {
    if (!(props.page.ydoc instanceof Y.Doc)) {
      // If ydoc is not an instance of Y.Doc, it means that Pinia Persistance messed it up.
      // Just replace it and then it will load
      const page = instance.getPage(props.page.id);
      if (page) {
        echoes.updateTab(page);
      }
    }
    await instance.loadPage(props.page.id);
    synced.value = true;
  });

  onUnmounted(() => {
    // Unload page if its not in other groups
    const tab = echoes.getTab(props.page.id);
    if (!tab) {
      instance.unloadPage(props.page.id);
    } else {
      console.warn('Removing tab', props.page.id, 'but not unloading since its still in other groups');
    }
  });
</script>

<template>
  <div v-if="synced" class="h-full">
    <slot></slot>
  </div>
</template>