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

export {
  Item,
  ItemBase,
  Item,
  ItemTree,
  ItemTab,
  Tab,
}
