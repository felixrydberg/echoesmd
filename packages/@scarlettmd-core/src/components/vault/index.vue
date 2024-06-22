<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue';
  import sidebar from '@/components/vault/sidebar/index.vue';
  import  scarlettVaultTabs from '@/components/vault/tabs/index.vue'
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
    instance.subscribe("page:unloaded", (...args: unknown[]) => {
      const page = args[0] as ItemPage;
      const index = tabs.value.findIndex((_page) => _page.id === page.id)
      if (index >= 0) {
        tabs.value.splice(index, 1);
      }
    })
    if (instance.db) {
      instance.db.synced ? synced.value = true : instance.db.on('synced', () => synced.value = true);
    }
  })
</script>

<template>
  <div v-if="synced">
    <sidebar />
    <scarlett-vault-tabs v-if="tabs.length !== 0" :pages="tabs" />
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
