import { usePreferencesStore } from "@/stores/use-preferences-store";
import styles from "./ThemeToggle.module.scss";

export function ThemeToggle() {
  const theme = usePreferencesStore((state) => state.theme);

  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
      <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
