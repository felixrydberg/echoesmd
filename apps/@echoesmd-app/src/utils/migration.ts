import { Plugin } from "vue"
import { useEchoesStore } from "../store/echoes";
import Config from '../../../../config.json';

export const useMigration = (): Plugin => {
  return {
    install: async () => {
      const echoes = useEchoesStore();
      const version = localStorage.getItem('version');

      if (!version) {
        // Will only return 1.1  and below stores. Future stores are version locked.
        const oldEchoes = localStorage.getItem('echoes');
        if (oldEchoes) {
          const parsed = JSON.parse(oldEchoes);
          if (parsed.version === Config["version-label"]) {
            return;
          }
          // Wipe all vaults
          const dbs = await indexedDB.databases();
          for (let i = 0; i < dbs.length; i++) {
            const db = dbs[i];
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          }
        
          localStorage.removeItem('echoes');
          echoes.setOptions({
            theme: parsed.theme,
            openVault: parsed.openVault,
            loading: parsed.loading,
            tauri: parsed.tauri,
          });
        };

      } else {
        // Handle specific version migrations here
        switch (version) {
          default:
            break;
        }
      }
      localStorage.setItem('version', Config["version"]);
    }
  };
};
