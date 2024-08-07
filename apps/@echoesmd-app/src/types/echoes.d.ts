interface Group {
  id: string;
  // Index of which tab is active
  active: number;
  name: string;
  tabs: ItemTab[];
}

interface Vault {
  name: string;
  url: string;
  id: string;
  token: string;
  collaboration: false | {
    password: string;
    synced: boolean;
  };
  lastOpened: string;
  state: {
    tree: ItemTree[];
    trash: ItemTree[];
    files: ItemTree[];
    group: Group["id"] | null;
    groups: Group[];
    sidebar: boolean;
    synced: boolean;
  };
}

interface AppOptions {
  tauri: boolean,
  theme: string,
  loading: boolean,
  openVault: "none" | Vault["id"],
}

export {
  Vault,
  AppOptions,
  Group,
}
