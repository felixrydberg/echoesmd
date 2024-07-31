<script setup lang="ts">
  import { useEchoesStore } from '../../../store/echoes';
  import { computed, watch } from 'vue';
  import { EchoesUiContainer } from '@echoesmd/ui';
  import EchoesFileGroup from '../file/group.vue';

  const emits = defineEmits(['update:active']);

  // Watch pages for changes
  const echoes = useEchoesStore();
  const groups = computed(() => echoes.getGroups());
  const handleGroupClick = (id: string) => {
    echoes.setActiveGroup(id);
  }
</script>

<template>
  <div class="flex flex-grow">
    <echoes-ui-container
      v-for="(_group) in groups"
      class="w-full border-r border-t-0 border-b-0 border-l-0"
      border="item"
      @click="handleGroupClick(_group.id)"
      :key="_group.id"
    >
      <echoes-file-group :group="_group" />
    </echoes-ui-container>
  </div>
</template>
