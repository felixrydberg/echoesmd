import { createApp } from "vue";
import App from "./App.vue";
import { ScarlettCorePlugin } from "@scarlettmd/core";

const app = createApp(App);
app.use(ScarlettCorePlugin);
app.mount("#app");
