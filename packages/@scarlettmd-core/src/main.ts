import { createApp } from "vue";
import App from "./App.vue";
import '@/style.css';
import { plugin } from "@/index";
import { createScalettInstance } from "@/instance";

const app = createApp(App);
const instance = createScalettInstance();
app.use(plugin);
app.use(instance);
app.mount("#app");
