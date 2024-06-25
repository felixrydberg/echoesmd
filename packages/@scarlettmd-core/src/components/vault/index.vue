<script setup lang="ts">
  import { computed, onMounted, ref, PropType } from 'vue';
  import sidebar from '@/components/vault/sidebar/index.vue';
  import  scarlettVaultTabs from '@/components/vault/tabs/index.vue'
  import { createScarlettInstance } from '@/instance';
  import { useVaultStore } from '@/store/vault';
  import { ScarlettInstanceOptions } from '@/types';
  import * as Y from 'yjs';

  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    options: {
      type: Object as PropType<ScarlettInstanceOptions>
    }
  });

  const synced = ref(false);
  const vault = useVaultStore();
  const tabs = computed(() => vault.getTabs);
  const instance = createScarlettInstance(props.options);
  const ydoc = new Y.Doc({ guid: props.name });
  instance.register(ydoc);
  onMounted(async () => {
    if (instance.db) {
      instance.db.synced ? synced.value = true : instance.db.on('synced', () => synced.value = true);
    }
  })
</script>

<template>
  <div class="relative">
    <div v-if="synced" class="flex h-screen">
      <sidebar />
      <scarlett-vault-tabs v-if="tabs.length !== 0" />
      <div v-else class="flex items-center justify-center h-screen w-full">
        No active tabs
      </div>
    </div>
    <div v-else class="h-screen w-full flex items-center justify-center">
      <div class="flex flex-col items-center">
        <span class="text-primary-500">Syncing...</span>
      </div>
    </div>
    <div id="overlay-container" class="top-0 left-0 absolute"></div>
  </div>
</template>
