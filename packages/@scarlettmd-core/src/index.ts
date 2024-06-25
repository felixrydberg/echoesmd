export * from '@/extensions/index';
import { App } from 'vue';
import editor from '@/components/editor.vue';
import vault from '@/components/vault/index.vue';
import { createPinia } from 'pinia';

export const ScarlettCorePlugin = {
  install(app: App) {
    app.component('scarlettmd-editor', editor);
    app.component('scarlettmd-vault', vault);
    
    const pinia = createPinia();
    app.use(pinia)
  }
};
