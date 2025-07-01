import React from "react";
import { render, screen } from "@testing-library/react";
import NotFound from "../NotFound";

describe("NotFound UI fallback component", () => {
  it("renders the correct fallback message", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/removed or moved/i)
    ).toBeInTheDocument();
  });
});
