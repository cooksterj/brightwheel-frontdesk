// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("landing page", () => {
  it("renders the wordmark, hero tagline, and ask-anything pitch", () => {
    render(<Home />);
    expect(screen.getAllByText(/Sunnybrook/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/gentle/i)).toBeInTheDocument();
    expect(screen.getByText(/every real question/i)).toBeInTheDocument();
  });

  it("surfaces ask-anything CTAs in multiple places", () => {
    render(<Home />);
    const ctas = screen.getAllByRole("button", {
      name: /ask us anything/i,
    });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
  });

  it("does not leak tuition figures on the landing", () => {
    render(<Home />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/\$\s*\d{2,}/);
  });
});
