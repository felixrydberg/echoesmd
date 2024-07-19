<script setup lang="ts">
  import EchoesAppHeader from '../../components/ui/header.vue';
  import { EchoesUiButton, EchoesUiContainer } from '@echoesmd/ui';
</script>

<template>
  <EchoesAppHeader>
    <template #prepend>
      <echoes-ui-button :link="`/${$route.params.vault}`" class="h-6 w-6" size="small">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
          <path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
        </svg>
      </echoes-ui-button>
    </template>
    Settings
  </EchoesAppHeader>
  <echoes-ui-container>
    
  </echoes-ui-container>
</template>
