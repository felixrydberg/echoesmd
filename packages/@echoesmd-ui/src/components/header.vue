<script setup lang="ts">
  import { computed } from 'vue';
import UiBase from './templates/base.vue';
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
      type: Boolean,
      default: false,
    }
  })

  const shadow = computed(() => {
    return props.shadow ? 'container' : 'none';
  })
  const border = computed(() => {
    return props.border ? 'item' : 'none';
  })
</script>

<template>
  <ui-base
    class="rounded p-2 w-full z-20"
    :shadow="shadow"
    :border="border"
    :class="props.class"
  >
    <slot />
  </ui-base>
</template>
