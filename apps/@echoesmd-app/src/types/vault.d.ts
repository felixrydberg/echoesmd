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

interface ItemTab extends Item {
  ydoc: Y.Doc;
}

interface Tab {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

export {
  addItem,
  ItemBase,
  ItemOptions,
  Item,
  ItemTree,
  ItemTab,
  Tab,
}
