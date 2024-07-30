<script setup lang="ts">
  import { computed, ref, onMounted, watch } from 'vue';
  import EchoesAppHeader from '../ui/header.vue';
  import { EchoesUiContainer, EchoesUiList, EchoesUiListItem, EchoesUiButton, border } from '@echoesmd/ui'
  import EchoesCreateModal from './modals/create.vue';
  import { useEchoesStore } from '../../store/echoes';
  import { useRouter } from 'vue-router';
  import { Vault } from '../../types';
  import { formatDate } from '../../utils/index';
  import { useInstance } from '../../instance';

  const createModal = ref(false);
  const echoes = useEchoesStore();
  const router = useRouter();
  const vaultsObj = computed(() => echoes.getVaults);
  const vaults = ref<Vault[]>([]);
  const migrationAlert = ref(localStorage.getItem('echoes-migration') === 'true');
  localStorage.setItem('echoes-migration', 'false');
  const placeholderAlert = ref(true);
  const joinDemoVault = () => {
    const vault = echoes.createVault({
      name: 'Demo Vault',
      url: 'echoes-demo-server.240284308.xyz',
      token: '',
      collaboration: {
        password: 'password',
      },
    });
    echoes.setOptions({
      ...echoes.getOptions,
      openVault: vault.id,
    });
    router.push(`/${vault.id}`);
  }

  const handleOpenVault = (vault: Vault) => {
    echoes.setOptions({
      ...echoes.getOptions,
      openVault: vault.id,
    });
    echoes.updateVault({
      ...vault,
      lastOpened: new Date().toISOString()
    });
    router.push(`/${vault.id}`);
  }

  onMounted(() => {
    vaults.value = Object.values(vaultsObj.value).sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
  });
  watch(vaultsObj, (newValue) => {
    vaults.value = Object.values(newValue).sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
  });
  const testClick = () => {
    console.log(useInstance());
  }
</script>

