import { App } from "vue";
import { IndexeddbPersistence } from "y-indexeddb";
import { ProviderOptions } from "y-webrtc";
import * as Y from "yjs";
import { addItem, ItemBase, Item, ItemOptions, ItemTree, ItemPage } from "./vault";

type ScarlettInstanceEvents = 
"page:loaded" |
"page:unloaded" |
"tree:update" |
"trash:update" |
"files:update"

interface ScarlettInstanceOptions {
  providers: {
    webrtc: {
      options: ProviderOptions
    },
    // IMPLEMENT LATER
    // websocket: {
    //   url: string,
    //   room: string,
    //   // options: 
    // }
  }
}

interface ScarlettInstance {
  id: string,
  vault: Y.Doc | null,
  db: IndexeddbPersistence | null,
  install: (app: App) => void,
  register: (vault: Y.Doc) => void,
  subscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => void,
  unsubscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => void,
  
  getTrash: () => ItemTree[],
  getTree: () => ItemTree[],
  getFiles: () => ItemTree[],

  getPreviousItem: (options: ItemBase) => string,
  createItem: (options: ItemOptions) => void,
  addItem: (item: addItem | addItem[]) => void,
  trashItem: (id: string) => void,
  restoreItem: (id: string) => void,
  deleteItem: (id: string) => void,
  getItem: (id: string) => Item | null,
  getPage: (id: string) => ItemPage | null,
  loadPage: (id: string) => void,
  unloadPage: (id: string) => void,
}

export {
  ScarlettInstance,
  ScarlettInstanceEvents,
  ScarlettInstanceOptions,
}
