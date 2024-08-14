import { createApp } from "vue";
import App from "./App.vue";
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { plugin as VueTippy } from 'vue-tippy'

import { routes } from './routes'
import { useEchoesStore } from "./store/echoes";
import { useMigration, usePlugins } from "./utils";

import 'tippy.js/dist/tippy.css'
import './style/index.css';

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
const app = createApp(App);
const pinia = createPinia();
const migration = useMigration();
const plugins = usePlugins();
pinia.use(piniaPluginPersistedstate)

app.use(router);
app.use(pinia)
app.use(VueTippy,{
  directive: 'tippy',
  component: 'tippy',
  componentSingleton: 'tippy-singleton',
  defaultProps: {
    placement: 'auto-end',
    allowHTML: true,
  },
});
app.use(migration);
app.use(plugins);

const echoes = useEchoesStore();
const options = echoes.getOptions;
if (options.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

// [echoe-43] This wont have to run when using Tauri
indexedDB.databases().then((dbs) => {
  const vaults = echoes.vaults;
  const arr = dbs.map((db) => db.name).filter((db) => {
    // Check if its subpage or not
    const split = db?.split(':');
    if (!split) {
      // Means that the db is not named after our conventions
      return false
    }
    if (split[2] !== undefined && vaults[split[1]]) {
      // If main vault is saved we save the subIndex
      // Means that this is a subIndex to a vault skip.
      return false;
    }
    return vaults[split[1]] === undefined;
  });
  for (const vault in vaults) {
    const index = arr.indexOf(`echoesmd:${vault}`);
    if (index === -1) {
      arr.splice(index, 1);
    }
  }
  arr.forEach((db) => indexedDB.deleteDatabase(db || ''));
})

if (options.openVault !== "none") {
  const vault = echoes.getVault;
  if (vault) {
    router.push(`/${vault.id}`);
  }
}
app.mount("#app");
