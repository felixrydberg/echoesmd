import { useInstance } from "@/instance";
import { ItemPage, ItemTree, Tab } from "@/types"
import { defineStore } from "pinia"

export const useVaultStore = defineStore('vault', {
  state: (): {tab: Tab, tree: ItemTree[], trash: ItemTree[], files: ItemTree[], tabs: ItemPage[]} => { return {
    tab: {
      id: "default",
      component: "div",
      props: {},
    },
    tree: [],
    trash: [],
    files: [],
    tabs: [],
  }},
  getters: {
    getActiveTab: (state) => state.tab,
    getTree: (state) => state.tree,
    getTrash: (state) => state.trash,
    getFiles: (state) => state.files,
    getTabs: (state) => state.tabs,
  },
  actions: {
    setTab(tab: Tab) {
      console.log("set tab", tab);
      this.tab = tab
    },
    setTree(tree: ItemTree[]) {
      this.tree = tree
    },
    setTrash(trash: ItemTree[]) {
      this.trash = trash
    },
    setFiles(files: ItemTree[]) {
      this.files = files
    },
    setTabs(tabs: ItemPage[]) {
      if (tabs.length < this.tabs.length) {
        const instance = useInstance();
        if (tabs.length === 1 && this.tab.id === this.tabs[0].id) {
          const page = instance.getPage(tabs[0].id);
          if (!page) {
            return
          };

          this.setTab({
            id: page.id,
            component: page.component,
            props: {
              page: page,
            }
          })
        } else {
          const difference = this.tabs.filter(x => !tabs.includes(x))[0];
          if (difference) {
            const index = this.tabs.indexOf(difference);
            console.log(difference);
            console.log(index);

          }
        }
      }
      this.tabs = tabs
    },
  },
})