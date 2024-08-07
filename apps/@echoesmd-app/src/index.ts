export * from './extensions/index';
import { App } from 'vue';
import editor from './components/pages/editor.vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

import './style/index.css';

export const EchoesPlugin = {
  async install(app: App) {
    console.debug('[Echoesmd] Plugin installed');
    app.component('echoesmd-editor', editor);
      
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)
    app.use(
      VueTippy,
      {
        directive: 'tippy',
        component: 'tippy',
        componentSingleton: 'tippy-singleton',
        defaultProps: {
          placement: 'auto-end',
          allowHTML: true,
        },
      }
    )
  }
};
