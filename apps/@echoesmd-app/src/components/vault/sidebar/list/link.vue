<script setup lang="ts">
import {
  EchoesUiContainer,
  EchoesUiListItem,
} from '@echoesmd/ui';

const props = defineProps({
  link: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <echoes-ui-list-item class="flex text-xs">
    <RouterLink :to="link">
      <echoes-ui-container hover class="flex justify-between cursor-pointer p-1 rounded w-full text-xs font-normal">
        <div class="flex items-center gap-x-1">
          <div class="text-neutral-500">
  
          </div>
          <span class="select-none whitespace-nowrap">{{ text }}</span>
        </div>
      </echoes-ui-container>
    </RouterLink>
  </echoes-ui-list-item>
</template>
