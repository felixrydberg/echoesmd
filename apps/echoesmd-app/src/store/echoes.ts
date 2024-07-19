import { defineStore } from "pinia"
import { Vault } from "../types";

export const useEchoesStore = defineStore('echoes', {
  state: () => {
    const state: {
      tauri: boolean,
      theme: string,
      vaults: Vault[],
      openLast: boolean,
      loading: boolean,
    } = {
      tauri: false,
      theme: 'light',
      vaults: [],
      openLast: false,
      loading: false,
    }
    return state;
  },
  persist: true,
  getters: {
    getTauri: (state) => {
      return state.tauri;
    },
    getTheme: (state) => {
      return state.theme;
    },
    getVaults (state) {
      return state.vaults
        .sort((a: Vault, b: Vault) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
    },
    getVault: (state) => (id: string) => {
      return state.vaults.find((v: Vault) => v.id === id);
    },
    getOpenLast (state) {
      return state.openLast;
    },
    getLoading (state) {
      return state.loading;
    },
  },
  actions: {
    setTauri (value: boolean) {
      this.tauri = value
    },
    setTheme (value: string) {
      const html = document.documentElement;
      if (value === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      this.theme = value
    },
    addVault (vault: Vault) {
      this.vaults.push(vault);
    },
    updateVault (id: string, vault: Vault) {
      const _vault = this.vaults.find((v: Vault) => v.id === id);
      if (_vault) {
        Object.assign(_vault, vault);
      }
    },
    async removeVault(index: number) {
      if (this.vaults[index]) {
        const vault = this.vaults[index];
        const dbs = await indexedDB.databases();
        
        dbs.forEach(db => {
          if (db.name && db.name?.split(':')[0] === vault.id) {
            indexedDB.deleteDatabase(db.name);
          }
        });
        
        this.vaults.splice(index, 1);
      }
    },
    setOpenLast (value: boolean) {
      this.openLast = value;
    },
    setLoading (value: boolean) {
      this.loading = value;
    },
  },
})