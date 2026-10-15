import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBox } from "./SearchBox";

describe("SearchBox", () => {
  it("exposes an accessible searchbox tied to its label", () => {
    render(
      <SearchBox
        id="coin-search"
        label="Search cryptocurrencies"
        value=""
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
    ).toBeInTheDocument();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SearchBox
        id="coin-search"
        label="Search cryptocurrencies"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole("searchbox"), "b");

    expect(onChange).toHaveBeenCalledWith("b");
  });
});
