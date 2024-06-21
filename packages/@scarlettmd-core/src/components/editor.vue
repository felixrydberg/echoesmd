<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Collaboration from '@tiptap/extension-collaboration';
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Extensions } from '@/index'
import { PropType } from 'vue';
import { ItemPage } from '@/types';

const props = defineProps({
  page: {
    type: Object as PropType<ItemPage>,
    required: true,
  },
})

console.log(props.page.ydoc.getXmlFragment('content'))
const fragment = props.page.ydoc.getXmlFragment('content')
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
  @apply bg-neutral-100 dark:bg-neutral-900;
}
</style>
