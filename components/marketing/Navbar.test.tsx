// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("<Navbar />", () => {
  it("links the wordmark back to home", () => {
    render(<Navbar />);
    const wordmark = screen.getByRole("link", { name: /slow cooker/i });
    expect(wordmark).toHaveAttribute("href", "/");
  });

  it("exposes the operator dashboard via an Admin link", () => {
    render(<Navbar />);
    const admin = screen.getByRole("link", { name: /^admin$/i });
    expect(admin).toHaveAttribute("href", "/admin");
  });

  it("exposes the chat CTA pointing at /chat", () => {
    render(<Navbar />);
    const cta = screen.getByRole("link", { name: /ask us anything/i });
    expect(cta).toHaveAttribute("href", "/chat");
  });
});
