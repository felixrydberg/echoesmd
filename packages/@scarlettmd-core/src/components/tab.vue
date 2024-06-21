<script setup lang="ts">
import { ItemPage } from '@/types';
import { PropType } from 'vue';

  const props = defineProps({
    tab: {
      type: Object as PropType<ItemPage>,
      required: true
    },
    active: {
      type: String as PropType<ItemPage["id"]>,
      required: true
    }
  });
  const emits = defineEmits(["update:active"]);

  const handleTabClick = () => {
    emits("update:active", props.tab.id);
  }
  console.log(props.tab)
</script>

<template>
  <div>
    <div>
      <button @click="handleTabClick">Activate</button>
    </div>
    {{ active }}
    <div v-if="active === tab.id">
      <scarlettmd-editor :page="tab" />
    </div>
  </div>
</template>