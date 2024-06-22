<script setup lang="ts">
import { useInstance } from '@/instance';
import { ItemPage } from '@/types';
import { PropType, ref, watch } from 'vue';

  
  const props = defineProps({
    pages: {
      type: Array as PropType<ItemPage[]>,
      required: true,
    }
  });

  watch(() => props.pages, (newValue) => {
    console.log(newValue)
  })
  const active = ref({
    id: "default",
    component: "div",
    props: {}
  })
  const instance = useInstance();

  const handleTabClick = (page: ItemPage) => {
    if (page.id === active.value.id) {
      return;
    }
    active.value = {
      id: page.id,
      component: 'scarlettmd-editor',
      props: {
        page: page,
      }
    }
  }
</script>

<template>
  <div class="scarlettmd-core-vault-tabs flex">
    <div
      v-for="page in pages"
      :key="`vault-tabs-${page.id}`"
      class="scarlettmd-core-vault-tab"
      :class="{active: active.id === page.id}"
      @click="handleTabClick(page)"
    >
      {{ page.name }}
      <button @click.stop="instance.unloadPage(page.id)">X</button>
    </div>
  </div>
  <div class="scarlettmd-core-page">
    <component :is="active.component" v-bind="active.props" :key="active.id" />
  </div>
</template>
