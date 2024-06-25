<script setup lang="ts">
const options = {
  providers: {
    webrtc: {
      options: {
        signaling: ['ws:localhost:4444'],
      }
    }
  }
};
</script>

<template>
  <scarlettmd-vault name="scarlettmd" :options="options" />
</template>
