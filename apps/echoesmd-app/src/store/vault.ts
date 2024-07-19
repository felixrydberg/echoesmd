import { ItemPage, ItemTree, Group } from "../types"
import { defineStore } from "pinia"

export const useVaultStore = defineStore('vault', {
  state: () => {
    const state: {
      tree: ItemTree[],
      trash: ItemTree[],
      files: ItemTree[],
      group: Group,
      groups: Group[],
      sidebar: boolean,
      synced: boolean,
    } = {
      group: {
        id: 0,
        active: 0,
        name: "Default",
        tabs: [],
      },
      groups: [],
      tree: [],
      trash: [],
      files: [],
      sidebar: true,
      synced: true,
    }
    state.groups.push(state.group);
    return state;
  },
  getters: {
    getTree: (state) => state.tree,
    getTrash: (state) => state.trash,
    getFiles: (state) => state.files,
    getGroup: (state) => state.group,
    getGroups: (state) => state.groups,
    getSidebar: (state) => state.sidebar,
    getSynced: (state) => state.synced,
  },
  actions: {
    setTree(tree: ItemTree[]) {
      this.tree = tree
    },
    setTrash(trash: ItemTree[]) {
      this.trash = trash
    },
    setFiles(files: ItemTree[]) {
      this.files = files
    },
    setSidebar(sidebar: boolean) {
      this.sidebar = sidebar
    },

    updateTab(tab: ItemPage) {
      this.groups.forEach(group => {
        const index = group.tabs.findIndex(x => x.id === tab.id);
        if (index > -1) {
          group.tabs[index] = tab;
        }
      });
    },
    updateGroup(group: Group) {
      const index = this.groups.findIndex(x => x.id === group.id);
      if (index === -1) {
        return;
      }
      this.groups[index] = group;
      if (this.group.id === group.id) {
        this.group = group;
      }
    },
    setGroup(id: number) {
      const group = this.groups.find(x => x.id === id);
      if (group) {
        this.group = group;
      }
    },
    setGroups(tabs: ItemPage[]) {
      this.group.tabs = tabs
    },
    addGroup() {
      const id = this.groups.length;
      const group: Group = {
        id: id,
        active: 0,
        name: `Group ${id}`,
        tabs: [],
      }
      this.groups.push(group);
      this.setGroup(id);
    },
    removeGroup(id: number) {
      const index = this.groups.findIndex(x => x.id === id);
      this.groups.splice(index, 1);
    },

    resetVault() {
      this.tree = [];
      this.trash = [];
      this.files = [];
      this.group = {
        id: 0,
        active: 0,
        name: "Default",
        tabs: [],
      };
      this.groups = [this.group];
      this.synced = true;
    }
  },
})