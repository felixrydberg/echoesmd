import { createApp } from "vue";
import App from "./App.vue";
import { ScarlettCorePlugin } from "./index";

import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from './routes'
import { useEchoesStore } from "./store/echoes";
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App);
app.use(router);
app.use(ScarlettCorePlugin);

const echoes = useEchoesStore();
const options = echoes.getOptions;
if (options.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

if (options.openVault !== "none") {
  // [echoe-24] Get vault by id
  const vault = echoes.getVault;
  if (vault) {
    router.push(`/${vault.id}`);
  }
}
app.mount("#app");
