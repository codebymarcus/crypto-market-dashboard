import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectField } from "./SelectField";

const options = [
  { value: "desc", label: "Highest first" },
  { value: "asc", label: "Lowest first" },
] as const;

describe("SelectField", () => {
  it("associates the label with the select via the accessible name", () => {
    render(
      <SelectField
        id="order"
        label="Order"
        value="desc"
        options={options}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Order" })).toHaveValue("desc");
  });

  it("calls onChange with the chosen value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectField
        id="order"
        label="Order"
        value="desc"
        options={options}
        onChange={onChange}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Order" }),
      "asc",
    );

    expect(onChange).toHaveBeenCalledWith("asc");
  });
});
