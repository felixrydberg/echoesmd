<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';
  import EchoesAppHeader from '../ui/header.vue';
  import { EchoesUiContainer, EchoesUiList, EchoesUiListItem, EchoesUiButton, border, typography, transition } from '@echoesmd/ui'
  import EchoesCreateModal from './modals/create.vue';
  import { useEchoesStore } from '../../store/echoes';
  import { useRouter } from 'vue-router';
  import { Vault } from '../../types';
  import { formatDate } from '../../utils/index';

  const createModal = ref(false);
  const echoes = useEchoesStore();
  const router = useRouter();
  const vaults = computed(() => echoes.getVaults);

  const removeVault = (index: number) => {
    echoes.removeVault(index);
  }

  const joinDemoVault = () => {
    console.log('Joining demo vault');
    const vault: Vault = {
      id: crypto.randomUUID(),
      name: 'Demo Vault',
      url: 'echoes-demo-server.240284308.xyz:3000',
      token: '',
      collaboration: true,
      lastOpened: new Date().toISOString(),
    };
    echoes.addVault(vault);
    echoes.setOpenLast(true);
    router.push(`/${vault.id}`);
  }

  const handleOpenVault = (vault: Vault) => {
    echoes.setOpenLast(true);
    echoes.updateVault(vault.id, {
      ...vault,
      lastOpened: new Date().toISOString()
    });
    router.push(`/${vault.id}`);
  }
</script>

<template>
  <div>
    <echoes-app-header>
    </echoes-app-header>
    <div class="flex justify-center items-center h-full">
      <echoes-ui-container size="lg" class="flex flex-col w-full gap-y-4 text-center">
        <div class="flex flex-wrap justify-center">
          <div class="flex justify-center flex-col w-full">
            <h1 class="font-medium text-5xl">Echoes</h1>
            <p class="text-sm font-medium text-neutral-500 pt-1">Early Access Version 1.0.0</p>
          </div>
          <div class="flex flex-col-reverse w-fit">
            <echoes-ui-list class="text-start">
              <echoes-ui-list-item v-for="(vault, index) in vaults" :key="`home-vault-${index}`" class="relative text-sm font-normal flex gap-x-8 justify-between items-center p-4 px-8 h-16">
                <div class="w-48">
                  <h1 class="text-sm">{{ vault.name }}</h1>
                  <span class="text-neutral-500 text-sm">Opened: {{ formatDate(new Date(vault.lastOpened)) }}</span>
                </div>
                <echoes-ui-button @click="handleOpenVault(vault)" size="small" class="text-sm w-28 text-center">
                  Open
                </echoes-ui-button>
                <echoes-ui-button @click="removeVault(index)" class="text-neutral-500 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-500 absolute right-0 text-sm" :background="false" :hover="false" size="small">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </echoes-ui-button>
              </echoes-ui-list-item>
            </echoes-ui-list>
            <echoes-ui-list class="text-start">
              <echoes-ui-list-item :class="border.item" class="text-sm font-normal flex gap-x-8 justify-between items-center p-4 px-8 h-16 border-t-0 border-r-0 border-l-0">
                <span class="w-48">
                  Create new Vault
                </span>
                <echoes-create-modal v-model="createModal" />
                <echoes-ui-button @click="createModal = !createModal" size="small" primary class="text-sm w-28">
                  Create
                </echoes-ui-button>
              </echoes-ui-list-item>
              <echoes-ui-list-item :class="border.item" class="text-sm font-normal flex gap-x-8 justify-between items-center p-4 px-8 h-16 border-t-0 border-r-0 border-l-0">
                <span class="w-48">
                  Join Vault (Demo)
                </span>
                <echoes-ui-button @click="joinDemoVault" size="small" class="text-sm w-28">
                  Join
                </echoes-ui-button>
              </echoes-ui-list-item>
            </echoes-ui-list>
          </div>
        </div>
    </echoes-ui-container>
    </div>
  </div>
</template>
