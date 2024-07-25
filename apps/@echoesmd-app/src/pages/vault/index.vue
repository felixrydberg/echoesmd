<script setup lang="ts">
  import Vault from '../../components/vault/index.vue';
</script>

<template>
  <vault :name="($route.params.vault as string)" />
</template>
