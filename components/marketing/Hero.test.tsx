// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("<Hero />", () => {
  it("renders the tagline with the accent word", () => {
    render(<Hero />);
    expect(screen.getByText(/gentle/i)).toBeInTheDocument();
  });

  it("renders the eyebrow", () => {
    render(<Hero />);
    expect(screen.getByText(/family day school/i)).toBeInTheDocument();
  });
});
