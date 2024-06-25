import { App, nextTick } from "vue";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import {
  addItem,
  Item,
  ItemBase,
  ItemOptions,
  ItemPage,
  ItemTree,
  ScarlettInstance,
  ScarlettInstanceEvents,
  ScarlettInstanceOptions,
} from "@/types/index";
import { useVaultStore } from "@/store/vault";
import * as Y from "yjs";

const createProviders = (id: string, ydoc: Y.Doc, options?: ScarlettInstanceOptions) => {
  const db = new IndexeddbPersistence(id, ydoc);
  const obj: {
    db: IndexeddbPersistence,
    webrtc?: WebrtcProvider,
  } = {
    db,
  }
  if (options?.providers.webrtc) {
    const {options: webrtcOptions} = options.providers.webrtc;
    obj.webrtc = new WebrtcProvider(ydoc.guid, ydoc, webrtcOptions);
  }
  return obj;
}

const validateInstance = (instance: ScarlettInstance) => {
  try {
    if (!instance.vault) {
      throw '[Scarlett.md/core] Vault not registered'
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

let activeInstance: ScarlettInstance | null = null;

export const createScarlettInstance = (options?: ScarlettInstanceOptions) => {
  const subscriptions: {[key: string]: (...args: unknown[]) => void} = {};
  const instanceItems: {[key: string]: Item}  = {}
  const instanceOrderItems: {[key: string]: Item[]}  = {}
  const instancePages: {[key: string]: {
    ydoc: Y.Doc,
    item: Item,
  }} = {}
  const trash: {[key: string]: Item} = {}
  const trashOrder: {[key: string]: Item[]} = {}

  const emit = (event: ScarlettInstanceEvents, ...args: unknown[]) => {
    if(subscriptions[event]) {
      subscriptions[event](...args)
    }
  }

  const createYMapInstance = (item: Item, ydoc: Y.Doc | null, ItemOptions: ItemOptions) => {
    if (!ydoc) {
      throw new Error('Vault not registered');
    }

    const yItems = ydoc.getMap('items');
    const newDoc = new Y.Doc({meta: {type: item.type, component: item.component}, guid: item.id, shouldLoad: false})
    
    if (ItemOptions.addPageData) {
      ItemOptions.addPageData(newDoc);
    }
    const providers = createProviders(`${instance.vault?.guid}:${item.id}`, newDoc, options);
    Object.values(providers).forEach((provider) => {
      provider.on('synced', () => {
        provider.destroy();
      });
    });

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
  const instance: ScarlettInstance = {
    id: crypto.randomUUID(),
    vault: null,
    db: null,
    install: (app: App) => {
      app.config.globalProperties.$scarlett = instance
    },
    register: (vault: Y.Doc) => {
      instance.vault = vault;
      const store = useVaultStore();
      const handleSync = () => {
        // Get current subdocs and add them to instance
        // Listen for new subdocs
        // Listen for vault meta data map

        instance.subscribe("tree:update", (...args) => store.setTree(args[0] as ItemTree[]));
        instance.subscribe("trash:update", (...args) => store.setTrash(args[0] as ItemTree[]));
        instance.subscribe("files:update", (...args) => store.setFiles(args[0] as ItemTree[]));

        instance.subscribe("page:loaded", (...args: unknown[]) => {
          const page = args[0] as ItemPage;
          const tabs = store.tabs;
          const setAsActive = () => {
            store.setTab({
              id: page.id,
              component: page.component,
              props: {
                page: page,
              }
            })
          }
    
          if (tabs.find((_page) => _page.id === page.id)) {
            setAsActive();
            return;
          }
          const arr = [...tabs];
          arr.push(page);
          store.setTabs(arr);
          nextTick(setAsActive)
        })
        instance.subscribe("page:unloaded", (...args: unknown[]) => {
          const page = args[0] as ItemPage;
          const tabs = store.tabs;
          const index = tabs.findIndex((_page) => _page.id === page.id)
          if (index >= 0) {
            store.setTabs(tabs.toSpliced(index, 1));
          }
        })
      
        const yItemsMeta = vault.getMap('items-meta');
        yItemsMeta.observeDeep((events: Y.YEvent<Y.Map<Item>>[]) => {
          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const item = event.target.toJSON() as Item | {[key: string]: Item};
            const { origin } = event.transaction;

            if (origin !== instance.id) {
              if (item.deleted && !trash[item.id as string]) {
                // Check if item was deleted
                if (instancePages[item.id as string]) {
                  instance.unloadPage(item.id as string);
                }

                delete instanceItems[item.id as string];
                delete instancePages[item.id as string];
                instanceOrderItems[item.parent as string]
                  .splice(instanceOrderItems[item.parent as string]
                  .findIndex((i) => i.id === item.id), 1);
          
                trash[item.id as string] = item as Item;
              } else {
                if (trash[item.id as string] && !item.deleted) {
                  // Restore item
                  instanceItems[item.id as string] = item as Item;
                  if (!instanceOrderItems[item.parent as string]) {
                    instanceOrderItems[item.parent as string] = [];
                  }
                  instanceOrderItems[item.parent as string].push(item as Item);
                  delete trash[item.id as string];

                  // Replace with checking if item is object of items or single item
                } else if(!instanceItems[item.id as string] && !item.deleted) {
                  const itemKeys = Object.keys(item);
                  const trashKeys = Object.keys(trash);
                  const instanceKeys = Object.keys(instanceItems);

                  const arr = instanceKeys.concat(trashKeys);
                  const change = itemKeys.find((key) => !arr.includes(key));
                  const missing = arr.find((key) => !itemKeys.includes(key));

                  if (missing && trash[missing]) {
                    indexedDB.deleteDatabase(missing);
                    delete trash[missing]
                  } else if (change) {
                    const newItem = (item as {[key:string]: Item})[change] as Item;
                    instanceItems[newItem.id as string] = item as Item;
                    if (!instanceOrderItems[newItem.parent as string]) {
                      instanceOrderItems[newItem.parent as string] = [];
                    }
                    const index = instanceOrderItems[newItem.parent as string].findIndex((i) => i.id === newItem.previous);
                    if (index + 1 > 0) {
                      instanceOrderItems[newItem.parent as string].splice(index + 1, 0, newItem);
                      instanceItems[newItem.id as string] = newItem;
                    } else {
                      if (instanceOrderItems[newItem.parent as string].length === 0) {
                        instanceOrderItems[newItem.parent as string].push(newItem);
                        instanceItems[newItem.id as string] = newItem;
                      }
                    }
                  }
                } else {
                  // Update item
                  if (instanceItems[item.id as string]) {
                    instanceItems[item.id as string] = item as Item;
                  } else if (trash[item.id as string]) {
                    trash[item.id as string] = item as Item;
                  }
                }
              }
            }
            // } else {
            //   // Changes are made locally
            //   console.log('Local', item)
            //   console.log('Local', instanceItems[item.id as string])
            //   if (item.deleted) {
            //     console.log('Item was deleted')
            //   }
            // }
          }
          emit("files:update", instance.getFiles());
          emit("trash:update", instance.getTrash());
          emit("tree:update", instance.getTree());
        });

        vault.getSubdocs().forEach((subdoc) => {
          const yItem = yItemsMeta.get(subdoc.guid) as Y.Map<unknown>;
          if (!yItem) {
            return;
          }

          if (yItem.get("deleted")) {
            const {parent} = yItem.toJSON() as Item;
            trash[subdoc.guid] = yItem.toJSON() as Item;
            if (!trashOrder[parent]) {
              trashOrder[parent] = [];
            }
            trashOrder[parent].push(yItem.toJSON() as Item);
          } else {
            const item = yItem.toJSON() as Item;
            instanceItems[subdoc.guid] = item;
            if (!instanceOrderItems[item.parent]) {
              instanceOrderItems[item.parent] = [];
            }
            instanceOrderItems[item.parent].push(item);
          }
        });

        Object.keys(instanceOrderItems).forEach((key) => {
          const root = instanceOrderItems[key].find((item) => item.previous === 'root');
          if (!root) {
            return;
          }
          const newItems = [root];
          const processItem = (item: Item) => {
            if (item.next && item.next !== item.id) {
              const nextItem = instanceItems[item.next];
              if (nextItem) {
                newItems.push(nextItem);
                processItem(nextItem);
              }
            }
          }
          processItem(root);
          instanceOrderItems[key] = newItems;
        });
        emit("files:update", instance.getFiles());
        emit("trash:update", instance.getTrash());
        emit("tree:update", instance.getTree());
      }
      // Refactor handleSync

      instance.subscribe("tree:update", (...args) => store.setTree(args[0] as ItemTree[]));
      instance.subscribe("trash:update", (...args) => store.setTrash(args[0] as ItemTree[]));
      instance.subscribe("files:update", (...args) => store.setFiles(args[0] as ItemTree[]));

      instance.subscribe("page:loaded", (...args: unknown[]) => {
        const page = args[0] as ItemPage;
        const tabs = store.tabs;
        const setAsActive = () => {
          store.setTab({
            id: page.id,
            component: page.component,
            props: {
              page: page,
            }
          })
        }
  
        if (tabs.find((_page) => _page.id === page.id)) {
          setAsActive();
          return;
        }
        const arr = [...tabs];
        arr.push(page);
        store.setTabs(arr);
        nextTick(setAsActive)
      })
      instance.subscribe("page:unloaded", (...args: unknown[]) => {
        const page = args[0] as ItemPage;
        const tabs = store.tabs;
        const index = tabs.findIndex((_page) => _page.id === page.id)
        if (index >= 0) {
          store.setTabs(tabs.toSpliced(index, 1));
        }
      })

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
            console.log(item)
            if (item.deleted) {
              // Check if item is in trash
            }
          }

          emit("files:update", instance.getFiles());
          emit("trash:update", instance.getTrash());
          emit("tree:update", instance.getTree());
        }
      });

      const { db } = createProviders(vault.guid, vault, options)
      instance.db = db;
      db.on("synced", async () => {
        const subdocs = Array.from(vault.getSubdocs()).map((subdoc) => `${vault.guid}:${subdoc.guid}`);
        const dbs = (await indexedDB.databases()).map((db) => db.name);
        for (let i = 0; i < dbs.length; i++) {
          const name = dbs[i];
          if (name) {
            if (!subdocs.includes(name) && name !== vault.guid) {
              console.log("Delete", name)
              indexedDB.deleteDatabase(name);
            }
          }
        }
      });
    },
    subscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => {
      validateInstance(instance);
      subscriptions[event] = callback
    },
    unsubscribe: (event: ScarlettInstanceEvents, callback: (...args: unknown[]) => void) => {
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
        addPageData,
        addOptions 
      } = Object.assign({
        // Default function to add page data (Which component is used ect)
        addPageData: (ydoc: Y.Doc) => {
        },
        addOptions: () => ({
          type: 'page',
          name: 'New Item',
          parent: 'root',
          previous: undefined,
          component: 'scarlettmd-editor'
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
      
      instance.addItem({item, options: {addPageData, addOptions}});
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
            console.log("First statement")
            if (instanceOrderItems[item.parent].length === 0) {
              console.log("First statement - 1")
              instanceOrderItems[item.parent].push(item);
            } else {
              console.log("First statement - 2")
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
            console.log("Second statement")
              const lastItem = instanceOrderItems[item.parent].at(-1);
              if (lastItem) {
                instanceOrderItems[item.parent].push(item);
                // TODO Check if working
                // Update last item next to new item id in yjs
                lastItem.next = item.id;
                updateYMapInstance(lastItem, instance.vault);
              }
          } else {
            console.log("Third statement")
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
                updateYMapInstance({...children[i], deleted: date}, instance.vault);
                handleChildren(children[i]);
                delete instanceItems[children[i].id];
                if (!trashOrder[children[i].parent]) {
                  trashOrder[children[i].parent] = [];
                }
                trashOrder[children[i].parent].push(children[i]);
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
      } else {
        instanceOrderItems[item.parent].splice(instanceOrderItems[item.parent].findIndex((i) => i.id === id), 1);
      }

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
      const item = trash[id];
      instance.vault?.transact(() => {
        const prevItemId = instance.getPreviousItem(item);
        const prev = instanceItems[prevItemId];
        item.previous = prevItemId;
        prev.next = item.id;
        item.deleted = false;
        updateYMapInstance(item, instance.vault);
        updateYMapInstance(prev, instance.vault);
      }, instance.id);
      instanceItems[id] = item;
      if (!instanceOrderItems[item.parent]) {
        instanceOrderItems[item.parent] = [];
      }
      instanceOrderItems[item.parent].push(item);
      delete trash[id];

      emit("files:update", instance.getFiles());
      emit('trash:update', instance.getTrash());
      emit('tree:update', instance.getTree());
    },
    deleteItem: (id: string) => {
      const yItems = instance.vault?.getMap('items');
      const item = trash[id];
      const page = instance.getPage(id)
      const {db} = createProviders(`${instance.vault?.guid}:${item.id}`, page?.ydoc, options);
      page?.ydoc.destroy();
      db.clearData();
      db.destroy();

      instance.vault?.transact(() => {
        yItems?.delete(id);
        instance.vault?.getMap('items-meta').delete(id);
      }, instance.id);
      trashOrder[item.parent].splice(trashOrder[item.parent].findIndex((i) => i.id === id), 1);
      delete trash[id];

      emit('trash:update', instance.getTrash());
    },
    getItem(id) {
      return instanceItems[id] || null;
    },
    getPage(id) {
      const ydoc = instance.vault?.getMap("items").get(id) as Y.Doc | null;
      if (ydoc) {
        const page: ItemPage = {
          ...instanceItems[id],
          ydoc: ydoc,
          component: ydoc.meta.component as string,
        }
        return page;
      }
      return null;
    },
    loadPage(id) {
      const page = instance.getPage(id);
      if (instancePages[id]) {
        emit('page:loaded', page);
      } else if (page) {
        const {db} = createProviders(`${instance.vault?.guid}:${id}`, page.ydoc, options);
        instancePages[id] = {ydoc: page.ydoc, item: instanceItems[id]}
        page.ydoc.load();
        const syncHandler = () => {
          emit('page:loaded', page);
        }
        db.synced ? syncHandler() : db.once('synced', syncHandler);
      }
    },
    unloadPage(id) {
      const page = instance.getPage(id);
      if (page) {
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
