<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { useEchoesStore } from '../../store/echoes';
  import { EchoesUiContainer, EchoesUiList, EchoesUiListItem, EchoesUiButton, background, hover } from '@echoesmd/ui'
  import EchoesUiModal from '../ui/modal.vue'
  import { SettingsGroup } from '@echoesmd/plugin-types';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  })
  const emit = defineEmits(['update:modelValue'])

  const settingsModal = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const echoes = useEchoesStore();
  const settings = computed(() => echoes.getSettings);
  const sections = reactive(Object.groupBy(Object.values(settings.value), (setting) => setting.section))

  const activeSection = ref<keyof typeof settings.value>(settings.value[Object.keys(settings.value)[0]].id)

  const handleGroupItemClick = (group: SettingsGroup) => {
    if (group.type === 'button') {
      group.action()
      return;
    } else {
      activeSection.value = group.id
    }
  }

  console.log(sections)
</script>

<template>
  <echoes-ui-modal v-model="settingsModal">
    <echoes-ui-container class="flex flex-col p-2 rounded-lg max-w-[1200px] h-[900px]">
      <div class="flex items-center pr-6">
        <echoes-ui-button @click="settingsModal = false" class="h-6 w-6" size="small">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
            <path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
          </svg>
        </echoes-ui-button>
        <p class="text-lg font-bold w-full text-center">Settings</p>
      </div>
      <div class="h-full">
        <div class="flex h-full">
          <div class="flex flex-col h-full w-48">
            <div v-for="(key) in ['general', 'plugins', 'danger-zone']" :key="key">
              <h5 class="capitalize text-sm">{{ key.replaceAll('-', ' ') }}</h5>
              <echoes-ui-list class="flex flex-col ml-0">
                <echoes-ui-list-item v-for="group in sections[key as keyof typeof sections]" :key="group.id">
                  <button
                    :class="[activeSection === group.id ? background.item : '', hover.item]"
                    class="text-start w-full p-1 transition-colors rounded"
                    @click="handleGroupItemClick(group)"
                  >{{ group.title }}</button>
                </echoes-ui-list-item>
              </echoes-ui-list>
            </div>
          </div>
          <div class="w-full h-full">
            {{ settings[activeSection] }}
          </div>
        </div>
      </div>
    </echoes-ui-container>
  </echoes-ui-modal>
</template>
