// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("<Hero />", () => {
  it("renders the tagline with the accent word", () => {
    render(<Hero />);
    expect(screen.getByText(/gentle/i)).toBeInTheDocument();
  });

  it("renders both CTAs", () => {
    render(<Hero />);
    expect(
      screen.getByRole("button", { name: /ask us anything/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /book a tour/i }),
    ).toBeInTheDocument();
  });
});
