<script setup lang="ts">
  import { twMerge } from 'tailwind-merge';
import UiBase from '../templates/base.vue';
  
  const props = defineProps({
    class: {
      type: String,
      default: ''
    },
  })
</script>

<template>
  <ui-base hover="none" background="none" tag="li" :class="twMerge('text-sm', ...props.class.split(' '))">
    <slot />
  </ui-base>
</template>
