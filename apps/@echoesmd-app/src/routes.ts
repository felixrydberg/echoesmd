import VaultVue from './pages/vault.vue';
import VaultIndex from './pages/vault/index.vue';
// import VaultFile from './pages/vault/file.vue';
// import VaultSettings from './pages/vault/settings.vue';
// import VaultTrash from './pages/vault/trash.vue';
import Home from './pages/home.vue'

import { RouterOptions } from 'vue-router';
import { useEchoesStore } from './store/echoes';
import { createEchoInstance } from './instance';
import * as Y from 'yjs';

export const routes: RouterOptions["routes"] = [
  {
    path: "/",
    component: Home,
    meta: {name: "home"},
    beforeEnter: async (_to, from) => {
      if (from.meta.name === "vault") {
        const echoes = useEchoesStore();
        echoes.setOptions({
          ...echoes.getOptions,
          openVault: "none",
        });
      }
      return true;
    },
  },
  {
    path: "/:vault",
    component: VaultVue,
    meta: {name: "vault"},
    beforeEnter: async (to, from) => {
      // [echoe-02] Rework this when implementing Collaboration server
      const { vault } = to.params;
      const echoes = useEchoesStore();
      const instance = createEchoInstance();
      const Vault = echoes.getVaultById(vault as string);
      if (Vault && Vault.collaboration && instance.ws === null) {
        try {
          echoes.setOptions({
            ...echoes.getOptions,
            loading: true,
          });
          const { connected } = await instance.createWs(Vault);
          if (!connected) {
            const ydoc = new Y.Doc({ guid: Vault.id });
            instance.register(ydoc);
            echoes.setOptions({
              ...echoes.getOptions,
              loading: false,
            });
            echoes.updateVault({ ...Vault, collaboration: {...Vault.collaboration, synced: false}, state: { ...Vault.state, synced: true } });
            return true;
          }

          const ydoc = new Y.Doc({ guid: Vault.id });
          const { success, reason } = await instance.register(ydoc);
          if (!success && reason === "authentication_failed") {
            echoes.setOptions({
              ...echoes.getOptions,
              openVault: "none",
            });
            return {
              path: from.path,
            };
          }

          echoes.setOptions({
            ...echoes.getOptions,
            loading: false,
          });
          echoes.updateVault({ ...Vault, collaboration: {...Vault.collaboration, synced: true}, state: {...Vault.state, synced: true} });
          return true;
        } catch (error) {
          console.log(error);
        }
      }
      if (Vault) {
        const ydoc = new Y.Doc({ guid: Vault.id });
        instance.register(ydoc);
        echoes.setSynced(false);
        return true;
      }
      return false
    },
    children: [
      { path: "", component: VaultIndex },
      // { path: "settings", component: VaultSettings },
      // { path: "trash", component: VaultTrash },
      // { path: ":id", component: VaultFile },
    ],
  },
];
