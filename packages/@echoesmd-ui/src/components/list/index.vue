<script setup lang="ts">
  import { PropType } from 'vue';
import UiBase from '../templates/base.vue';
  import UiListItem from './item.vue';
import { twMerge } from 'tailwind-merge';

  const props = defineProps({
    class: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    children: {
      type: Array as PropType<string[]>,
      default: []
    }
  })
</script>

<template>
  <ui-base hover="none" background="none" tag="ul" :class="twMerge('ml-4', ...props.class.split(' '))">
    <ui-list-item v-if="title" class="font-semibold text-base">{{ props.title }}</ui-list-item>
    <ui-list-item v-else-if="subtitle" class="font-semibold text-sm ">{{ props.subtitle }}</ui-list-item>
    <slot>
      <ui-list-item v-for="item in props.children" :key="item" class="text-sm">{{ item }}</ui-list-item>
    </slot>
  </ui-base>
</template>
