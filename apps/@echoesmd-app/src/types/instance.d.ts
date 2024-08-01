import { App } from "vue";
import * as Y from "yjs";
import { addItem, ItemBase, Item, ItemOptions, ItemTree, ItemTab } from "./vault";

type EchoInstanceEvents = 
"page:loaded" |
"page:unloaded" |
"tree:update" |
"trash:update" |
"files:update"

interface EchoInstanceOptions {
  providers: {
    ws: {
      url: string,
      options: ProviderOptions,
    }
  }
}

interface EchoInstance {
  id: string,
  vault: Y.Doc | null,
  ws: WebsocketProvider | null,
  install: (app: App) => void,
  register: (vault: Y.Doc) => Promise<{success: boolean, reason?: string}>,
  destroy: () => void,
  createWs: (options: Vault) => Promise<{connected: boolean, message: string | unknown}>,
  subscribe: (event: EchoInstanceEvents, callback: (...args: unknown[]) => void) => void,
  unsubscribe: (event: EchoInstanceEvents, callback: (...args: unknown[]) => void) => void,
  
  getTrash: () => ItemTree[],
  getTree: () => ItemTree[],
  getFiles: () => ItemTree[],

  // Helper functions
  getFilesFromParent: (parent: string) => Item[],
  getFilesFromKeyValue: (key: string, value: string) => Item[],

  getPreviousItem: (options: ItemBase) => string,
  createItem: (options: ItemOptions) => void,
  addItem: (item: addItem | addItem[]) => void,
  trashItem: (id: string) => void,
  restoreItem: (id: string) => void,
  deleteItem: (id: string) => void,
  getItem: (id: string) => Item | null,
  updateItemName: (id: string, name: string) => void,

  getPage: (id: string) => ItemTab | null,
  loadPage: (id: string) => Promise<void>,
  unloadPage: (id: string) => void,
}

export {
  EchoInstance,
  EchoInstanceEvents,
  EchoInstanceOptions,
}
