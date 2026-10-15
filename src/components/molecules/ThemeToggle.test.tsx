import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import { usePreferencesStore } from "@/stores/use-preferences-store";

beforeEach(() => {
  usePreferencesStore.setState({ theme: "light" });
});

describe("ThemeToggle", () => {
  it("is an icon-only control with an accessible label", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/dark mode|light mode/i),
    ).not.toBeInTheDocument();
  });

  it("toggles the theme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });
});
