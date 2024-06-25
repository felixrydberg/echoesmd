<script setup lang="ts">
import { onMounted } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  })

  const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <slot name="button"></slot>
  <Teleport to="#overlay-container">
    <Transition v-if="modelValue">
      <div class="h-screen w-screen bg-black/50 transition-colors flex justify-center items-center" @click="emits('update:modelValue', false)">
        <div @click.stop>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>