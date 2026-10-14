import { useEffect } from "react";
import { CoinsPage } from "@/features/coins";
import { usePreferencesStore } from "@/stores/use-preferences-store";

export function App() {
  const theme = usePreferencesStore((state) => state.theme);

  // Theme is an app-global concern: apply the persisted preference to <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <CoinsPage />;
}
