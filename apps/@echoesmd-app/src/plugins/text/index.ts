import { Plugin } from "@echoesmd/plugin-types"
import editor from "./editor.vue"

const plugin: Plugin = {
  install(helpers) {
    const name = "default-echoes-text-editor";
    helpers.addComponent(name, editor);
    helpers.addFileType(name);
  },
  version: "0.0.1",
}

export default plugin;
