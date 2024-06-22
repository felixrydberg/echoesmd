import * as Y from 'yjs';
import { Item, ItemOptions, ScarlettInstance, ScarlettInstanceEvents, ItemTree, ItemPage } from '@/types/index';
import { App } from 'vue';
import { IndexeddbPersistence } from 'y-indexeddb';

const validateInstance = (instance: ScarlettInstance) => {
  try {
    if (!instance.vault) {
      throw '[Scarlett.md/core] Vault not registered'
    }
  } catch (e) {
    console.error(e)
  }
}

let activeInstance: ScarlettInstance | null = null;

export const createScalettInstance = () => {
  const subscriptions: {[key: string]: (...args: unknown[]) => void} = {};
  // const items: {[key: string]: Item} = {};
  const instanceItems: {[key: string]: Item}  = {}
  const instanceOrderItems: {[key: string]: Item[]}  = {}
  const instancePages: {[key: string]: {
    ydoc: Y.Doc,
    db: IndexeddbPersistence,
    item: Item,
  }} = {}

  const emit = (event: ScarlettInstanceEvents, ...args: unknown[]) => {
    if(subscriptions[event]) {
      subscriptions[event](...args)
    }
  }

  const createYMapInstance = (item: Item, ydoc: Y.Doc | null) => {
    if (!ydoc) {
      throw new Error('Vault not registered');
    }
    const yItems = ydoc.getMap('items');
    const newDoc = new Y.Doc({meta: {type: item.type}, guid: item.id})
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
  // const instance: any = {
  const instance: ScarlettInstance = {
    id: crypto.randomUUID(),
    vault: null,
    db: null,
    install: (app: App) => {
      app.config.globalProperties.$scarlett = instance
    },
    register: (vault: Y.Doc) => {
      instance.vault = vault
      const handleSync = () => {
        emit('vault:synced')
        // Get current subdocs and add them to instance
        // Listen for new subdocs
        // Listen for vault meta data map

        const yItemsMeta = vault.getMap('items-meta');
        yItemsMeta.observe((event) => {
          if (event.transaction.origin !== instance.id) {
            // Add items to instance
          } else {
            // Make sure items are up to date
          }
        });
        vault.on('subdocs', ({added, removed}, _ydoc, transaction) => {
          if (transaction.origin !== instance.id) {
            //

          }
          console.log(added, removed)
        });
        vault.getSubdocs().forEach((subdoc) => {
          const yItem = yItemsMeta.get(subdoc.guid) as Y.Map<unknown>;
          if (!yItem) {
            return;
          }
          const item = yItem.toJSON() as Item;
          instanceItems[subdoc.guid] = item;
          if (!instanceOrderItems[item.parent]) {
            instanceOrderItems[item.parent] = [];
          }
          instanceOrderItems[item.parent].push(item);
        });

        Object.keys(instanceOrderItems).forEach((key) => {
          const root = instanceOrderItems[key].find((item) => item.previous === 'root');
          if (!root) {
            return;
          }
          let id: undefined | string = root.next;
          const newItems = [root];

          while (id) {
            const item: Item = instanceItems[id];
            if (item) {
              newItems.push(item);
              if (!item.next) {
                break;
              }
              id = item.next;
            }
          }
          instanceOrderItems[key] = newItems;
        });
        emit('tree:update', instance.getTree());
      }
      instance.db = new IndexeddbPersistence(vault.guid, vault)
      instance.db.synced ? handleSync() : instance.db.once('synced', handleSync);
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

    getTree: () => {
      validateInstance(instance);
      if (!instanceOrderItems["root"]) {
        return [];
      }

      const root: ItemTree[] = instanceOrderItems["root"].map((item) => Object.assign({}, item));
      const handleChildren = (item: ItemTree) => {
        if (item.type === 'folder') {
          item.children = instanceOrderItems[item.id]?.map((item) => Object.assign({}, item)) || [];
          for (let i = 0; i < item.children.length; i++) {
            handleChildren(item.children[i]);
          }
        }
      };
      for (let i = 0; i < root.length; i++) {
        handleChildren(root[i]);
      }
      return root;
    },
    
    getPreviousItem: (options: ItemOptions) => {
      if (!options.parent) {
        console.log('No parent')
        return "root";
      }
      const itemsInParent = instanceOrderItems[options.parent];
      console.log(itemsInParent);
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
      const { type, name, parent, previous, } = Object.assign({
        type: 'page',
        name: 'New Item',
        parent: 'root',
        previous: undefined,
      }, options);
      const id = crypto.randomUUID();
      const item: Item = {
        type: type,
        name: name,
        parent: parent,
        previous: previous === undefined ? instance.getPreviousItem({ type, name, parent, previous }) : previous,
        id: id,
      };
      
      console.log(item)
      instance.addItem(item);
    },
    addItem: (items: Item | Item[]) => {
      validateInstance(instance);
      if (!Array.isArray(items)) {
        items = [items];
      }

      const transactions: (() => void)[] = [];
      const yItems = instance.vault?.getMap('items');
      instance.vault?.transact(() => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          instanceItems[item.id] = item;
          if (!instanceOrderItems[item.parent]) {
            instanceOrderItems[item.parent] = [];
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
                console.log(lastItem)
                updateYMapInstance(lastItem, instance.vault);
  
              }
          } else {
            console.log("Third statement")
            const index = instanceOrderItems[item.parent].findIndex((i) => i.id === item.previous);
            console.log(index);
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
  
          emit('page:added', item);
          if (yItems?.has(items[i].id)) {
            return;
          }
          createYMapInstance(item, instance.vault);
        }
      }, instance.id);

      if (transactions.length > 0) {
        instance.vault?.transact(() => {
          transactions.forEach((t) => t());
        }, instance.id);
      }
      emit('tree:update', instance.getTree());
    },
    removeItem: (id: string) => {
      validateInstance(instance);
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
        }
        return page;
      }
      return null;
    },
    loadPage(id) {
      const page = instance.getPage(id);
      if (page) {
        const db = new IndexeddbPersistence(id, page.ydoc);
        instancePages[id] = {ydoc: page.ydoc, db: db, item: instanceItems[id]}
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
