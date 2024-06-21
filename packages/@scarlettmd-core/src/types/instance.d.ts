import { App } from "vue";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { Item, ItemOptions, ItemTree, ItemPage } from "./vault";

type ScarlettInstanceEvents = 
"page:update" |
"page:added" |
"page:removed" |
"page:loaded" |
"page:unloaded" |
"tree:update" |
"vault:synced" |
"vault:added"

interface ScarlettInstance {
  id: string,
  vault: Y.Doc | null,
  db: IndexeddbPersistence | null,
  install: (app: App) => void,
  register: (vault: Y.Doc) => void,
  subscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => void,
  unsubscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => void,
  getTree: () => ItemTree[],
  getPreviousItem: (options: ItemOptions) => string,
  createItem: (options: ItemOptions) => void,
  addItem: (item: Item | []) => void,
  removeItem: (id: string) => void,
  getItem: (id: string) => Item | null,
  getPage: (id: string) => ItemPage | null,
  loadPage: (id: string) => void,
  unloadPage: (id: string) => void,
}