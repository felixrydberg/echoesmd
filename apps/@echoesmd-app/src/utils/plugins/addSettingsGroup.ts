import { SettingsGroup, Plugin } from "@echoesmd/plugin-types";
import { useEchoesStore } from "../../store/echoes";

export const createAddSettingsGroup = (plugin: Plugin) => (group: SettingsGroup) => {
  const echoes = useEchoesStore();
  if (!plugin.core) {
    group.section = "plugins";
  }
  echoes.updateSettingsGroup(group);
};