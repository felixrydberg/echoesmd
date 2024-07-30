import { App } from "vue";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  addItem,
  Item,
  ItemBase,
  ItemOptions,
  ItemTab,
  ItemTree,
  EchoInstance,
  EchoInstanceEvents,
  Vault,
} from "../types/index";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import * as Y from "yjs";
import { useEchoesStore } from "../store/echoes";

const validateInstance = (instance: EchoInstance) => {
  try {
    if (!instance.vault) {
      throw '[Echoes/app] Vault not registered'
    }
  } catch (e) {
    console.error(e)
  }
}

const mergeItems = (OrderItems: {[key: string]: Item[]}) => {
  if (!OrderItems["root"]) {
    return [];
  }

  const root: ItemTree[] = OrderItems["root"].map((item) => Object.assign({}, item));
  const handleChildren = (item: ItemTree) => {
    if (item.type === 'folder') {
      item.children = OrderItems[item.id]?.map((item) => Object.assign({}, item)) || [];
      for (let i = 0; i < item.children.length; i++) {
        handleChildren(item.children[i]);
      }
    }
  };
  for (let i = 0; i < root.length; i++) {
    handleChildren(root[i]);
  }
  return root;
}

let activeInstance: EchoInstance | null = null;

export const createEchoInstance = () => {
  const subscriptions: {[key: string]: (...args: unknown[]) => void} = {};
  const instanceItems: {[key: string]: Item}  = {}
  const instanceOrderItems: {[key: string]: Item[]}  = {}
  const instancePages: {[key: string]: {
    ydoc: Y.Doc,
    item: Item,
    provider?: HocuspocusProvider,
  }} = {}
  const trash: {[key: string]: Item} = {}
  const trashOrder: {[key: string]: Item[]} = {}

  const emit = (event: EchoInstanceEvents, ...args: unknown[]) => {
    if(subscriptions[event]) {
      subscriptions[event](...args)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createYMapInstance = (item: Item, ydoc: Y.Doc | null, _ItemOptions: ItemOptions) => {
    if (!ydoc) {
      throw new Error('Vault not registered');
    }

    const yItems = ydoc.getMap('items');
    const newDoc = new Y.Doc({meta: {type: item.type, component: item.component}, guid: `echoesmd:${item.id}`, shouldLoad: false})

    const db = new IndexeddbPersistence(`echoesmd:${instance.vault?.guid}:${item.id}`, newDoc);
    db.on("synced", db.destroy);

    yItems.set(item.id, newDoc);
    const yItemsMeta = ydoc.getMap('items-meta');
    const yItem = yItemsMeta.set(item.id, new Y.Map(Object.entries(item)));
    return yItem;
  }

  const updateYMapInstance = (item: Item, ydoc: Y.Doc | null) => {
    if (!ydoc) {
      throw new Error('Vault not registered');
    }
    const yItems = ydoc.getMap('items-meta');
    const yItem = yItems.get(item.id) as Y.Map<unknown> | undefined;
    if (yItem) {
      for (const key in item) {
        if (item[key as keyof Item] !== undefined && yItem.get(key) !== item[key as keyof Item]) {
          yItem.set(key, item[key as keyof Item]);
        }
      }

    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: EchoInstance = {
    id: crypto.randomUUID(),
    vault: null,
    ws: null,
    install: (app: App) => {
      app.config.globalProperties.$scarlett = instance
    },
    register: (vault: Y.Doc) => {
      return new Promise((resolve) => {
        instance.vault = vault;
        const store = useEchoesStore();

        instance.subscribe("tree:update", (...args) => store.setTree(args[0] as ItemTree[]));
        instance.subscribe("trash:update", (...args) => store.setTrash(args[0] as ItemTree[]));
        instance.subscribe("files:update", (...args) => store.setFiles(args[0] as ItemTree[]));

        const yItemMeta = vault.getMap('items-meta');
        yItemMeta.observeDeep((events: Y.YEvent<Y.Map<Item>>[]) => {
          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (event.transaction.origin === instance.id) {
              return;
            }
            const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/igm;
            const keys = Object.keys(event.target.toJSON());
            const matches = keys.join('\n').match(regex)

            if (matches?.length === keys.length) {
              const items = event.target.toJSON() as {[key: string]: Item};
              const trashBuffer: {[key: string]: Item[]} = {};
              const buffer: {[key: string]: Item[]} = {};
              for (const key in items) {
                const item = items[key];
                if (item.deleted) {
                  trash[key] = item;
                  if (!trashBuffer[item.parent]) {
                    trashBuffer[item.parent] = [];
                  }

                  trashBuffer[item.parent].push(item);
                } else {
                  instanceItems[key] = item;
                  if (!buffer[item.parent]) {
                    buffer[item.parent] = [];
                  }
                  buffer[item.parent].push(item);
                }
              }
              for (const key in buffer) {
                const root = buffer[key].find((item) => item.previous === 'root');
                if (!root) {
                  continue;
                }
                const arr = [root];
                const processItem = (item: Item) => {
                  if (item.next && item.next !== item.id) {
                    const nextItem = instanceItems[item.next];
                    if (nextItem) {
                      arr.push(nextItem);
                      processItem(nextItem);
                    }
                  }
                }
                processItem(root);
                instanceOrderItems[key] = arr;
              }
              for (const key in trashBuffer) {
                trashOrder[key] = trashBuffer[key].sort((a, b) => (a.deleted || 0) - (b.deleted || 0));
              }

            } else {
              const item = event.target.toJSON() as Item;
              if (item.deleted) {
                if (instancePages[item.id]) {
                  instance.unloadPage(item.id);
                  delete instancePages[item.id];
                }
                delete instanceItems[item.id];
                delete instanceOrderItems[item.id];
                const index = instanceOrderItems[item.parent].findIndex((i) => i.id === item.id);
                instanceOrderItems[item.parent].splice(index, 1);
                trash[item.id] = item;
                if (!trashOrder[item.parent]) {
                  trashOrder[item.parent] = [];
                }
                trashOrder[item.parent].push(item);

              } else {
                instanceItems[item.id] = item;
                delete trash[item.id];
                delete trashOrder[item.parent];
                if (!instanceOrderItems[item.parent]) {
                  instanceOrderItems[item.parent] = [];
                }
                const index = instanceOrderItems[item.parent].findIndex((i) => i.id === item.id);
                if (index === -1) {
                  instanceOrderItems[item.parent].push(item);
                } else {
                  instanceOrderItems[item.parent][index] = item;
                }
              }
            }

            emit("files:update", instance.getFiles());
            emit("trash:update", instance.getTrash());
            emit("tree:update", instance.getTree());
          }
        });


        const db = new IndexeddbPersistence(`echoesmd:${vault.guid}`, vault);
        db.on("synced", async () => {
          store.setSynced(true);
          const subdocs = Array.from(vault.getSubdocs()).map((subdoc) => `${vault.guid}:${subdoc.guid}`);
          const dbs = (await indexedDB.databases()).map((db) => db.name);
          for (let i = 0; i < dbs.length; i++) {
            const name = dbs[i];
            if (name) {
              if (!subdocs.includes(name) && name !== vault.guid && name.split(":")[0] === vault.guid) {
                console.log("Deleted", name)
                indexedDB.deleteDatabase(name);
              }
            }
          }
        });

        if (instance.ws) {
          new HocuspocusProvider({
            document: vault,
            name: vault.guid,
            websocketProvider: instance.ws,
            token: vault.guid,
            onAuthenticated() {
              resolve({
                success: true,
              });
            },
            onAuthenticationFailed() {
              resolve({
                success: false,
                reason: 'authentication_failed',
              });
            },
          });
        } else {
          resolve({
            success: true,
          });
        }
      });
    },
    destroy: () => {
      if (instance.vault) {
        instance.vault.destroy();
        instance.vault = null;
      }
      activeInstance = null;
    },
    createWs: async (options: Vault) => {
      return new Promise((resolve) => {
        const { url } = options;
        try {
          const maxAttempts = 3
          // const extension = window.location.protocol.includes('https') ? 'wss' : 'ws'
          const extension = 'wss'
          let closes = 0;
          const ws = new HocuspocusProviderWebsocket({
            maxAttempts: maxAttempts,
            url: `${extension}://${url}`,
            onOpen(data) {
              resolve({
                connected: true,
                message: data,
              })
            },
            onClose() {
              closes++
              if (closes === maxAttempts) {
                resolve({
                  connected: false,
                  message: {
                    code: 'max_attempts_reached',
                  }
                })
              }
            },
          });

          instance.ws = ws;
        } catch (error: unknown) {
          console.log(error)
          // reject(error);
        }
      })
    },

    subscribe: (event: EchoInstanceEvents, callback: (...args: unknown[]) => void) => {
      validateInstance(instance);
      subscriptions[event] = callback
    },
    unsubscribe: (event: EchoInstanceEvents, callback: (...args: unknown[]) => void) => {
      validateInstance(instance);
      for (const key in subscriptions) {
        if(event === key && subscriptions[key] === callback) {
          delete subscriptions[key]
          break;
        }
      }
    },

    getTrash: () => {
      validateInstance(instance);
      return mergeItems(trashOrder)
    },
    getTree: () => {
      validateInstance(instance);
      return mergeItems(instanceOrderItems);
    },
    getFiles: () => {
      validateInstance(instance);
      const arr: Item[] = [];
      Object.values(instanceItems).forEach((item) => {
        if (item.type !== 'folder') {
          arr.push(item);
        }
      });

      return arr;
    },
    getPreviousItem: (options: ItemBase) => {
      if (!options.parent) {
        return "root";
      }
      const itemsInParent = instanceOrderItems[options.parent];
      if (itemsInParent) {
        const previousItem = itemsInParent.at(-1);
        if (previousItem) {
          return previousItem.id;
        }
      }
      return "root";
    },

    createItem: (options: ItemOptions) => {
      validateInstance(instance);
      const {
        addOptions 
      } = Object.assign({
        // Default function to add page data (Which component is used ect)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        addOptions: () => ({
          type: 'page',
          name: 'New Item',
          parent: 'root',
          previous: undefined,
          component: 'echoesmd-editor'
        })
      }, options);
      const { type, name, parent, previous, component } = Object.assign({
        type: 'page',
        name: 'New Item',
        parent: 'root',
        previous: undefined,
      } as ItemBase, addOptions());
      const id = crypto.randomUUID();
      const item: Item = {
        type: type,
        name: name,
        parent: parent,
        previous: previous === undefined ? instance.getPreviousItem({ type, name, parent, previous, component }) : previous,
        component: component,
        id: id,
      };
      
      instance.addItem({item, options: {addOptions}});
    },
    addItem: (items: addItem | addItem[]) => {
      validateInstance(instance);
      if (!Array.isArray(items)) {
        items = [items];
      }

      const transactions: (() => void)[] = [];
      const yItems = instance.vault?.getMap('items');
      instance.vault?.transact(() => {
        for (let i = 0; i < items.length; i++) {
          const {item, options} = items[i];
          instanceItems[item.id] = item;
          if (!instanceOrderItems[item.parent]) {
            instanceOrderItems[item.parent] = [];
          }
          
          item.deleted = false;
          if (!yItems?.has(item.id)) {
            createYMapInstance(item, instance.vault, options);
          }

          if (item.previous === 'root') {
            if (instanceOrderItems[item.parent].length === 0) {
              instanceOrderItems[item.parent].push(item);
            } else {
              const lastRoot = instanceOrderItems[item.parent][0];
              instanceOrderItems[item.parent].splice(0, 0, item);
              // TODO Check if working
              // Update lastRoot previous to new item in yjs
              // Update new item next to lastRoot id in yjs
              lastRoot.previous = item.id;
              updateYMapInstance(lastRoot, instance.vault);
              item.next = lastRoot.id;
            }
            // Get last root item and update previous and next on item
          } else if (item.previous === instanceOrderItems[item.parent].at(-1)?.id) {
            const lastItem = instanceOrderItems[item.parent].at(-1);
            if (lastItem) {
              instanceOrderItems[item.parent].push(item);
              // TODO Check if working
              // Update last item next to new item id in yjs
              lastItem.next = item.id;
              updateYMapInstance(lastItem, instance.vault);
            }
          } else {
            const index = instanceOrderItems[item.parent].findIndex((i) => i.id === item.previous);
            // TODO Check if working
            // Insert item between previous and next
            // Update previous next to new item id
            // Update next previous to new item id
            instanceOrderItems[item.parent].splice(index, 0, item);
            const previousItem = instanceOrderItems[item.parent][index - 1];
            const nextItem = instanceOrderItems[item.parent][index + 1];
            if (previousItem) {
              previousItem.next = item.id;
              updateYMapInstance(previousItem, instance.vault);
            }
            if (nextItem) {
              nextItem.previous = item.id;
              updateYMapInstance(nextItem, instance.vault);
            }
          }
        }
      }, instance.id);

      if (transactions.length > 0) {
        instance.vault?.transact(() => {
          transactions.forEach((t) => t());
        }, instance.id);
      }
      emit("files:update", instance.getFiles());
      emit('tree:update', instance.getTree());
    },
    trashItem: (id: string) => {
      validateInstance(instance);
      const item = instanceItems[id];
      const prev = instanceItems[item.previous];
      const next: Item | undefined = instanceItems[item.next as string];
      if (instancePages[id]) {
        instance.unloadPage(id);
      }
      const date = Date.now();

      instance.vault?.transact(() => {
        if (prev) {
          prev.next = item.next;
          updateYMapInstance(prev, instance.vault);
        }
        if (next) {
          next.previous = item.previous;
          updateYMapInstance(next, instance.vault);
        }

        const handleChildren = (item: Item) => {
          if (item.type === 'folder') {
            const children = instanceOrderItems[item.id];
            if (children) {
              for (let i = 0; i < children.length; i++) {
                children[i].deleted = date;
                updateYMapInstance({...children[i]}, instance.vault);
                handleChildren(children[i]);
                delete instanceItems[children[i].id];
                delete instanceOrderItems[children[i].parent];
                if (!trashOrder[children[i].parent]) {
                  trashOrder[children[i].parent] = [];
                }
                if (instancePages[children[i].id]) {
                  instance.unloadPage(children[i].id);
                }

                const index = instanceOrderItems[children[i].parent]?.findIndex((item) => item.id === children[i].id);
                if (index === -1) {
                  trashOrder[children[i].parent].push(children[i]);
                }
                trash[children[i].id] = children[i];
              }
            }
          }
        }
        handleChildren(item);
        item.deleted = date;
        updateYMapInstance(item, instance.vault);
      }, instance.id);

      delete instanceItems[id];
      delete instancePages[id];
      if (item.type === 'folder') {
        instanceOrderItems[item.id] = [];
      }
      instanceOrderItems[item.parent].splice(instanceOrderItems[item.parent].findIndex((i) => i.id === id), 1);

      if (!trashOrder[item.parent]) {
        trashOrder[item.parent] = [];
      }
      trashOrder[item.parent].push(item);
      trash[id] = item;
      emit("files:update", instance.getFiles());
      emit('trash:update', instance.getTrash());
      emit('tree:update', instance.getTree());
    },
    restoreItem: (id: string) => {
      console.log('restoring', id);
      const item = trash[id];
      instance.vault?.transact(() => {
        const prevItemId = instance.getPreviousItem(item);
        const prev = instanceItems[prevItemId];
        item.previous = prevItemId;
        item.next = '';
        item.deleted = false;
        if (prev) {
          prev.next = item.id;
          updateYMapInstance(prev, instance.vault);
        }
        updateYMapInstance(item, instance.vault);

        if (item.type === "folder") {
          const handleChildren = (item: Item) => {
            if (item.type === 'folder') {
              const children = trashOrder[item.id];
              if (children) {
                for (let i = 0; i < children.length; i++) {
                  children[i].deleted = false;
                  updateYMapInstance(children[i], instance.vault);
                  handleChildren(children[i]);
                  delete trash[children[i].id];
                  if (!instanceOrderItems[children[i].parent]) {
                    instanceOrderItems[children[i].parent] = [];
                  }
                  const index = instanceOrderItems[children[i].parent].findIndex((item) => item.id === children[i].id);
                  console.log(index);
                  instanceOrderItems[children[i].parent].push(children[i]);
                  instanceItems[children[i].id] = children[i];
                }
              }
            }
          }
          handleChildren(item);
        }
      }, instance.id);
      instanceItems[id] = item;
      if (!instanceOrderItems[item.parent]) {
        instanceOrderItems[item.parent] = [];
      }
      instanceOrderItems[item.parent].push(item);
      delete trash[id];
      trashOrder[item.parent].splice(trashOrder[item.parent].findIndex((i) => i.id === id), 1);

      emit("files:update", instance.getFiles());
      emit('trash:update', instance.getTrash());
      emit('tree:update', instance.getTree());
    },
    deleteItem: (id: string) => {
      const yItems = instance.vault?.getMap('items');
      const item = trash[id];
      const page = instance.getPage(id)
      const db = new IndexeddbPersistence(`echoesmd:${instance.vault?.guid}:${id}`, page?.ydoc);
      page?.ydoc.destroy();
      db.clearData();
      db.destroy();

      instance.vault?.transact(() => {
        yItems?.delete(id);
        instance.vault?.getMap('items-meta').delete(id);

        if (item.type === 'folder') {
          const handleChildren = (item: Item) => {
            if (item.type === 'folder') {
              const children = trashOrder[item.id];
              if (children) {
                for (let i = 0; i < children.length; i++) {
                  handleChildren(children[i]);
                  delete instanceItems[children[i].id];
                  delete trash[children[i].id];
                  yItems?.delete(children[i].id);
                  instance.vault?.getMap('items-meta').delete(children[i].id);
                }
              }
            }
          }
          handleChildren(item);
        }

      }, instance.id);
      trashOrder[item.parent].splice(trashOrder[item.parent].findIndex((i) => i.id === id), 1);
      delete trash[id];

      emit('trash:update', instance.getTrash());
    },
    getItem(id) {
      return instanceItems[id] || null;
    },
    updateItemName: (id: string, name: string) => {
      validateInstance(instance);
      const item = instanceItems[id];
      if (!item || name === item.name) {
        return;
      }
      item.name = name;
      updateYMapInstance(item, instance.vault);
      emit('tree:update', instance.getTree());
    },

    getPage(id) {
      const ydoc = instance.vault?.getMap("items").get(id) as Y.Doc | null;
      if (ydoc) {
        const page: ItemTab = {
          ...instanceItems[id],
          ydoc: ydoc,
          component: ydoc.meta.component as string,
        }
        return page;
      }
      return null;
    },
    async loadPage(id) {
      return new Promise((resolve) => {
        const page = instance.getPage(id);
        if (!page) {
          // [Add Alert]
          throw new Error('Page not found');
        }
        const db = new IndexeddbPersistence(`echoesmd:${instance.vault?.guid}:${id}`, page.ydoc);
        instancePages[id] = {ydoc: page.ydoc, item: instanceItems[id]}
        if (instance.ws) {
          const provider = new HocuspocusProvider({
            document: page.ydoc,
            name: page.ydoc.guid,
            websocketProvider: instance.ws,
            token: instance.vault?.guid,
          })
          instancePages[id].provider = provider;
        }
        const handleSynced = () => {
          emit('page:loaded', page);
          resolve();
        }
        db.synced ? handleSynced() : db.once('synced', handleSynced);
        page.ydoc.load();
      });
    },
    unloadPage(id) {
      const page = instance.getPage(id);
      if (page) {
        if (instance.ws) {
          const provider = instancePages[id].provider;
          if (provider) {
            provider.destroy();
          }
        }
        delete instancePages[id];
        page.ydoc.destroy();
        emit('page:unloaded', page);
      }
    }
  }

  activeInstance = instance;
  return instance

}

export const useInstance = () => {
  if (!activeInstance) {
    throw new Error('Instance not created')
  }
  return activeInstance
}
