<script setup lang="ts">
import { useInstance } from '../../../../instance';
import { ItemTree } from '../../../../types';
import { twMerge } from 'tailwind-merge';
import tippy, { Instance, Props } from 'tippy.js';
import { PropType, nextTick, onMounted, ref, watch } from 'vue';
import {
  EchoesUiContainer,
  EchoesUiList,
  EchoesUiListItem,
  background,
  hover,
  border
} from '@echoesmd/ui';

const props = defineProps({
  file: {
    type: Object as PropType<ItemTree>,
    required: true,
  },
});

const openDropdown = ref(false);
const edit = ref(false);
const name = ref('');

const handleItemClick = () => {
  if (props.file.type === 'page') {
    console.log('load page');
    instance.loadPage(props.file.id);
  } else {
    openDropdown.value = !openDropdown.value;
  }
}
const handleSubmit = () => {
  if (name.value) {
    instance.updateItemName(props.file.id, name.value);
    edit.value = false;
  }
}

const createTippy = (button: HTMLElement) => {
  const div = document.createElement("div");
  const _tippyInstance = tippy(button, {
    content: div,
    allowHTML: true,
    interactive: true,
    placement: "auto-start",
    trigger: "click",
  });

  const plusFileButton = document.createElement("button");
  const plusFolderButton = document.createElement("button");
  const editButton = document.createElement("button");
  const trashButton = document.createElement("button");

  div.setAttribute("class", twMerge(background.container, border.item, "flex flex-col gap-y-1 p-2 rounded w-32"));

  plusFileButton.innerHTML = 'Add file<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>';
  plusFolderButton.innerHTML = 'Add folder<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>';
  editButton.innerHTML = 'Edit file<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z" clip-rule="evenodd" /></svg>';
  trashButton.innerHTML = 'Trash<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" /></svg>';

  div.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  plusFileButton.addEventListener("click", () => {
    if (props.file.type === 'folder') {
      instance.createItem({
        addOptions() {
          return {
            name: "New File",
            type: "page",
            parent: props.file.id,
            component: "echoesmd-editor",
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
            component: "echoesmd-editor",
          }
        }
      })
    }
    _tippyInstance.hide();
  });
  plusFolderButton.addEventListener("click", () => {
    if (props.file.type === 'folder') {
      instance.createItem({
        addOptions() {
          return {
            name: "New Folder",
            type: "folder",
            parent: props.file.id,
            component: "echoesmd-editor",
          }
        }
      })
    } else {
      instance.createItem({
        addOptions() {
          return {
            name: "New Folder",
            type: "folder",
            parent: props.file.parent,
            previous: props.file.id,
            component: "echoesmd-editor",
          }
        }
      })
    }
    _tippyInstance.hide();
  })
  editButton.addEventListener("click", () => {
    edit.value = true;
    name.value = props.file.name;
    nextTick(() => {
      const input = document.querySelector(`#input-${props.file.id}`) as HTMLElement;
      if (input) {
        input.focus();
      }
      _tippyInstance.hide();
    });
  });
  trashButton.addEventListener("click", () => {
    instance.trashItem(props.file.id);
    _tippyInstance.hide();
  });

  plusFileButton.setAttribute("title", "Add File");
  plusFolderButton.setAttribute("title", "Add Folder");
  editButton.setAttribute("title", "Edit File");
  trashButton.setAttribute("title", "Trash File");

  const base = [
    "cursor-pointer",
    "text-sm",
    "flex",
    "p-1",
    "px-2",
    "items-center",
    "justify-between",
    "transition-colors",
    "rounded",
    background.item,
    hover.item,
  ];

  plusFileButton.setAttribute("class", twMerge(...base));
  plusFolderButton.setAttribute("class", twMerge(...base));
  editButton.setAttribute("class", twMerge(...base));
  trashButton.setAttribute("class", twMerge(...base, "text-red-500 dark:text-red-500"));
  div.appendChild(plusFileButton);
  div.appendChild(plusFolderButton);
  div.appendChild(editButton);
  div.appendChild(trashButton);

  return _tippyInstance;
}
 
const button = ref<HTMLElement | undefined>()
let tippyInstance: Instance<Props> | undefined;
onMounted(() => {
  if (button.value) {
    tippyInstance = createTippy(button.value);
  }
})

watch(edit, (value) => {
  nextTick(() => {
    if (!value && button.value) {
      tippyInstance?.destroy();
      tippyInstance = createTippy(button.value);
    }
  });
})

const instance = useInstance();
</script>

<template>
  <echoes-ui-list-item>
    <echoes-ui-container hover class="flex justify-between cursor-pointer p-1 rounded w-full text-xs font-normal" @click.stop="handleItemClick">
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
          <form v-if="edit" @submit.stop.prevent="handleSubmit">
            <input v-model="name" @click.stop @blur="handleSubmit" :id="`input-${file.id}`" class="w-full" />
          </form>
          <span v-else class="select-none whitespace-nowrap">{{ file.name }}</span>
        </div>
        <button ref="button" @click.stop>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
            <path d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM9.5 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
          </svg>
        </button>
    </echoes-ui-container>
    <echoes-ui-list v-if="file.type === 'folder'" class="overflow-x-hidden flex flex-col gap-y-1" :class="openDropdown ? 'h-fit pt-1' : 'h-0'">
      <Item v-for="_file in file.children" :key="_file.id" :file="_file" />
    </echoes-ui-list>
  </echoes-ui-list-item>
</template>
