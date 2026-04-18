// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("landing page", () => {
  it("renders the wordmark and hero tagline", () => {
    render(<Home />);
    expect(screen.getAllByText(/Slow Cooker/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/gentle/i)).toBeInTheDocument();
  });

  it("does not leak tuition figures", () => {
    render(<Home />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/\$\s*\d{2,}/);
  });
});
