<script setup lang="ts">
import ListItem from '@/components/vault/sidebar/list-item.vue';
import { useInstance } from '@/instance';
import { ItemOptions, ItemTree } from '@/types';
import { onMounted, onUnmounted, ref } from 'vue';

const instance = useInstance();
const files = ref<ItemTree[]>([]);

const handleFileAdded = (...args: unknown[]) => {
  console.log(...args)
}

const handleCreateFile = () => {
  const item: ItemOptions = {
    name: "New File",
    type: "page",
    // parent: "d9b8733a-68df-4163-8963-a9482dc309fd"
  }
  instance.createItem(item);
}
const handleCreateFolder = () => {
  const item: ItemOptions = {
    name: "New Folder",
    type: "folder",
    // parent: "21eef3ec-62a8-4348-b110-7b7dcadde5e3"
  }
  instance.createItem(item);
}
const handleTreeUpdate = (tree: ItemTree[]) => {
  console.log(tree)
  files.value = tree;
}

onMounted(() => {
  instance.subscribe("page:added", handleFileAdded);
  instance.subscribe("tree:update", (...args) => handleTreeUpdate(args[0] as ItemTree[]));
  const tree: ItemTree[] = instance.getTree();
  files.value = tree;
})
onUnmounted(() => {
  instance.unsubscribe("page:added", handleFileAdded)
})
</script>

<template>
  <div>
    <ul>
      <li>
        <button @click="handleCreateFile">Create File</button>
        <button @click="handleCreateFolder">Create Folder</button>
      </li>
      <ListItem v-for="file in files" :key="file.id" :file="file" />
    </ul>
  </div>
</template>