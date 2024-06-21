<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue';
  import sidebar from '@/components/vault/sidebar/index.vue';
  import { useInstance } from '@/instance';
  import { ItemPage } from '@/types';

  const synced = ref(false);
  const tabs = ref<ItemPage[]>([]);
  const activeTab = ref<ItemPage["id"]>('');
  const instance = useInstance();
  onMounted(() => {
    instance.subscribe("page:loaded", (...args: unknown[]) => {
      const page = args[0] as ItemPage;
      tabs.value.push(page)
      nextTick(() => {
        activeTab.value = page.id;
      })
    })
    if (instance.db) {
      instance.db.synced ? synced.value = true : instance.db.on('synced', () => synced.value = true);
    }
  })
</script>

<template>
  <div v-if="synced">
    <sidebar />
    <div
      class="text-white"
      v-if="tabs.length > 0"
      v-for="(tab, index) in tabs"
      :key="`vault-tab-${index}`"
    >
      <scarlettmd-tab v-model:active="activeTab" :tab="tab" />
    </div>
    <div v-else>
      No active tabs
    </div>
  </div>
  <div v-else class="h-full w-full flex items-center justify-center">
    <div class="flex flex-col items-center">
      <span class="text-primary-500">Syncing...</span>
    </div>
  </div>
</template>
