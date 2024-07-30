<script setup lang="ts">
  import { EchoesUiButton, EchoesUiContainer, EchoesUiContainerItem } from '@echoesmd/ui';
  import { Group, ItemTab } from '../../../types';
  import { useEchoesStore } from '../../../store/echoes';
  import { PropType, computed, handleError, ref, watch } from 'vue';
  import WrapperVue from '../../pages/wrapper.vue';

  const props = defineProps({
    group: {
      type: Object as PropType<Group>,
      required: true
    },
  });
  const echoes = useEchoesStore();
  const handleCreateNewGroup = () => {
    echoes.addGroup();
  }
  const handleRemoveGroup = () => {
    const groups = echoes.getGroups();
    const index = groups.findIndex((g) => g.id === props.group.id);
    if (index === -1) {
      return
    };
    const tabs = [...props.group.tabs];
    tabs.forEach((tab) => {
      handleRemoveTab(tab);
    });
    echoes.removeGroup(props.group.id);
    console.log(index)
    echoes.setActiveGroup(groups[0].id)
  }

  const active = computed(() => echoes.getGroup());
  const groups = computed(() => echoes.getGroups());
  const handleRemoveTab = (tab: ItemTab) => {
    echoes.removeTab(tab.id, props.group.id);
  }
  const handleTabClick = (_group: Group, tab: ItemTab) => {
    const index = props.group.tabs.findIndex((t) => t.id === tab.id);
    if (index !== -1 && props.group.active !== index) {
      echoes.updateGroup({
        ..._group,
        active: index
      })
    }
  }
</script>

<template>
  <echoes-ui-container class="flex items-center justify-between p-1 w-full">
    <div class="flex gap-x-1">
      <echoes-ui-container-item
        v-for="(tab, yindex) in props.group.tabs"
        @click.stop="handleTabClick(props.group, tab)"
        class="flex items-center gap-x-1 w-full p-1 rounded text-xs"
        :class="{ 'bg-gray-200 dark:bg-neutral-800': props.group.active === yindex }"
      >
        {{ tab.name }}
        <echoes-ui-button :background="false" :hover="false" @click.stop="handleRemoveTab(tab)" class="text-xs p-0" title="Remove tab">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </echoes-ui-button>
      </echoes-ui-container-item>
    </div>
    <div class="flex gap-x-1">
      <echoes-ui-button @click.stop="handleRemoveGroup" v-if="groups.length > 1" size="small" title="Remove group">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      </echoes-ui-button>
      <echoes-ui-button @click.stop="handleCreateNewGroup" size="small" title="Create new Group">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5">
          <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
        </svg>
      </echoes-ui-button>
    </div>
  </echoes-ui-container>
  <div class="h-full">
    <wrapper-vue v-if="props.group.tabs[props.group.active]?.component" v-bind="{ page: props.group.tabs[props.group.active] }" :key="props.group.tabs[props.group.active].id">
      <component class="h-full" @click.stop :is="props.group.tabs[props.group.active].component" v-bind="{ page: props.group.tabs[props.group.active] }" :key="props.group.tabs[props.group.active].id" />
    </wrapper-vue>
    <div class="flex justify-center items-center h-full" v-else>
      <span class="-mt-32">
        No active tab
      </span>
    </div>
  </div>
</template>
