import { createApp } from "vue";
import App from "./App.vue";
import { EchoesPlugin } from "./index";

import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from './routes'
import { useEchoesStore } from "./store/echoes";
import { Vault } from "./types";
import Config from '../../../config.json';
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App);
app.use(router);
app.use(EchoesPlugin);

const echoes = useEchoesStore();
// Will only return 1.1  and below stores. Future stores are version locked.
const oldEchoes = JSON.parse(localStorage.getItem('echoes') || '{}');
if (oldEchoes.version !== Config["version-label"]) {
  for (let i = 0; i < oldEchoes.vaults.length; i++) {
    const oldVault: {
      id: string;
      name: string;
      url: string;
      token: string;
      collaboration: {
        password: string;
        synced: boolean;
      };
      lastOpened: string;
    } = oldEchoes.vaults[i];
    const vault: Vault = {
      id: oldVault.id,
      name: oldVault.name,
      url: oldVault.url,
      token: oldVault.token,
      collaboration: {password: oldVault.collaboration.password},
      lastOpened: oldVault.lastOpened,
      state: {
        tree: [],
        trash: [],
        files: [],
        group: null,
        groups: [],
        sidebar: false,
        synced: false
      }
    }
    echoes.addVault(vault);
    localStorage.removeItem('echoes');
  
    echoes.setOptions({
      theme: oldEchoes.theme,
      openVault: oldEchoes.openVault,
      loading: oldEchoes.loading,
      tauri: oldEchoes.tauri,
    });
  }
}

const options = echoes.getOptions;
if (options.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

if (options.openVault !== "none") {
  const vault = echoes.getVault;
  if (vault) {
    router.push(`/${vault.id}`);
  }
}
app.mount("#app");
