import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders the default element for a variant", () => {
    render(<Text variant="display">Title</Text>);
    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
  });

  it("renders a paragraph for body by default", () => {
    render(<Text variant="body">Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("P");
  });

  it("lets `as` override the element", () => {
    render(
      <Text variant="title" as="h3">
        Section
      </Text>,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Section" }),
    ).toBeInTheDocument();
  });

  it("forwards passthrough attributes like role", () => {
    render(
      <Text variant="small" role="status">
        Loading
      </Text>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
});
