import { App } from "vue";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  Item,
  ItemTab,
  ItemTree,
  EchoInstance,
  EchoInstanceEvents,
  Vault,
} from "../types/index";
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from "@hocuspocus/provider";
import * as Y from "yjs";
import { useEchoesStore } from "../store/echoes";

const validateInstance = (instance: EchoInstance) => {
  try {
    if (!instance.vault) {
      throw "[Echoes/app] Vault not registered";
    }
  } catch (e) {
    console.error(e);
  }
};

let activeInstance: EchoInstance | null = null;

export const createEchoInstance = () => {
  const subscriptions: { [key: string]: ((...args: unknown[]) => void)[] } = {};
  const emit = (event: EchoInstanceEvents, ...args: unknown[]) => {
    if (subscriptions[event]) {
      for (let i = 0; i < subscriptions[event].length; i++) {
        subscriptions[event][i](...args);
        
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createYMapInstance = (item: Item, ydoc: Y.Doc | null) => {
    if (!ydoc) {
      throw new Error("Vault not registered");
    }

    const yItems = ydoc.getMap("items");
    const newDoc = new Y.Doc({
      meta: { type: item.type },
      guid: `echoesmd:${item.id}`,
      shouldLoad: false,
    });

    const db = new IndexeddbPersistence(
      `echoesmd:${instance.vault?.guid}:${item.id}`,
      newDoc
    );
    db.on("synced", db.destroy);

    yItems.set(item.id, newDoc);
    const yItemsMeta = ydoc.getMap("items-meta");
    const yItem = yItemsMeta.set(item.id, new Y.Map(Object.entries(item)));
    return yItem;
  };

  const updateYMapInstance = (item: Item, ydoc: Y.Doc | null) => {
    if (!ydoc) {
      throw new Error("Vault not registered");
    }
    const yItems = ydoc.getMap("items-meta");
    const yItem = yItems.get(item.id) as Y.Map<unknown> | undefined;
    if (yItem) {
      for (const key in item) {
        if (
          item[key as keyof Item] !== undefined &&
          yItem.get(key) !== item[key as keyof Item]
        ) {
          yItem.set(key, item[key as keyof Item]);
        }
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: EchoInstance = {
    id: crypto.randomUUID(),
    vault: null,
    ws: null,
    install: (app: App) => {
      app.config.globalProperties.$scarlett = instance;
    },
    register: (vault: Y.Doc) => {
      return new Promise((resolve) => {
        instance.vault = vault;
        const store = useEchoesStore();

        instance.subscribe("tree:update", (...args) =>
          store.setTree(args[0] as ItemTree[])
        );
        instance.subscribe("trash:update", (...args) =>
          store.setTrash(args[0] as ItemTree[])
        );
        instance.subscribe("files:update", (...args) =>
          store.setFiles(args[0] as ItemTree[])
        );

        const yItemMeta = vault.getMap("items-meta");
        yItemMeta.observeDeep(() => {
          emit("files:update", instance.getFiles());
          emit("trash:update", instance.getTrash());
          emit("tree:update", instance.getTree());
        });

        const db = new IndexeddbPersistence(`echoesmd:${vault.guid}`, vault);
        db.on("synced", async () => {
          store.setSynced(true);
          const subdocs = Array.from(vault.getSubdocs()).map(
            (subdoc) => `${vault.guid}:${subdoc.guid}`
          );
          const dbs = (await indexedDB.databases()).map((db) => db.name);
          for (let i = 0; i < dbs.length; i++) {
            const name = dbs[i];
            if (name) {
              if (
                !subdocs.includes(name) &&
                name !== vault.guid &&
                name.split(":")[0] === vault.guid
              ) {
                console.log("Deleted", name);
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
                reason: "authentication_failed",
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
          const maxAttempts = 3;
          // const extension = window.location.protocol.includes('https') ? 'wss' : 'ws'
          const extension = "wss";
          let closes = 0;
          const ws = new HocuspocusProviderWebsocket({
            maxAttempts: maxAttempts,
            url: `${extension}://${url}`,
            onOpen(data) {
              resolve({
                connected: true,
                message: data,
              });
            },
            onClose() {
              closes++;
              if (closes === maxAttempts) {
                resolve({
                  connected: false,
                  message: {
                    code: "max_attempts_reached",
                  },
                });
              }
            },
          });

          instance.ws = ws;
        } catch (error: unknown) {
          console.log(error);
          // reject(error);
        }
      });
    },

    subscribe: (
      event: EchoInstanceEvents,
      callback: (...args: unknown[]) => void
    ) => {
      validateInstance(instance);
      if (!subscriptions[event]) {
        subscriptions[event] = [];
      }
      subscriptions[event].push(callback);
    },
    unsubscribe: (
      event: EchoInstanceEvents,
      callback: (...args: unknown[]) => void
    ) => {
      validateInstance(instance);
      if (subscriptions[event]) {
        const index = subscriptions[event].indexOf(callback);
        if (index !== -1) {
          subscriptions[event].splice(index, 1);
        }
      }
    },

    getTrash: () => {
      validateInstance(instance);
      const items = Object.groupBy(
        instance.getFilesFromKeyValue({
          key: "deleted",
          value: false,
          condition: "not-equals",
        }) as ItemTree[],
        (item) => item.type
      );
      const trash: { [key: string]: ItemTree } = {};
      // Loop over folders and index in trash
      if (items.folder) {
        for (let i = 0; i < items.folder.length; i++) {
          const item = items.folder[i];
          trash[item.id] = {
            ...item,
            children: [],
          };
        }
      }
      if (items.page) {
        for (let i = 0; i < items.page.length; i++) {
          const item = items.page[i];
          const parent = trash[item.parent];
          if (parent && item.deleted === parent.deleted) {
            parent.children?.push(item);
          } else {
            trash[item.id] = item;
          }
        }
      }
      return Object.values(trash);
    },
    getTree: () => {
      validateInstance(instance);
      const items = instance.getLinkedItems("root", false);
      for (let i = 0; i < items.length; i++) {
        const item = { ...items[i], children: [] };
        const map: { [key: string]: ItemTree[] } = {};
        map[item.id] = item.children;
        const children: ItemTree[] = instance.getFilesUnderItem(item, false);

        for (let j = 0; j < children.length; j++) {
          const child = children[j];
          if (child.deleted) {
            continue;
          }
          if (child.type === "folder") {
            map[child.id] = [];
            child.children = map[child.id];
            map[child.parent].push(child);
          } else {
            map[child.parent].push(child);
          }
        }
        items[i] = item;
      }
      return items;
    },
    getFiles: () => {
      validateInstance(instance);
      const items = instance.getFilesFromKeyValue(
        { key: "deleted", value: false, condition: "equals" },
        { key: "type", value: "page", condition: "equals" }
      );
      return items;
    },

    // Helper functions
    getFilesUnderItem: (item: Item, deleted = true) => {
      validateInstance(instance);
      if (item.type === "page") {
        return [];
      }
      const items: Item[] = [];
      const children = instance.getLinkedItems(item.id, deleted);
      const processChildren = (children: Item[]) => {
        for (let i = 0; i < children.length; i++) {
          items.push(children[i]);
          if (children[i].type === "folder") {
            processChildren(instance.getLinkedItems(children[i].id, deleted));
          }
        }
      };
      processChildren(children);
      return items;
    },
    getFilesFromKeyValue(...filters) {
      validateInstance(instance);
      const yItems = instance.vault?.getMap<Item>("items-meta");
      if (!yItems) {
        throw new Error("Could not find items-meta map");
      }

      let result: Item[] = Array.from(Object.values(yItems.toJSON()));
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        result = result.filter((item) => {
          if (filter.condition === "equals") {
            return item[filter.key] === filter.value;
          } else if (filter.condition === "not-equals") {
            return item[filter.key] !== filter.value;
          }
        });
      }
      return result;
    },
    getFileFromId(id) {
      validateInstance(instance);
      const yItems = instance.vault?.getMap("items-meta");
      if (yItems) {
        const items = yItems.toJSON();
        return items[id] || null;
      }
      return null;
    },
    getLinkedItems(parent, deleted = true) {
      validateInstance(instance);
      const filters: {
        key: keyof Item,
        value: Item[keyof Item],
        condition?: 'equals' | 'not-equals'
      }[] = [{ key: "parent", value: parent, condition: "equals" }];
      if (!deleted) {
        filters.push({ key: "deleted", value: false, condition: "equals" });
      } else {
        filters.push({ key: "deleted", value: false, condition: "not-equals" });
      }
      const items = instance.getFilesFromKeyValue(...filters);
      const sortedItems: Item[] = [];
      const itemMap: { [key: string]: Item } = {};
      items.forEach((item) => {
        itemMap[item.id] = item;
      });
      let currentItem = items.find((item) => item.previous === "root");
      while (currentItem) {
        sortedItems.push(currentItem);
        currentItem = currentItem.next ? itemMap[currentItem.next] : undefined;
      }
      return sortedItems;
    },
    getNextItem(item: Item) {
      const next = item.next
        ? instance.getFilesFromKeyValue({
            key: "id",
            value: item.next,
            condition: "equals",
          })
        : instance.getFilesFromKeyValue({
            key: "previous",
            value: item.id,
            condition: "equals",
          });
      return next[0] ? next[0] : null;
    },
    getPreviousItem(item: Item) {
      const prev = instance.getFilesFromKeyValue({
        key: "id",
        value: item.previous,
        condition: "equals",
      });
      return prev[0] ? prev[0] : null;
    },
    getFilePath(item: Item) {
      const path = [`${item.id}:${item.name}`];
      let parent = item.parent;
      while (parent !== "root") {
        const parentItem = instance.getFileFromId(parent);
        if (parentItem) {
          path.unshift(`${parentItem.id}:${parentItem.name}`);
          parent = parentItem.parent;
        } else {
          break;
        }
      }
      return path.join("/");
    },

    createItem: (item) => {
      validateInstance(instance);
      const previous = instance.getLinkedItems(item.parent, false).pop();
      const newItem: Item = {
        ...item,
        id: crypto.randomUUID(),
        previous: previous ? previous.id : "root",
        deleted: false,
      };
      instance.addItem(newItem);
    },
    addItem: (items: Item | Item[]) => {
      validateInstance(instance);
      if (!Array.isArray(items)) {
        items = [items];
      }

      instance.vault?.transact(() => {
        // Create the item in the vault and update previous and next items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const next = instance.getNextItem(item);
          const prev = instance.getPreviousItem(item);
          if (next) {
            updateYMapInstance({ ...next, previous: item.id }, instance.vault);
          }
          if (prev) {
            updateYMapInstance({ ...prev, next: item.id }, instance.vault);
          }

          item.next = next ? next.id : undefined;
          item.previous = prev ? prev.id : "root";
          createYMapInstance(item, instance.vault);
        }
      }, instance.id);
      emit("files:update", instance.getFiles());
      emit("tree:update", instance.getTree());
    },
    trashItem: (id: string) => {
      validateInstance(instance);
      instance.vault?.transact(() => {
        const item = instance.getFileFromId(id);
        if (item) {
          const path = instance.getFilePath(item);
          const deleted = Date.now();
          const next = instance.getNextItem(item);
          const prev = instance.getPreviousItem(item);
          if (next) {
            updateYMapInstance(
              { ...next, previous: prev ? prev.id : "root" },
              instance.vault
            );
          }
          if (prev) {
            updateYMapInstance(
              { ...prev, next: next ? next.id : undefined },
              instance.vault
            );
          }
          const children = instance.getFilesUnderItem(item, false);
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.deleted) {
              continue;
            }
            updateYMapInstance({
              ...child,
              deleted: deleted,
              trashPath: `${path}/${child.id}:${child.name}`,
            }, instance.vault);
          }
          updateYMapInstance(
            { ...item, deleted: deleted, trashPath: path },
            instance.vault
          );
        }
      });

      emit("files:update", instance.getFiles());
      emit("trash:update", instance.getTrash());
      emit("tree:update", instance.getTree());
    },
    restoreItem: (id: string) => {
      validateInstance(instance);
      instance.vault?.transact(() => {
        const item = instance.getFileFromId(id);
        if (item) {
          const path = (item.trashPath || "").split("/");
          for (let i = 0; i < path.length; i++) {
            const [id, name] = path[i].split(":");
            // We know that we are at the end of the path
            if (id === item.id) {
              break;
            }
            const parent = instance.getFileFromId(id);
            if (parent && parent.deleted) {
              const prev = instance.getLinkedItems(parent.id, false).pop();
              updateYMapInstance({
                ...parent,
                deleted: false,
                trashPath: "",
                previous: prev ? prev.id : "root",
              }, instance.vault);
            } else if (!parent) {
              // Create a new folder item and place at the bottom of previous path item
              const [parentId] = (path[i - 1] || "").split(":");
              const parent = parentId || "root";
              const prev = instance.getLinkedItems(parent, false).pop();
              if (prev) {
                updateYMapInstance({ ...prev, next: id }, instance.vault);
              }
              const item: Item = {
                id: id,
                name: name,
                parent: parent,
                previous: prev ? prev.id : "root",
                component: "file-default",
                type: "folder",
                deleted: false,
              };
              createYMapInstance(item, instance.vault);
            }
          }

          const children = instance.getFilesUnderItem(item);
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.deleted === item.deleted) {
              updateYMapInstance({...child, deleted: false}, instance.vault);
            }
          }
          // Place at the bottom of the parent item
          const prev = instance.getLinkedItems(item.parent, false).pop();
          if (prev) {
            updateYMapInstance({...prev, next: item.id}, instance.vault);
          }
          updateYMapInstance({
            ...item,
            deleted: false,
            previous: prev ? prev.id : "root",
            next: "",
            trashPath: ""
          }, instance.vault);
        }
      }, instance.id);

      emit("files:update", instance.getFiles());
      emit("trash:update", instance.getTrash());
      emit("tree:update", instance.getTree());
    },
    deleteItem: (id: string) => {
      validateInstance(instance);
      instance.vault?.transact(() => {
        const item = instance.getFileFromId(id);
        if (item) {
          const next = instance.getNextItem(item);
          const prev = instance.getPreviousItem(item);
          if (next) {
            updateYMapInstance(
              { ...next, previous: prev ? prev.id : "root" },
              instance.vault
            );
          }
          if (prev) {
            updateYMapInstance(
              { ...prev, next: next ? next.id : undefined },
              instance.vault
            );
          }
          const children = instance.getFilesUnderItem(item);
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // If items werent trashed together then dont delete them together
            if (child.deleted !== item.deleted) {
              continue;
            }
            instance.vault?.getMap("items-meta").delete(child.id);
            instance.vault?.getMap("items").delete(child.id);
            indexedDB.deleteDatabase(
              `echoesmd:${instance.vault?.guid}:${child.id}`
            );
          }
          instance.vault?.getMap("items-meta").delete(item.id);
          instance.vault?.getMap("items").delete(item.id);
          indexedDB.deleteDatabase(
            `echoesmd:${instance.vault?.guid}:${item.id}`
          );
        }
      }, instance.id);
      emit("trash:update", instance.getTrash());
    },
    getItem(id) {
      validateInstance(instance);
      return instance.getFileFromId(id);
    },
    updateItem: (item: Item) => {
      validateInstance(instance);
      updateYMapInstance(item, instance.vault);
      emit("tree:update", instance.getTree());
    },

    getPage(id) {
      const item = instance.getFileFromId(id);
      const ydoc = instance.vault?.getMap("items").get(id) as Y.Doc | null;
      if (ydoc && item) {
        const page: ItemTab = {
          ...item,
          ydoc: ydoc,
          component: item.component as string,
        };
        return page;
      }
      return null;
    },
    async loadPage(id) {
      return new Promise((resolve) => {
        const page = instance.getPage(id);
        if (!page) {
          // [Add Alert]
          throw new Error("Page not found");
        }
        const db = new IndexeddbPersistence(
          `echoesmd:${instance.vault?.guid}:${id}`,
          page.ydoc
        );
        if (instance.ws) {
          new HocuspocusProvider({
            document: page.ydoc,
            name: page.ydoc.guid,
            websocketProvider: instance.ws,
            token: instance.vault?.guid,
          });
        }
        const handleSynced = () => {
          emit("page:loaded", page);
          resolve();
        };
        db.synced ? handleSynced() : db.once("synced", handleSynced);
        page.ydoc.load();
      });
    },
    unloadPage(id) {
      const page = instance.getPage(id);
      if (page) {
        page.ydoc.destroy();
        emit("page:unloaded", page);
      }
    },
  };

  activeInstance = instance;
  return instance;
};

export const useInstance = () => {
  if (!activeInstance) {
    throw new Error("Instance not created");
  }
  return activeInstance;
};
