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

  it("surfaces chat CTAs in multiple places, all pointing at /chat", () => {
    render(<Home />);
    const ctas = screen.getAllByRole("link", { name: /ask us anything/i });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/chat");
    }
  });

  it("does not leak tuition figures", () => {
    render(<Home />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/\$\s*\d{2,}/);
  });
});
