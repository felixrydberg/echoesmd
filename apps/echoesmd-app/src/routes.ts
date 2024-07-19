import VaultVue from './pages/vault.vue';
import VaultIndex from './pages/vault/index.vue';
import VaultFile from './pages/vault/file.vue';
import VaultSettings from './pages/vault/settings.vue';
import VaultTrash from './pages/vault/trash.vue';
import Home from './pages/home.vue'
import Settings from './pages/settings.vue'
import { RouterOptions } from 'vue-router';
import { useEchoesStore } from './store/echoes';
import { createEchoInstance } from './instance';
import * as Y from 'yjs';

export const routes: RouterOptions["routes"] = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
  {
    path: "/:vault",
    component: VaultVue,
    beforeEnter: async (to, from) => {
      const { vault } = to.params;
      const echoes = useEchoesStore();
      const instance = createEchoInstance();
      const Vault = echoes.getVault(vault as string);
      if (Vault && Vault.collaboration && instance.ws === null) {
        try {
          echoes.setLoading(true);
          const { connected } = await instance.createWs(Vault);
          if (!connected) {
            const ydoc = new Y.Doc({ guid: Vault.id });
            instance.register(ydoc);
            echoes.setLoading(false);
            echoes.updateVault(Vault.id, { ...Vault, collaboration: {
              ...Vault.collaboration,
              synced: false,
            }});
            return true;
          }

          const ydoc = new Y.Doc({ guid: Vault.id });
          const { success, reason } = await instance.register(ydoc);
          if (!success && reason === "authentication_failed") {
            echoes.setLoading(false);
            echoes.setOpenLast(false);
            return {
              path: from.path,
            };
          }

          echoes.setLoading(false);
          echoes.updateVault(Vault.id, { ...Vault, collaboration: {
            ...Vault.collaboration,
            synced: true,
          }});
          return true;
        } catch (error) {
          console.log(error);
        }
      }
      if (Vault) {
        const ydoc = new Y.Doc({ guid: Vault.id });
        instance.register(ydoc);
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
