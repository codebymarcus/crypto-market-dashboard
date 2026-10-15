import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { useCoins } from "@/features/coins/hooks/use-coins";
import { useCoinSearch } from "@/features/coins/hooks/use-coin-search";
import { mockCoins } from "@/features/coins/test/fixtures";

vi.mock("@/features/coins/hooks/use-coins", () => ({
  useCoins: vi.fn(),
}));

vi.mock("@/features/coins/hooks/use-coin-search", () => ({
  useCoinSearch: vi.fn(),
}));

vi.mock("@/features/coins/hooks/use-debounced-value", () => ({
  useDebouncedValue: (value: unknown) => value,
}));

const mockedUseCoins = vi.mocked(useCoins);
const mockedUseCoinSearch = vi.mocked(useCoinSearch);

const refetch = vi.fn();

function setupBrowse(overrides: Record<string, unknown> = {}) {
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

function setupSearch() {
  // Simulate server-side search over the fixture.
  mockedUseCoinSearch.mockImplementation((query: string) => {
    const q = query.trim().toLowerCase();
    const coins = q
      ? mockCoins.filter(
          (coin) =>
            coin.name.toLowerCase().includes(q) ||
            coin.symbol.toLowerCase().includes(q),
        )
      : [];
    return {
      coins,
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupBrowse();
  setupSearch();
});

describe("Crypto dashboard", () => {
  it("renders the cryptocurrency list", () => {
    render(<App />);
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("Solana")).toBeInTheDocument();
  });

  it("searches coins by name via the API", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
      "ethereum",
    );

    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.queryByText("Bitcoin")).not.toBeInTheDocument();
    expect(screen.queryByText("Solana")).not.toBeInTheDocument();
  });

  it("searches coins by symbol regardless of case", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
      "BTC",
    );

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.queryByText("Ethereum")).not.toBeInTheDocument();
  });

  it("shows an empty state when no coins match the search", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
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

  it("shows the pager in browse mode and hides it while searching", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("navigation", { name: "Coin list pagination" }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
      "bitcoin",
    );

    expect(
      screen.queryByRole("navigation", { name: "Coin list pagination" }),
    ).not.toBeInTheDocument();
  });

  it("shows a loading affordance while a search is in flight", async () => {
    const user = userEvent.setup();
    mockedUseCoinSearch.mockImplementation(() => ({
      coins: [],
      isPending: false,
      isError: false,
      error: null,
      isFetching: true,
      refetch: vi.fn(),
    }));

    render(<App />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
      "bit",
    );

    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });

  it("shows a loading state during the initial request", () => {
    setupBrowse({ data: undefined, isPending: true });
    render(<App />);
    expect(
      screen.getByText("loading cryptocurrency data..."),
    ).toBeInTheDocument();
  });

  it("refreshes market data from the controls row", async () => {
    const user = userEvent.setup();
    render(<App />);

    const controls = screen.getByRole("region", { name: "Coin filters" });
    await user.click(
      within(controls).getByRole("button", { name: "Refresh" }),
    );

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("shows an error and allows the user to retry", async () => {
    const user = userEvent.setup();
    setupBrowse({
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
