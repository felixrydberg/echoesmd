import { createApp } from "vue";
import App from "./App.vue";
import '@/style.css';
import { ScarlettCorePlugin } from "@/index";
const app = createApp(App);

app.use(ScarlettCorePlugin);
app.mount("#app");
