<script setup lang="ts">
import { Extensions } from '../../index'
import { ItemPage } from '../../types';
import { PropType, toRaw } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Collaboration from '@tiptap/extension-collaboration';
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

const props = defineProps({
  page: {
    type: Object as PropType<ItemPage>,
    required: true,
  },
})

const ydoc = toRaw(props.page.ydoc);
const fragment = ydoc.getXmlFragment('content');
const editor = useEditor({
  content: '',
  extensions: [
    ...Extensions,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Collaboration.configure({
      fragment: fragment,
    }),
  ],
});
</script>

<template>
  <EditorContent :editor="editor" />
</template>

<style>
body {
  @apply bg-neutral-100 dark:dark:bg-neutral-950;
}
</style>
