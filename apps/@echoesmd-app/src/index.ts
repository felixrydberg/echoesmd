export * from './extensions/index';
import { App } from 'vue';
import editor from './components/pages/editor.vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style/index.css';

export const EchoesPlugin = {
  async install(app: App) {
    console.debug('[Echoesmd] Plugin installed');
    app.component('echoesmd-editor', editor);
      
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)
  }
};
