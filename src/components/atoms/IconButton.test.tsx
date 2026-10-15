import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

function Icon() {
  return <svg aria-hidden="true" focusable="false" />;
}

describe("IconButton", () => {
  it("exposes its label as the accessible name", () => {
    render(
      <IconButton label="Refresh" onClick={() => {}}>
        <Icon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("fires onClick when idle", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Refresh" onClick={onClick}>
        <Icon />
      </IconButton>,
    );

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not fire onClick while busy", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Refresh" busy onClick={onClick}>
        <Icon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Refresh" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
