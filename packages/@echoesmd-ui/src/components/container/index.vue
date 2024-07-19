<script setup lang="ts">
  import UiBase from '../templates/base.vue';
  import { border } from '../../variables';
  import { PropType, computed } from 'vue';
import { twMerge } from 'tailwind-merge';
  const props = defineProps({
    class: {
      type: String,
      default: ''
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    border: {
      type: String as PropType<keyof typeof border>,
      default: "none"
    },
    size: {
      type: String as PropType<"sm" | "md" | "lg" | "xl" | "2xl" | "full">,
      default: "full"
    }
  })

  const shadow = computed(() => {
    return props.shadow ? 'container' : 'none';
  })

  const getSize = () => {
    switch (props.size) {
      case 'sm':
        return 'max-w-sm mx-auto w-screen';
      case 'md':
        return 'max-w-md mx-auto w-screen';
      case 'lg':
        return 'max-w-lg mx-auto w-screen';
      case 'xl':
        return 'max-w-xl mx-auto w-screen';
      case '2xl':
        return 'max-w-2xl mx-auto w-screen';
      case 'full':
        return 'max-w-none';
    }
  }
</script>

<template>
  <ui-base :border="props.border" :shadow="shadow" :class="twMerge(getSize(), props.class)">
    <slot />
  </ui-base>
</template>
