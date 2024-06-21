<script setup lang="ts">
import { useInstance } from '@/instance';
import * as Y from 'yjs';

const ydoc = new Y.Doc({guid: 'scarlettmd'});
const instance = useInstance();
instance.register(ydoc);
</script>

<template>
  <div class="text-white">
    <scarlettmd-vault />
  </div>
</template>
