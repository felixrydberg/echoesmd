<script setup lang="ts">
  import { computed } from 'vue';
  import { useEchoesStore } from '../../store/echoes';
  import EchoesAppHeader from '../ui/header.vue';
  import EchoesBackButton from '../ui/back-button.vue';
  import { EchoesUiContainer, EchoesUiList, EchoesUiListItem, EchoesUiButton, border } from '@echoesmd/ui'


  const echoes = useEchoesStore();
  const options = computed(() => echoes.getOptions);
</script>

<template>
  <div class="flex flex-col">
    <echoes-app-header />
    <echoes-ui-container size="lg" class="flex flex-col h-full my-8 gap-y-4 text-center">
      <div class="flex">
        <echoes-back-button />
      </div>
      <h1 class="text-2xl">
        Settings
      </h1>
      <echoes-ui-list class="text-start mr-4">
          <echoes-ui-list-item :class="border.item" class="text-sm p-2 px-6 font-normal flex gap-x-8 my-4 justify-between items-center border-t-0 border-r-0 border-l-0">
            <div>
              <h1>Change Theme</h1>
              <p></p>
            </div>
            <echoes-ui-button @click="echoes.setOptions({...options, theme: options.theme === 'light' ? 'dark' : 'light'})">
              <svg class="size-4 block dark:hidden m-0 animate-[spin_500ms_ease]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM12.95 4.11a.75.75 0 1 0-1.06-1.06l-1.062 1.06a.75.75 0 0 0 1.061 1.062l1.06-1.061ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM11.89 12.95a.75.75 0 0 0 1.06-1.06l-1.06-1.062a.75.75 0 0 0-1.062 1.061l1.061 1.06ZM8 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12ZM5.172 11.89a.75.75 0 0 0-1.061-1.062L3.05 11.89a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM4 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 4 8ZM4.11 5.172A.75.75 0 0 0 5.173 4.11L4.11 3.05a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" />
              </svg>
              <svg class="size-4 hidden dark:block m-0 animate-[spin_500ms_ease]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
              </svg>
            </echoes-ui-button>
          </echoes-ui-list-item>
        </echoes-ui-list>
    </echoes-ui-container>
  </div>
</template>
