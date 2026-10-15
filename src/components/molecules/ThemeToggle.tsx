import { usePreferencesStore } from "@/stores/use-preferences-store";
import { IconButton } from "@/components/atoms/IconButton";
import { MoonIcon } from "@/components/atoms/icons/MoonIcon";
import { SunIcon } from "@/components/atoms/icons/SunIcon";

export function ThemeToggle() {
  const theme = usePreferencesStore((state) => state.theme);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <IconButton label={`Switch to ${nextTheme} mode`} onClick={toggleTheme}>
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
}
