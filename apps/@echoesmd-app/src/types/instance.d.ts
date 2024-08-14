import { App } from "vue";
import * as Y from "yjs";
import { Item, ItemTree, ItemTab } from "./vault";

interface ItemBase {
  type: "folder" | "page";
  name: string;
  parent?: string;
  previous?: string;
  component: string;
  deleted?: false | number;
  trashPath?: string;
}

interface Item extends ItemBase {
  parent: string;
  id: string;
  previous: string;
  deleted: false | number;
  next?: string;
}

interface ItemTree extends Item {
  children?: ItemTree[];
}

interface ItemTab extends Item {
  ydoc: Y.Doc;
}

interface Tab {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

type EchoInstanceEvents = 
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
  
  // Uses helpers to format data and return it
  getTrash: () => ItemTree[],
  getTree: () => ItemTree[],
  getFiles: () => Item[],

  // Helper functions
  getFilesUnderItem: (item: Item, deleted?: boolean) => Item[],
  getFilesFromKeyValue: <K extends keyof Item>(...filters: {
    key: K,
    value: Item[K],
    condition?: 'equals' | 'not-equals'
  }[]) => Item[],
  getFileFromId: (id: string) => Item | null,
  getLinkedItems: (parent: string, deleted?: boolean) => Item[],
  getNextItem: (item: Item) => Item | null,
  getPreviousItem: (item: Item) => Item | null,
  getFilePath: (item: Item) => string,

  createItem: (item: {
    name: Item["name"],
    parent: Item["parent"],
    component: Item["component"],
    type: Item["type"],
    previous?: Item["previous"],
  }) => void,
  addItem: (item: Item | Item[]) => void,
  trashItem: (id: string) => void,
  restoreItem: (id: string) => void,
  deleteItem: (id: string) => void,
  getItem: (id: string) => Item | null,
  updateItem: (item: Item) => void,

  getPage: (id: string) => ItemTab | null,
  loadPage: (id: string) => Promise<void>,
  unloadPage: (id: string) => void,
}

export {
  EchoInstance,
  EchoInstanceEvents,
  EchoInstanceOptions,
  Item,
  ItemBase,
  Item,
  ItemTree,
  ItemTab,
  Tab,
}
