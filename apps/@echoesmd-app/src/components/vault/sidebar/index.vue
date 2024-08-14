<script setup lang="ts">
import VaultSidebarListItem from '../../../components/vault/sidebar/list/item.vue';
import { useInstance } from '../../../instance';
import { computed, ref } from 'vue';
import { EchoesUiContainer, EchoesUiContainerItem, EchoesUiList, EchoesUiListItem, EchoesUiButton, typography } from '@echoesmd/ui';
import { useEchoesStore } from '../../../store/echoes';
import { useRouter } from 'vue-router';
import EchoesUiModal from '../../ui/modal.vue';
import Settings from '../../settings/index.vue';

const instance = useInstance();

const echoes = useEchoesStore();
const router = useRouter();
const tree = computed(() => echoes.getTree());
const files = computed(() => echoes.getFiles());
const trash = computed(() => echoes.getTrash());

const trashModal = ref(false);
const settingsModal = ref(false);

const handleOpenVault = () => {
  router.push('/');
}
const handleCreateFile = () => {
  instance.createItem({
    name: "New File " + files.value?.length,
    type: "page",
    parent: "root",
    component: "file-default",
  });
}

const handleCreateFolder = () => {
  instance.createItem({
    name: "New Folder",
    type: "folder",
    parent: "root",
    component: "folder",
  });
}
</script>

<template>
  <echoes-ui-container class="border-t-0 border-b-0 border-l-0 border-r" border="item">
    <div class="flex flex-col justify-between h-full w-full">
      <echoes-ui-list class="px-2 flex flex-col gap-y-1 h-full ml-0">
        <echoes-ui-list-item class="flex gap-x-2 py-2 pb-1">
          <echoes-ui-button size="small" :class="typography.secondary" class="flex justify-center w-full transition-colors" @click="handleCreateFile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
            </svg>
          </echoes-ui-button>
          <echoes-ui-button size="small" :class="typography.secondary" class="flex justify-center w-full transition-colors" @click="handleCreateFolder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" />
            </svg>
          </echoes-ui-button>
        </echoes-ui-list-item>
        <div class="overflow-y-scroll overflow-x-hidden max-h-[50vh]">
          <vault-sidebar-list-item v-for="file in tree" :key="file.id" :file="file" />
        </div>
      </echoes-ui-list>
      <echoes-ui-list class="px-2 flex flex-col gap-y-1 ml-0 h-full">
        <echoes-ui-list-item class="text-xs font-bold p-1 text-neutral-500">
          Controls
        </echoes-ui-list-item>
        <!-- Trash -->
        <echoes-ui-list-item class="flex text-xs">
          <echoes-ui-button size="small" class="w-full" @click="trashModal = !trashModal">  
            <div class="flex items-center gap-x-1">
              <div class="text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="select-none whitespace-nowrap">Trash</span>
            </div>
          </echoes-ui-button>
          <echoes-ui-modal v-model="trashModal">
            <echoes-ui-container class="flex flex-col p-2 rounded-lg min-w-96 max-w-screen-lg">
              <div class="flex items-center pr-6">
                <echoes-ui-button @click="trashModal = false" class="h-6 w-6" size="small">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                  </svg>
                </echoes-ui-button>
                <p class="text-lg font-bold w-full text-center">Trash</p>
              </div>
              <div class="h-full">
                <echoes-ui-list v-if="trash.length > 0" class="m-0 max-h-96 overflow-y-scroll overflow-x-hidden">
                  <echoes-ui-list-item v-for="item in trash">
                    <echoes-ui-container-item hover class="flex items-center justify-between my-1 p-1 px-2 rounded-lg">

                      <div class="flex items-center">
                        <svg v-if="item.type === 'folder'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4 fill-neutral-500">
                          <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4 fill-neutral-500">
                          <path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                        </svg>
                        {{ item.name }}
                      </div>
                      <div class="flex items-center gap-x-1">
                        <echoes-ui-button class="py-1 text-black dark:text-white hover:text-green-600 hover:dark:text-green-600" :background="false" :hover="false" @click="instance.restoreItem(item.id)">
                          Restore
                        </echoes-ui-button>
                        <echoes-ui-button class="py-1 text-black dark:text-white hover:text-red-600 dark:hover:text-red-600 text-semibold" :background="false" :hover="false" @click="instance.deleteItem(item.id)">
                          Trash
                        </echoes-ui-button>
                      </div>

                    </echoes-ui-container-item>
                  </echoes-ui-list-item>
                </echoes-ui-list>
                <div v-else class="flex justify-center items-center h-64">
                  <p class="text-center text-sm text-neutral-500">No items in trash</p>
                </div>
              </div>
            </echoes-ui-container>
          </echoes-ui-modal>
        </echoes-ui-list-item>
        <!-- Settings -->
        <echoes-ui-list-item class="flex text-xs">
          <echoes-ui-button size="small" class="w-full" @click="settingsModal = !settingsModal">
            <div class="flex items-center gap-x-1">
              <div class="text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                  <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="select-none whitespace-nowrap">Settings</span>
            </div>
          </echoes-ui-button>
          <Settings v-model="settingsModal" />
        </echoes-ui-list-item>
        <!-- Vaults -->
        <echoes-ui-list-item class="flex text-xs">
          <echoes-ui-button @click="handleOpenVault" size="small" class="w-full">
            <div class="flex items-center gap-x-1">
              <div class="text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
                  <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z" />
                </svg>
              </div>
              <span class="select-none whitespace-nowrap">Vaults</span>
            </div>
          </echoes-ui-button>
        </echoes-ui-list-item>
      </echoes-ui-list>
    </div>
  </echoes-ui-container>
</template>