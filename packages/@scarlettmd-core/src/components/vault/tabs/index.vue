<script setup lang="ts">
  import { useInstance } from '@/instance';
  import { useVaultStore } from '@/store/vault';
  import { ItemPage } from '@/types';
  import { computed } from 'vue';

  const emits = defineEmits(['update:active']);

  // Watch pages for changes
  const vault = useVaultStore();
  const active = computed(() => vault.getActiveTab)
  const instance = useInstance();

  const tabs = computed(() => vault.getTabs);
  const handleTabClick = (page: ItemPage) => {
    if (page.id === active.value.id) {
      return;
    }
    vault.setTab({
      id: page.id,
      component: page.component,
      props: {
        page: page,
      }
    });
  }
</script>

<template>
  <div class="w-full">
    <div class="flex gap-x-1 w-full p-2">
      <div
        v-for="page in tabs"
        :key="`vault-tabs-${page.id}`"
        class="text-sm p-1 px-2 rounded flex items-center gap-x-2 cursor-pointer"
        :class="active.id === page.id ? 'bg-neutral-900 text-primary-500' : 'text-neutral-400'"
        @click="handleTabClick(page)"
      >
        {{ page.name }}
        <button @click.stop="instance.unloadPage(page.id)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4 text-neutral-500 hover:text-neutral-400">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      </div>
    </div>
    <div>
      <component :is="active.component" v-bind="active.props" :key="active.id" />
    </div>
  </div>
</template>
