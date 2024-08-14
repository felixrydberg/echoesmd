import { Plugin } from "vue"
import { Plugins } from "../../plugins/index";

import { createAddComponent } from "./addComponent";
import { createAddFileType } from "./addFileType";
import { useEchoesStore } from "../../store/echoes";
import { createAddSettingsGroup } from "./addSettingsGroup";
import { createAddSettingsToGroupList } from "./addSettingsToGroupList";
import { getInstalledPlugins } from "./getInstalledPlugins";

export const usePlugins = (): Plugin => {
  return {
    install: (app) => {
      const echoes = useEchoesStore();
      echoes.resetFileTypes();
      Plugins.map(plugin => plugin.core = true);
      Plugins.push(...getInstalledPlugins());

      for (const key in Plugins) {
        const plugin = Plugins[key];
        const addComponent = createAddComponent(app);
        const addFileType = createAddFileType(app);
  
        const addSettingsGroup = createAddSettingsGroup(plugin);
        const addSettingsToGroupList = createAddSettingsToGroupList(plugin);
        plugin.install({
          addComponent,
          addSettingsGroup,
          addSettingsToGroupList,
          addFileType,
        });
      }

    }
  };
};
