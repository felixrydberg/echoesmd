import { addFileType } from "@echoesmd/plugin-types";
import { App } from "vue";
import { useEchoesStore } from "../../store/echoes";

export const createAddFileType = (app: App): addFileType => (name) => {
  const echoes = useEchoesStore();
  echoes.addFileType(name);
}