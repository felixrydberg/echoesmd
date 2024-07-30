import { createApp } from "vue";
import App from "./App.vue";
import { EchoesPlugin } from "./index";
import Config from "../../../config.json";

import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from './routes'
import { useEchoesStore } from "./store/echoes";
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App);
app.use(router);
app.use(EchoesPlugin);

const echoes = useEchoesStore();
// Remove after Early Access
if (echoes.version !== Config.version) {
  indexedDB.databases().then((databases) => {
    const dbs = databases.map((db) => db.name);
    for (let i = 0; i < dbs.length; i++) {
      const name = dbs[i];
      if (name) {
        indexedDB.deleteDatabase(name);
      }
    }
    localStorage.clear();
    localStorage.setItem('echoesmd-migration', 'true');
    location.reload();
  });
} else {
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
}
