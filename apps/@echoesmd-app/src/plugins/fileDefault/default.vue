<script setup lang="ts">
import { computed } from 'vue';
import { useEchoesStore } from '../../store/echoes';

  const echoes = useEchoesStore();
  const files = computed(() => echoes.getFileTypes);
</script>

<template>
  {{ files }}
</template>