import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "price", label: "Current price" },
  { value: "change", label: "24h change" },
] as const;

describe("Select", () => {
  it("renders the options and reflects the current value", () => {
    render(
      <Select id="sort" value="change" options={options} onChange={() => {}} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("change");
    expect(
      screen.getByRole("option", { name: "Current price" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "24h change" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with the selected value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select id="sort" value="price" options={options} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "change");

    expect(onChange).toHaveBeenCalledWith("change");
  });
});
