export * from '@/extensions/index';
import { App } from 'vue';
import editor from '@/components/editor.vue';
import vault from '@/components/vault/index.vue';

export const plugin = {
  install(app: App) {
    app.component('scarlettmd-editor', editor);
    app.component('scarlettmd-vault', vault);
  }
};
