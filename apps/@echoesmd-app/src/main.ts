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
const autoOpen = echoes.getOpenLast;
const theme = echoes.getTheme;
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
}

if (autoOpen) {
  const vaults = echoes.getVaults;
  if (vaults.length > 0) {
    const lastVault = vaults[0];
    router.push(`/${lastVault.id}`)
  }
}
app.mount("#app");
