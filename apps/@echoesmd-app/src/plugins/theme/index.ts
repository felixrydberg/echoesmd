import { Plugin, SettingsGroup } from "@echoesmd/plugin-types"

const plugin: Plugin = {
  install(helpers) {
    const appearance: SettingsGroup = {
      id: "appearance",
      type: "list",
      title: "Appearance",
      description: "Change how Echoes looks",
      items: {
        theme: {
          name: "Theme",
          type: "select",
          default: "light",
          options: ["light", "dark"],
        },
      },
      section: 'general',
    }

    const resetApplication: SettingsGroup = {
      id: "reset",
      type: "button",
      title: "Reset Application",
      description: "Reset the application to default settings",
      color: "error",
      action: () => {
        console.log("Resetting application");
      },
      section: 'danger-zone',
    }

    helpers.addSettingsGroup(appearance);
    helpers.addSettingsGroup({...appearance, id: "apperance 2", title: "Apperance 2", section: "plugins", items: { testing: { name: "Testing", type: "select", default: "light", options: ["light", "dark"] } }});
    helpers.addSettingsGroup(resetApplication);
  },
  version: "0.0.1",
}

export default plugin;
