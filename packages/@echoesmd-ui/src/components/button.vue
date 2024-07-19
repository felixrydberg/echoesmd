<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import UiBase from './templates/base.vue';
import { PropType } from 'vue';

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  hover: {
    type: Boolean,
    default: true
  },
  background: {
    type: Boolean,
    default: true,
  },
  default: {
    type: Boolean,
    default: true
  },
  primary: {
    type: Boolean,
    default: false
  },
  secondary: {
    type: Boolean,
    default: false
  },
  size: {
    type: String as PropType<'small' | 'normal' | 'large'>,
    default: 'normal'
  },
  link: {
    type: String,
    default: ''
  }
})

const getDefault = () => {
  switch (true) {
    case props.primary:
      return 'primary';
    case props.secondary:
      return 'secondary';
    default:
      return 'item';
  }
};

const item = getDefault();
const hover = props.hover ? item : 'none';
const background = props.background ? item : 'none';

const size = () => {
  switch (props.size) {
    case 'small':
      return 'p-1 rounded';
    case 'normal':
      return 'p-2 rounded-lg';
    case 'large':
      return 'p-3 rounded-lg';
  }
  return 'p-2 rounded-lg';
};
</script>

<template>
  <ui-base
    :tag="link === '' ? 'button' : 'RouterLink'"
    v-bind="{
      to: link === '' ? false : link
    }"
    transition
    :hover="hover"
    :background="background"
    :class="twMerge(size(), ...props.class.split(' '))"
  >
    <slot></slot>
  </ui-base>
</template>
