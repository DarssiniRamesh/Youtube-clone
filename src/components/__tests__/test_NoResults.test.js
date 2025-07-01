import React from "react";
import { render, screen } from "@testing-library/react";
import NoResults from "../NoResults";

describe("NoResults fallback/empty-state UI", () => {
  it("renders with title and text", () => {
    render(<NoResults title="Nothing Found" text="Please try again." />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Nothing Found");
    expect(screen.getByText("Please try again.")).toBeInTheDocument();
    expect(screen.getByAltText(/no results/i)).toBeInTheDocument();
  });

  it("renders with empty props", () => {
    render(<NoResults />);
    // Should render at least the image; h2 and p might be empty or missing.
    expect(screen.getByAltText(/no results/i)).toBeInTheDocument();
  });
});
