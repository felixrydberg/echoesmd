import { addComponent } from "@echoesmd/plugin-types";
import { App } from "vue";

export const createAddComponent = (app: App): addComponent => (name, component) => {
  if (app._context.components[name]) {
    console.warn(`Component ${name} already exists, skipping`);
    return
  }
  app.component(name, component);
}