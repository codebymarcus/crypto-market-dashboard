import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { useCoins } from "@/features/coins/hooks/use-coins";
import { mockCoins } from "@/features/coins/test/fixtures";

vi.mock("../features/coins/hooks/use-coins", () => ({
  useCoins: vi.fn(),
}));

const mockedUseCoins = vi.mocked(useCoins);

const refetch = vi.fn();

function setupQuery(overrides: Record<string, unknown> = {}) {
  mockedUseCoins.mockReturnValue({
    data: mockCoins,
    error: null,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof useCoins>);
}

beforeEach(() => {
  vi.clearAllMocks();
  setupQuery();
});

describe("Crypto dashboard", () => {
  it("renders the cryptocurrency list", () => {
    render(<App />);

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("Solana")).toBeInTheDocument();
  });

  it("filters coins by name", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search cryptocurrencies",
      }),
      "ethereum",
    );

    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.queryByText("Bitcoin")).not.toBeInTheDocument();
    expect(screen.queryByText("Solana")).not.toBeInTheDocument();
  });

  it("filters coins by symbol regardless of case", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search cryptocurrencies",
      }),
      "BTC",
    );

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.queryByText("Ethereum")).not.toBeInTheDocument();
  });

  it("shows an empty state when no coins match", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search cryptocurrencies",
      }),
      "not-a-coin",
    );

    expect(
      screen.getByText(/no cryptocurrencies match your search/i),
    ).toBeInTheDocument();
  });

  it("sorts by 24-hour change in descending order", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "change",
    );

    const cards = screen.getAllByRole("listitem");
    const names = cards.map(
      (card) => within(card).getByText(/Bitcoin|Ethereum|Solana/).textContent,
    );

    expect(names).toEqual(["Solana", "Bitcoin", "Ethereum"]);
  });

  it("shows a loading state during the initial request", () => {
    setupQuery({
      data: undefined,
      isPending: true,
    });

    render(<App />);

    expect(
      screen.getByText("loading cryptocurrency data..."),
    ).toBeInTheDocument();
  });

  it("shows an error and allows the user to retry", async () => {
    const user = userEvent.setup();

    setupQuery({
      data: undefined,
      error: new Error("Network connection failed."),
      isError: true,
    });

    render(<App />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Network connection failed.",
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(refetch).toHaveBeenCalledOnce();
  });
});
