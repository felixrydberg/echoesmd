import { createApp } from "vue";
import App from "./App.vue";
import { EchoesPlugin } from "./index";

import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from './routes'
import { useEchoesStore } from "./store/echoes";
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
const oldEchoes = localStorage.getItem('echoes');
if (oldEchoes) {
  const parsed = JSON.parse(oldEchoes);
  if (parsed.version !== Config["version-label"]) {
    // Wipe all vaults
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  
    localStorage.removeItem('echoes');
    echoes.setOptions({
      theme: parsed.theme,
      openVault: parsed.openVault,
      loading: parsed.loading,
      tauri: parsed.tauri,
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
