interface Vault {
  name: string;
  url: string;
  id: string;
  token: string;
  collaboration: false | {
    password: string;
  };
  lastOpened: string;
}

interface ItemBase {
  type: "folder" | "page";
  name: string;
  parent?: string;
  previous?: string;
  component: string;
  deleted?: false | number;
}

interface ItemOptions {
  addPageData?: (ydoc: Y.Doc) => void;
  addOptions: () => ItemBase;
}

interface Item extends ItemBase {
  parent: string;
  id: string;
  previous: string;
  next?: string;
}

interface addItem {
  item: Item;
  options: ItemOptions;
}

interface ItemTree extends Item {
  children?: ItemTree[];
}

interface ItemPage extends Item {
  ydoc: Y.Doc;
}

interface Tab {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

interface Group {
  id: number;
  active: number;
  name: string;
  tabs: ItemPage[];
}

export {
  Vault,
  addItem,
  ItemBase,
  ItemOptions,
  Item,
  ItemTree,
  ItemPage,
  Tab,
  Group,
}
