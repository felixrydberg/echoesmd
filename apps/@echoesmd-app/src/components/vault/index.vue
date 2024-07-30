<script setup lang="ts">
  import { computed, onUnmounted } from 'vue';
  import UiSidebar from './sidebar/index.vue';
  import  scarlettVaultTabs from './tabs/index.vue'
  import { useInstance } from '../../instance';

  import EchoesAppHeader from '../ui/header.vue'
  import { EchoesUiContainer, EchoesUiButton, background, border } from '@echoesmd/ui';
  import { useEchoesStore } from '../../store/echoes';

  const props = defineProps({
    name: {
      type: String,
      required: true,
    }
  });

  const echoes = useEchoesStore();
  const vault = computed(() => echoes.getVaultById(props.name));
  const synced = computed(() => echoes.getSynced());
  const sidebar = computed(() => echoes.getSidebar());
  const groups = computed(() => echoes.getGroups());
  if (groups.value.length === 0) {
    echoes.addGroup();
  }

  const toggleSidebar = () => {
    echoes.setSidebar(!sidebar.value);
  }

  onUnmounted(() => {
    const instance = useInstance();
    instance.destroy();
  })
</script>

<template>
  <div v-if="synced" class="text-black dark:text-white">
    <echoes-app-header>
      <template #prepend>
        <echoes-ui-button class="h-6 w-6" size="small" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :class="{'rotate-180': !sidebar}" class="size-4">
            <path fill-rule="evenodd" d="M14 4.75A2.75 2.75 0 0 0 11.25 2h-3A2.75 2.75 0 0 0 5.5 4.75v.5a.75.75 0 0 0 1.5 0v-.5c0-.69.56-1.25 1.25-1.25h3c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-3c-.69 0-1.25-.56-1.25-1.25v-.5a.75.75 0 0 0-1.5 0v.5A2.75 2.75 0 0 0 8.25 14h3A2.75 2.75 0 0 0 14 11.25v-6.5Zm-9.47.47a.75.75 0 0 0-1.06 0L1.22 7.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-.97-.97h7.19a.75.75 0 0 0 0-1.5H3.56l.97-.97a.75.75 0 0 0 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </echoes-ui-button>
        <div v-if="vault?.collaboration" class="flex items-center ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" :class="vault.collaboration.synced ? 'fill-green-500' : 'fill-red-500'" class="size-3.5">
            <path fill-rule="evenodd" d="M14.188 7.063a8.75 8.75 0 0 0-12.374 0 .75.75 0 0 1-1.061-1.06c4.003-4.004 10.493-4.004 14.496 0a.75.75 0 1 1-1.061 1.06Zm-2.121 2.121a5.75 5.75 0 0 0-8.132 0 .75.75 0 0 1-1.06-1.06 7.25 7.25 0 0 1 10.252 0 .75.75 0 0 1-1.06 1.06Zm-2.122 2.122a2.75 2.75 0 0 0-3.889 0 .75.75 0 1 1-1.06-1.061 4.25 4.25 0 0 1 6.01 0 .75.75 0 0 1-1.06 1.06Zm-2.828 1.06a1.25 1.25 0 0 1 1.768 0 .75.75 0 0 1 0 1.06l-.355.355a.75.75 0 0 1-1.06 0l-.354-.354a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </div>
      </template>
      <div :class="[background.item, border.item, 'hidden md:flex text-xs justify-center items-center p-1 rounded-lg w-full']">
        {{ vault.name }}
      </div>
    </echoes-app-header>
    <echoes-ui-container class="flex z-0 h-full">
      <ui-sidebar class="transition-all duration-200" :class="sidebar ? 'translate-0 max-w-48 min-w-48' : '-translate-x-48 max-w-0'" />
      <scarlett-vault-tabs />
    </echoes-ui-container>
  </div>
</template>
