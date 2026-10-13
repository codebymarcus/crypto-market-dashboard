import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

type PreferenceState = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const usePreferencesStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "crypto-dashboard-preferences",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
