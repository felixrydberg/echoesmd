interface itemBase {
  type: "folder" | "page";
  name: string;
  parent?: string;
  previous?: string;
}

interface ItemOptions extends itemBase {
  // Called in createItem / createYMapInstance
  addItemData?: () => {
    // [Chore] Replace with actual type
    [key: string]: unknown;
  };
  // Called in createItem / createYMapInstance
  addItemMeta?: () => {
    // [Chore] Replace with actual type
    [key: string]: unknown;
  };
}

interface Item extends itemBase {
  parent: string;
  id: string;
  previous: string;
  next?: string;
}

interface ItemTree extends Item {
  children?: ItemTree[];
}

interface ItemPage extends Item {
  ydoc: Y.Doc;
}

export {
  ItemOptions,
  Item,
  ItemTree,
  ItemPage,
}
