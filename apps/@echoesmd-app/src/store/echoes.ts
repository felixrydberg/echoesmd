import { defineStore } from "pinia"
import { AppOptions, Group, ItemTab, Vault } from "../types";
import Config from '../../../../config.json';
import { SettingsGroup } from "@echoesmd/plugin-types";

const getVaultKey = <K extends keyof Vault["state"]>(
  id: Vault["id"], 
  state: {
    options: AppOptions,
    vaults: {[key: Vault["id"]]: Vault},
  }, 
  key: K
): Vault["state"][K] | null => {
  const vault = state.vaults[id];
  if (!vault && state.options.openVault !== "none") {
    throw new Error(`Vault not found`);
  }
  if (state.options.openVault === "none") {
    return null;
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

export const useEchoesStore = defineStore(`echoes-${Config.version}`, {
  state: () => {
    const state: {
      version: string,
      options: AppOptions,
      vaults: {[key: Vault["id"]]: Vault},
      settings: {[key: string]: SettingsGroup },
      files: string[],
    } = {
      version: "1.2.0_early-access",
      options: {
        tauri: false,
        theme: 'light',
        openVault: "none",
        loading: false,
      },
      vaults: {},
      settings: {},
      files: [],
    }
    return state;
  },
  persist: true,
  getters: {
    getOptions: (state) => {
      return state.options;
    },
    getSettings: (state) => {
      return state.settings;
    },
    getFileTypes: (state) => {
      return state.files;
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

    getTree: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'tree') || [],
    getTrash: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'trash') || [],
    getFiles: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'files') || [],
    getGroup: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'group') || null,
    getGroups: (state) => (id: Vault["id"] = state.options.openVault) => getVaultKey(id, state, 'groups') || [],
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
    addVault (vault: Vault) {
      this.vaults[vault.id] = vault
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
    setSynced (synced: Vault["state"]["synced"], id?: Vault["id"]) {
      setVaultKey(id || this.options.openVault, this, 'synced', synced);
    },

    addTab (tab: ItemTab, id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      if (groups.length === 0) {
        this.addGroup();
      }
      const group = groups.find(x => x.id === getVaultKey(id || this.options.openVault, this, 'group'));
      if (!group) {
        return;
      }
      const index = group.tabs.findIndex(x => x.id === tab.id);
      if (index === -1) {
        group.tabs.push(tab);
      }
      group.active = index === -1 ? group.tabs.length - 1 : index;
      setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    // Mostly used to fix issue with Pinia persistance messing up Ydoc
    updateTab (tab: ItemTab, id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      // Update tab in all groups
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const index = group.tabs.findIndex(x => x.id === tab.id);
        if (index !== -1) {
          group.tabs[index] = tab;
        }
      }
      // setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    removeTab (id: ItemTab["id"], groupId?: Group["id"], vaultId?: Vault["id"]) {
      const groups = getVaultKey(vaultId || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      const group = groups.find(x => x.id === groupId);
      if (!group) {
        return;
      }
      const index = group.tabs.findIndex(x => x.id === id);
      group.tabs.splice(index, 1);
      setVaultKey(vaultId || this.options.openVault, this, 'groups', groups);
    },
    getTab (id: ItemTab["id"], vaultId?: Vault["id"]) {
      const tabs: ItemTab[] = []
      const groups = getVaultKey(vaultId || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        tabs.push(...group.tabs);
      }

      return tabs.find(x => x.id === id);
    },

    // Updates specific group
    updateGroup (group: Group, id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      const index = groups.findIndex(x => x.id === group.id);
      if (index === -1) {
        return;
      }
      groups[index] = group;
    },
    // Updates which group is active
    setActiveGroup (group: Vault["state"]["group"], id?: Vault["id"]) {
      console.log('setActiveGroup', group);
      setVaultKey(id || this.options.openVault, this, 'group', group);
    },
    addGroup (id?: Vault["id"]) {
      const groups = getVaultKey(id || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      const group: Group = {
        id: crypto.randomUUID(),
        active: 0,
        name: `Group ${id}`,
        tabs: [],
      }
      groups.push(group);
      this.setActiveGroup(group.id);
      setVaultKey(id || this.options.openVault, this, 'groups', groups);
    },
    removeGroup (id: Group["id"], vaultId?: Vault["id"]) {
      const groups = getVaultKey(vaultId || this.options.openVault, this, 'groups');
      if (!groups) {
        return;
      }
      const index = groups.findIndex(x => x.id === id);
      groups.splice(index, 1);
      setVaultKey(vaultId || this.options.openVault, this, 'groups', groups);
    },

    addFileType(name: string) {
      const index = this.files.findIndex(x => x === name);
      if (index === -1) {
        this.files.push(name);
      }
    },
    resetFileTypes() {
      this.files = [];
    },

    updateSettingsGroup(group: SettingsGroup) {
      this.settings[group.id] = group;
    }
  },
})