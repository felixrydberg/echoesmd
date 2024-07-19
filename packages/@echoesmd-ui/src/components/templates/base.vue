<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { background, border, hover, shadow, transition } from '../../variables';
import { PropType } from 'vue';

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: 'div'
  },
  hover: {
    type: String as PropType<keyof typeof hover>,
    default: "none",
  },
  background: {
    type: String as PropType<keyof typeof background>,
    default: "container",
  },
  transition: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: String as PropType<keyof typeof shadow>,
    default: "none"
  },
  border: {
    type: String as PropType<keyof typeof border>,
    default: "none"
  }
})

const getClasses = () => twMerge(
  props.background !== 'none' ? background[props.background] : '',
  props.hover !== 'none' ? hover[props.hover] : '',
  props.border !== 'none' ? border[props.border] : '',
  props.transition ? transition : '',
  props.shadow ? shadow[props.shadow] : '',
  ...props.class.split(' ')
)

</script>

<template>
  <component :is="props.tag" :class="getClasses()">
    <slot></slot>
  </component>
</template>
