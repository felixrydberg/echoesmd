<script setup lang="ts">
import { useInstance } from '@/instance';
import { useVaultStore } from '@/store/vault';
import { ItemTree } from '@/types';
import { twMerge } from 'tailwind-merge';
import tippy from 'tippy.js';
import { PropType, computed, onMounted, ref } from 'vue';

const props = defineProps({
  file: {
    type: Object as PropType<ItemTree>,
    required: true,
  },
  child: {
    type: Boolean,
    default: false,
    required: false,
  }
});

const vault = useVaultStore();
const openDropdown = ref(false);
const active = computed(() => vault.getActiveTab)

const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
};
const handleItemClick = () => {
  if (props.file.type === 'page') {
    instance.loadPage(props.file.id);
  } else {
    openDropdown.value = !openDropdown.value;
  }
}
const handleAddItem = () => {
  if (props.file.type === 'folder') {
    instance.createItem({
      addOptions() {
        return {
          name: "New File",
          type: "page",
          parent: props.file.id,
          component: "scarlettmd-editor",
        }
      }
    })
  } else {
    instance.createItem({
      addOptions() {
        return {
          name: "New File",
          type: "page",
          parent: props.file.parent,
          previous: props.file.id,
          component: "scarlettmd-editor",
        }
      }
    })
  }
}
const instance = useInstance();
</script>

<template>
  <li>
    <div class="flex justify-between hover:bg-neutral-900 transition-colors rounded p-1 px-2" :class="active.id === file.id ? 'bg-neutral-900' : 'bg-neutral-950'" @click.stop="handleItemClick">
      <div class="flex items-center gap-x-1">
        <div class="text-neutral-500">
          <div v-if="file.type === 'folder'" class="flex gap-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4" :class="{'rotate-90': openDropdown}">
              <path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" />
            </svg>
          </div>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
            <path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="select-none">{{ file.name }}</span>
      </div>
      <template v-if="!child">
        <button @click="instance.restoreItem(file.id)" class="rounded flex items-center hover:bg-neutral-800 p-1 px-2">
          Restore
        </button>
        <button @click="instance.deleteItem(file.id)" class="rounded flex items-center text-red-500 hover:bg-neutral-800 p-1 px-2">
          Trash
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
            <path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" />
          </svg>
        </button>
      </template>
    </div>
    <ul v-if="file.type === 'folder'" class="transition-[max-height] overflow-x-hidden mt-1 pl-4" :class="openDropdown ? 'max-h-fit' : 'max-h-0'">
      <TrashListItem v-for="_file in file.children" :key="_file.id" :file="_file" child />
    </ul>
  </li>
</template>
