<script setup lang="ts">
import { useInstance } from '@/instance';
import { ItemTree } from '@/types';
import { PropType } from 'vue';

const props = defineProps({
  file: {
    type: Object as PropType<ItemTree>,
    required: true,
  },
});
const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
};

const instance = useInstance();
</script>

<template>
  <li>
    <div>
      <span>{{ file.name }}</span>
      <button @click="instance.loadPage(file.id)">Open</button>
      <button>Delete</button>
      <button @click="handleCopy(file.id)">Copy Id</button>
    </div>
    <ul v-if="file.type === 'folder'">
      <ListItem v-for="_file in file.children" :key="_file.id" :file="_file" />
    </ul>
  </li>
</template>