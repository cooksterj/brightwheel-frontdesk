// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatCTA } from "./ChatCTA";

describe("<ChatCTA />", () => {
  it("links to /chat", () => {
    render(<ChatCTA />);
    const link = screen.getByRole("link", { name: /ask us anything/i });
    expect(link).toHaveAttribute("href", "/chat");
  });

  it("accepts a custom label", () => {
    render(<ChatCTA>Start the conversation</ChatCTA>);
    expect(
      screen.getByRole("link", { name: /start the conversation/i }),
    ).toBeInTheDocument();
  });
});
