<script setup lang="ts">
import ListItem from '@/components/vault/sidebar/list-item.vue';
import TrashListItem from '@/components/vault/sidebar/trash-list-item.vue';
import { useInstance } from '@/instance';
import { computed, ref, watch } from 'vue';
import UiModal from '@/components/ui/modal.vue';
import Fuse from 'fuse.js';
import { useVaultStore } from '@/store/vault';

const instance = useInstance();
const fuse = new Fuse([], {
  keys: ["component", "name", "type", "parent"]
})

const vault = useVaultStore();
const tree = computed(() => vault.getTree);
const trash = computed(() => vault.getTrash);
const files = computed(() => vault.getFiles);

const trashModal = ref(false);

const searchModal = ref(false);
const searchInput = ref("");


const handleSearch = () => {
  console.log(searchInput.value)
  if (searchInput.value.length <= 2) {
    return;
  }
  const results = fuse.search(searchInput.value);
  console.log(results)
  console.log(fuse);
}

const handleCreateFile = () => {
  instance.createItem({
    addOptions() {
      return {
        name: "New File " + files.value.length,
        type: "page",
        parent: "root",
        component: "scarlettmd-editor",
      }
    }
  });
}
const handleCreateFolder = () => {
  instance.createItem({
    addOptions() {
      return {
        name: "New Folder",
        type: "folder",
        parent: "root",
        component: "folder",
      }
    }
  });
}

watch(() => files.value, (value) => {
  fuse.setCollection(value);
})
</script>

<template>
  <div class="border-r border-r-neutral-900 text-sm bg-neutral-950">
    <div class="flex flex-col justify-between h-full">
      <div class="flex py-4 p-2">
        <ui-modal v-model="searchModal">
          <template #button>
            <button class="bg-neutral-950 border border-neutral-900 text-neutral-500 font-semibold p-2 rounded-lg flex justify-between items-center w-full" @click="searchModal = !searchModal">
              <span class="flex items-center gap-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-5">
                  <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
                </svg>
                Search
              </span>
              <span class="flex items-center gap-x-1">
                <kbd class="border border-neutral-800 px-1 rounded">Ctrl</kbd>
                +
                <kbd class="border border-neutral-800 px-1 rounded">P</kbd>
              </span>
            </button>
          </template>
          <div class="bg-neutral-900 rounded-lg p-3">
            <input class="bg-transparent outline-none rounded-lg p-2 border border-neutral-800" type="text" v-model="searchInput" @input="handleSearch">
            <!-- Placeholder -->
            <ul v-if="searchInput.length <= 2">
              placeholder
            </ul>
            <!-- Results -->
            <ul v-else>
              Result
            </ul>
          </div>
        </ui-modal>
      </div>
      <ul class="w-48 px-2 flex flex-col gap-y-1 h-full">
        <li class="flex gap-x-2 py-2 pb-1">
          <button class="bg-neutral-950 hover:bg-neutral-900 text-neutral-500 hover:text-neutral-400 flex justify-center w-full transition-colors p-1 rounded" @click="handleCreateFile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="bg-neutral-950 hover:bg-neutral-900 text-neutral-500 hover:text-neutral-400 flex justify-center w-full transition-colors p-1 rounded" @click="handleCreateFolder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" />
            </svg>
          </button>
        </li>
        <list-item v-for="file in tree" :key="file.id" :file="file" />
      </ul>
      <ul class="w-48 px-2 flex flex-col gap-y-1 h-full">
        <li class="text-xs font-bold p-1 text-neutral-500">
          Controls
        </li>
        <li class="flex gap-x-2">
          <ui-modal v-model="trashModal">
            <template #button>
              <button @click="trashModal = !trashModal" class="bg-neutral-950 hover:bg-neutral-900 flex items-center gap-x-1 w-full transition-colors p-1 px-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4 text-neutral-500">
                  <path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" />
                </svg>
                Trash
              </button>
            </template>
            <div class="bg-neutral-950 p-2 rounded-lg">
              <div>
                <h1>Trash</h1>
                <p class="text-sm">You can choose to either restore or permanently delete files</p>
              </div>
              <ul class="flex flex-col gap-y-2">
                <trash-list-item v-for="(file, index) in trash" :file="file" :key="file.id" />
              </ul>
            </div>
          </ui-modal>
        </li>
      </ul>
    </div>
  </div>
</template>