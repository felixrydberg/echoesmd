import { defineStore } from "pinia"
import { AppOptions, Group, ItemPage, Vault } from "../types";

const getVaultKey = <K extends keyof Vault["state"]>(
  id: Vault["id"], 
  state: {
    options: AppOptions,
    vaults: {[key: Vault["id"]]: Vault},
  }, 
  key: K
): Vault["state"][K] => {
  const vault = state.vaults[id];
  if (!vault && state.options.openVault !== "none") {
    throw new Error(`Vault not found`);
  }
  return vault?.state[key];
};

const setVaultKey = <K extends keyof Vault["state"]>(
  id: Vault["id"],
  state: {
    options: AppOptions,
    vaults: {[key: Vault["id"]]: Vault},
  },
  key: K,
  value: Vault["state"][K]
) => {
  const vault = state.vaults[id];
  if (!vault || state.options.openVault === "none") {
    throw new Error(`Vault not found`);
  }
  vault.state[key] = value;
};

export const useEchoesStore = defineStore('echoes', {
  state: () => {
    const state: {
      options: AppOptions,
      vaults: {[key: Vault["id"]]: Vault},
    } = {
      options: {
        tauri: false,
        theme: 'light',
        openVault: "none",
        loading: false,
      },
      vaults: {},
    }
    return state;
  },
  persist: true,
  getters: {
    getOptions: (state) => {
      return state.options;
    },

    getVault: (state) => {
      return state.vaults[state.options.openVault];
    },
    getVaultById: (state) => (id: Vault["id"]) => {
      return state.vaults[id];
    },
    getVaults: (state) => {
      return state.vaults
    },

    getTree: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'tree'),
    getTrash: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'trash'),
    getFiles: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'files'),
    getGroup: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'group'),
    getGroups: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'groups'),
    getSidebar: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'sidebar'),
    getSynced: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'synced'),
  },
  actions: {
    setOptions (options: AppOptions) {
      if (this.options.theme !== options.theme) {
        document.documentElement.classList.toggle('dark');
      }
      this.options = options;
    },
    
    createVault (options: {
      name: Vault["name"],
      url: Vault["url"],
      token: Vault["token"],
      collaboration: Vault["collaboration"],
    }) {
      const vault = {
        ...options,
        id: crypto.randomUUID(),
        lastOpened: new Date().toISOString(),
        state: {
          group: null,
          groups: [],
          tree: [],
          trash: [],
          files: [],
          sidebar: true,
          synced: true,
        },
      }
      this.vaults[vault.id] = vault;
      return vault;
    },
    updateVault (vault: Vault) {
      this.vaults[vault.id] = vault;
    },
    async deleteVault(id: Vault["id"]) {
      const vault = this.vaults[id];
      if (vault) {
        const dbs = await indexedDB.databases();
        dbs.forEach(db => {
          if (db.name && db.name?.split(':')[0] === vault.id) {
            indexedDB.deleteDatabase(db.name);
          }
        });
        const obj = { ...this.vaults };
        delete obj[id];
        this.vaults = obj;
      }
    },

    setTree (tree: Vault["state"]["tree"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'tree', tree);
    },
    setTrash (trash: Vault["state"]["trash"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'trash', trash);
    },
    setFiles (files: Vault["state"]["files"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'files', files);
    },
    setSidebar (sidebar: Vault["state"]["sidebar"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'sidebar', sidebar);
    },


    updateTab (tab: ItemPage, id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      groups.forEach(group => {
        const index = group.tabs.findIndex(x => x.id === tab.id);
        if (index > -1) {
          group.tabs[index] = tab;
        }
      });
      setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    // Updates specific group
    updateGroup (group: Group, id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      const index = groups.findIndex(x => x.id === group.id);
      if (index === -1) {
        return;
      }
      groups[index] = group;
    },
    // Updates which group is active
    setGroup (group: Vault["state"]["group"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'group', group);
    },
    // Updates tabs in active group
    setGroups (tabs: ItemPage[], id?: Vault["id"]) {
      const groupId = getVaultKey(id || this.options.openVault, this, 'group');
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      const group = groups.find(x => x.id === groupId);
      if (!group) {
        return;
      }
      group.tabs = tabs;
      setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    addGroup (id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      const length = groups.length;
      const group: Group = {
        id: length,
        active: 0,
        name: `Group ${id}`,
        tabs: [],
      }
      groups.push(group);
      this.setGroup(group.id);
      setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    removeGroup (id: number, vaultId?: Vault["id"]) {
      const groups = getVaultKey(vaultId || this.options.openVault, this, 'groups');
      const index = groups.findIndex(x => x.id === id);
      groups.splice(index, 1);
      setVaultKey(vaultId || this.options.openVault, this, 'groups', groups);
    },
  },
})