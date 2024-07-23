<script setup lang="ts">
  import EchoesAppHeader from '../../components/ui/header.vue';

</script>

<template>
  <EchoesAppHeader />
  File {{ ($route.params.vault) }} {{ ($route.params.id) }}
</template>
