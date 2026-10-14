import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CoinPager } from "./CoinPager";

describe("CoinPager", () => {
  it("shows the current page number", () => {
    render(<CoinPager page={3} hasPrevious hasNext onPageChange={vi.fn()} />);
    expect(screen.getByText("Page 3")).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    render(
      <CoinPager
        page={1}
        hasPrevious={false}
        hasNext
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("disables Next on the last page", () => {
    render(
      <CoinPager
        page={5}
        hasPrevious
        hasNext={false}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("requests the next and previous pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <CoinPager page={2} hasPrevious hasNext onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Previous page" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });
});