<template>
  <div>
    <echoes-app-header>
    </echoes-app-header>
    <div class="relative h-0 w-full">
      <div class="absolute left-1/2 -translate-x-1/2 flex flex-col gap-y-1">
        <!-- Placeholder Alert -->
        <div v-show="placeholderAlert" class="text-white bg-red-500 max-w-screen-lg rounded px-3 py-4 w-full flex items-center justify-between">
          <div>
            <span class="font-bold uppercase">Alert: </span>
            <span class="text-sm">This is early an access software application. Changes are going to be made to both the UI & Data structure. Do not store information that will need to persist between updates.</span>
          </div>
          <echoes-ui-button @click="placeholderAlert = false" :background="false" :hover="false" class="text-sm" size="small">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </echoes-ui-button>
        </div>
        
        <!-- Migration Alert -->
         <div v-show="migrationAlert" class="text-white bg-amber-500 max-w-screen-lg rounded px-3 py-4 w-full flex items-center justify-between">
           <div>
             <span class="font-bold uppercase">Alert: </span>
             <span class="text-sm">You have been migrated from an older version. This means that your old vaults were removed. Sorry for the inconvenience</span>
           </div>
           <echoes-ui-button @click="placeholderAlert = false" :background="false" :hover="false" class="text-sm" size="small">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
               <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
             </svg>
           </echoes-ui-button>
         </div>
       </div>
    </div>
    <div class="flex justify-center items-center h-full">
      <echoes-ui-container size="lg" class="flex flex-col w-full gap-y-4 text-center">
        <div class="flex flex-wrap justify-center">
          <div class="flex justify-center items-center flex-col w-full">
            <svg width="220" height="65" viewBox="0 0 44 13" xmlns="http://www.w3.org/2000/svg" class="landing-banner-logo">
              <g clip-path="url(#clip0_33_3)">
                <path style="--i: 1" class="fill-dark dark:fill-white" d="M1.05682 12V3.27273H6.32386V4.21023H2.11364V7.15909H6.05114V8.09659H2.11364V11.0625H6.39205V12H1.05682Z"/>
                <path style="--i: 2" class="fill-dark dark:fill-white" d="M11.5795 12.1364C10.9659 12.1364 10.4375 11.9915 9.99432 11.7017C9.55114 11.4119 9.21023 11.0128 8.97159 10.5043C8.73295 9.99574 8.61364 9.41477 8.61364 8.76136C8.61364 8.09659 8.7358 7.50994 8.98011 7.00142C9.22727 6.49006 9.57102 6.09091 10.0114 5.80398C10.4545 5.5142 10.9716 5.36932 11.5625 5.36932C12.0227 5.36932 12.4375 5.45455 12.8068 5.625C13.1761 5.79545 13.4787 6.03409 13.7145 6.34091C13.9503 6.64773 14.0966 7.00568 14.1534 7.41477H13.1477C13.071 7.11648 12.9006 6.85227 12.6364 6.62216C12.375 6.3892 12.0227 6.27273 11.5795 6.27273C11.1875 6.27273 10.8438 6.375 10.5483 6.57955C10.2557 6.78125 10.027 7.06676 9.86222 7.43608C9.70028 7.80256 9.61932 8.23295 9.61932 8.72727C9.61932 9.23295 9.69886 9.6733 9.85795 10.0483C10.0199 10.4233 10.2472 10.7145 10.5398 10.9219C10.8352 11.1293 11.1818 11.233 11.5795 11.233C11.8409 11.233 12.0781 11.1875 12.2912 11.0966C12.5043 11.0057 12.6847 10.875 12.8324 10.7045C12.9801 10.5341 13.0852 10.3295 13.1477 10.0909H14.1534C14.0966 10.4773 13.956 10.8253 13.7315 11.1349C13.5099 11.4418 13.2159 11.6861 12.8494 11.8679C12.4858 12.0469 12.0625 12.1364 11.5795 12.1364Z"/>
                <path style="--i: 3" class="fill-dark dark:fill-white" d="M16.9261 8.0625V12H15.9205V3.27273H16.9261V6.47727H17.0114C17.1648 6.1392 17.3949 5.87074 17.7017 5.67188C18.0114 5.47017 18.4233 5.36932 18.9375 5.36932C19.3835 5.36932 19.7741 5.45881 20.1094 5.63778C20.4446 5.81392 20.7045 6.08523 20.8892 6.4517C21.0767 6.81534 21.1705 7.27841 21.1705 7.84091V12H20.1648V7.90909C20.1648 7.3892 20.0298 6.98722 19.7599 6.70312C19.4929 6.41619 19.1222 6.27273 18.6477 6.27273C18.3182 6.27273 18.0227 6.34233 17.7614 6.48153C17.5028 6.62074 17.2983 6.82386 17.1477 7.09091C17 7.35795 16.9261 7.68182 16.9261 8.0625Z"/>
                <path style="--i: 4" class="fill-dark dark:fill-white" d="M26.5795 12.1364C25.9886 12.1364 25.4702 11.9957 25.0241 11.7145C24.581 11.4332 24.2344 11.0398 23.9844 10.5341C23.7372 10.0284 23.6136 9.4375 23.6136 8.76136C23.6136 8.07955 23.7372 7.48437 23.9844 6.97585C24.2344 6.46733 24.581 6.07244 25.0241 5.79119C25.4702 5.50994 25.9886 5.36932 26.5795 5.36932C27.1705 5.36932 27.6875 5.50994 28.1307 5.79119C28.5767 6.07244 28.9233 6.46733 29.1705 6.97585C29.4205 7.48437 29.5455 8.07955 29.5455 8.76136C29.5455 9.4375 29.4205 10.0284 29.1705 10.5341C28.9233 11.0398 28.5767 11.4332 28.1307 11.7145C27.6875 11.9957 27.1705 12.1364 26.5795 12.1364ZM26.5795 11.233C27.0284 11.233 27.3977 11.1179 27.6875 10.8878C27.9773 10.6577 28.1918 10.3551 28.331 9.98011C28.4702 9.60511 28.5398 9.19886 28.5398 8.76136C28.5398 8.32386 28.4702 7.91619 28.331 7.53835C28.1918 7.16051 27.9773 6.85511 27.6875 6.62216C27.3977 6.3892 27.0284 6.27273 26.5795 6.27273C26.1307 6.27273 25.7614 6.3892 25.4716 6.62216C25.1818 6.85511 24.9673 7.16051 24.8281 7.53835C24.6889 7.91619 24.6193 8.32386 24.6193 8.76136C24.6193 9.19886 24.6889 9.60511 24.8281 9.98011C24.9673 10.3551 25.1818 10.6577 25.4716 10.8878C25.7614 11.1179 26.1307 11.233 26.5795 11.233Z"/>
                <path style="--i: 5" class="fill-dark dark:fill-white" d="M34.6648 12.1364C34.0341 12.1364 33.4901 11.9972 33.0327 11.7188C32.5781 11.4375 32.2273 11.0455 31.9801 10.5426C31.7358 10.0369 31.6136 9.44886 31.6136 8.77841C31.6136 8.10795 31.7358 7.51705 31.9801 7.00568C32.2273 6.49148 32.571 6.09091 33.0114 5.80398C33.4545 5.5142 33.9716 5.36932 34.5625 5.36932C34.9034 5.36932 35.2401 5.42614 35.5724 5.53977C35.9048 5.65341 36.2074 5.83807 36.4801 6.09375C36.7528 6.34659 36.9702 6.68182 37.1321 7.09943C37.294 7.51705 37.375 8.03125 37.375 8.64205V9.06818H32.3295V8.19886H36.3523C36.3523 7.82955 36.2784 7.5 36.1307 7.21023C35.9858 6.92045 35.7784 6.69176 35.5085 6.52415C35.2415 6.35653 34.9261 6.27273 34.5625 6.27273C34.1619 6.27273 33.8153 6.37216 33.5227 6.57102C33.233 6.76705 33.0099 7.02273 32.8537 7.33807C32.6974 7.65341 32.6193 7.99148 32.6193 8.35227V8.93182C32.6193 9.42614 32.7045 9.84517 32.875 10.1889C33.0483 10.5298 33.2884 10.7898 33.5952 10.9688C33.902 11.1449 34.2585 11.233 34.6648 11.233C34.929 11.233 35.1676 11.196 35.3807 11.1222C35.5966 11.0455 35.7827 10.9318 35.9389 10.7812C36.0952 10.6278 36.2159 10.4375 36.3011 10.2102L37.2727 10.483C37.1705 10.8125 36.9986 11.1023 36.7571 11.3523C36.5156 11.5994 36.2173 11.7926 35.8622 11.9318C35.5071 12.0682 35.108 12.1364 34.6648 12.1364Z"/>
                <path style="--i: 6" class="fill-dark dark:fill-white" d="M43.5568 6.92045L42.6534 7.17614C42.5966 7.02557 42.5128 6.87926 42.402 6.73722C42.294 6.59233 42.1463 6.47301 41.9588 6.37926C41.7713 6.28551 41.5312 6.23864 41.2386 6.23864C40.8381 6.23864 40.5043 6.33097 40.2372 6.51562C39.973 6.69744 39.8409 6.92898 39.8409 7.21023C39.8409 7.46023 39.9318 7.65767 40.1136 7.80256C40.2955 7.94744 40.5795 8.06818 40.9659 8.16477L41.9375 8.40341C42.5227 8.54545 42.9588 8.76278 43.2457 9.0554C43.5327 9.34517 43.6761 9.71875 43.6761 10.1761C43.6761 10.5511 43.5682 10.8864 43.3523 11.1818C43.1392 11.4773 42.8409 11.7102 42.4574 11.8807C42.0739 12.0511 41.6278 12.1364 41.1193 12.1364C40.4517 12.1364 39.8991 11.9915 39.4616 11.7017C39.0241 11.4119 38.7472 10.9886 38.6307 10.4318L39.5852 10.1932C39.6761 10.5455 39.848 10.8097 40.1009 10.9858C40.3565 11.1619 40.6903 11.25 41.1023 11.25C41.571 11.25 41.9432 11.1506 42.2188 10.9517C42.4972 10.75 42.6364 10.5085 42.6364 10.2273C42.6364 10 42.5568 9.80966 42.3977 9.65625C42.2386 9.5 41.9943 9.38352 41.6648 9.30682L40.5739 9.05114C39.9744 8.90909 39.5341 8.68892 39.2528 8.39062C38.9744 8.08949 38.8352 7.71307 38.8352 7.26136C38.8352 6.89205 38.9389 6.56534 39.1463 6.28125C39.3565 5.99716 39.642 5.77415 40.0028 5.61222C40.3665 5.45028 40.7784 5.36932 41.2386 5.36932C41.8864 5.36932 42.3949 5.51136 42.7642 5.79545C43.1364 6.07955 43.4006 6.45455 43.5568 6.92045Z"/>
              </g>
            </svg>
            <p class="text-sm font-medium text-neutral-500 pt-1">Early Access Version 1.2.0</p>
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
                <echoes-ui-button @click="echoes.deleteVault(vault.id)" class="text-neutral-500 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-500 absolute right-0 text-sm" :background="false" :hover="false" size="small">
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
                  Join Vault (Experimental)
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
