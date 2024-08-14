import { useEchoesStore } from "../../store/echoes";
import { addSettingsToGroupList, Plugin } from "@echoesmd/plugin-types";

export const createAddSettingsToGroupList = (plugin: Plugin): addSettingsToGroupList => (group, item) => {
  const echoes = useEchoesStore();
  if (!plugin.core) {
    group.section = "plugins";
  }
  const settings = echoes.getSettings;
  const _group = settings[group.id];

  if (_group.type === "button") {
    return;
  } else {
    _group.items[item.name] = item;
    echoes.updateSettingsGroup(_group);
  }
};