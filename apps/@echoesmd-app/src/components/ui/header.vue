<script setup lang="ts">
  import { EchoesUiHeader, EchoesUiButton } from '@echoesmd/ui';
  import { watch, computed, onMounted } from 'vue';
  import { useEchoesStore } from '../../store/echoes';

  const echoes = useEchoesStore();
  const tauri = computed(() => echoes.getTauri);
  
  const handleTauri = async (value) => {
    if (value) {
      const minimize = document.querySelector('#tauri-minimize');
      const maximize = document.querySelector('#tauri-maximize');
      const close = document.querySelector('#tauri-close');
      const { appWindow } = await import('@tauri-apps/api/window');
      [minimize, maximize, close].forEach((el) => {
        el?.addEventListener('click', () => {
          const action = el.id.split('-')[1];
          switch (action) {
            case 'minimize':
              appWindow.minimize();
              break;
            case 'maximize':
              appWindow.toggleMaximize();
              break;
            case 'close':
              appWindow.close();
              break;
          }
        });
      });
    }
  }

  onMounted(() => handleTauri(tauri.value));
  watch(tauri, handleTauri);
</script>

<template>
  <echoes-ui-header class="h-10 p-[4px] px-[6px]" border>
    <div class="flex justify-between items-center h-full" data-tauri-drag-region>
      <div class="flex gap-x-1 w-24 h-6">
        <slot name="prepend"></slot>
      </div>
      <div class="flex justify-center items-center w-1/2">
        <slot name="default"></slot>
      </div>
      <div class="flex flex-row-reverse gap-x-1 w-24 h-6">
        <slot name="append">
          <template v-if="tauri">
            <echoes-ui-button class="hover:text-red-500 dark:hover:text-red-500" size="small" :background="false" id="tauri-close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </echoes-ui-button>
            <echoes-ui-button class="hover:text-green-500 dark:hover:text-green-500" size="small" :background="false" id="tauri-maximize">
              <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :class="{'rotate-180': !sidebar}" class="size-4">
                <path fill-rule="evenodd" d="M14 4.75A2.75 2.75 0 0 0 11.25 2h-3A2.75 2.75 0 0 0 5.5 4.75v.5a.75.75 0 0 0 1.5 0v-.5c0-.69.56-1.25 1.25-1.25h3c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-3c-.69 0-1.25-.56-1.25-1.25v-.5a.75.75 0 0 0-1.5 0v.5A2.75 2.75 0 0 0 8.25 14h3A2.75 2.75 0 0 0 14 11.25v-6.5Zm-9.47.47a.75.75 0 0 0-1.06 0L1.22 7.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-.97-.97h7.19a.75.75 0 0 0 0-1.5H3.56l.97-.97a.75.75 0 0 0 0-1.06Z" clip-rule="evenodd" />
              </svg> -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5">
                <path fill-rule="evenodd" d="M2.75 9a.75.75 0 0 1 .75.75v1.69l2.22-2.22a.75.75 0 0 1 1.06 1.06L4.56 12.5h1.69a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 2.75 9ZM2.75 7a.75.75 0 0 0 .75-.75V4.56l2.22 2.22a.75.75 0 0 0 1.06-1.06L4.56 3.5h1.69a.75.75 0 0 0 0-1.5h-3.5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75ZM13.25 9a.75.75 0 0 0-.75.75v1.69l-2.22-2.22a.75.75 0 1 0-1.06 1.06l2.22 2.22H9.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM13.25 7a.75.75 0 0 1-.75-.75V4.56l-2.22 2.22a.75.75 0 1 1-1.06-1.06l2.22-2.22H9.75a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75Z" clip-rule="evenodd" />
              </svg>
            </echoes-ui-button>
            <echoes-ui-button class="hover:text-orange-500 dark:hover:text-orange-500" size="small" :background="false" id="tauri-minimize">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
              </svg>
            </echoes-ui-button>
          </template>
        </slot>
      </div>
    </div>
  </echoes-ui-header>
</template>
