// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Message } from "./Message";

describe("<Message />", () => {
  it("renders user content right-aligned", () => {
    render(
      <Message
        message={{ id: "1", role: "user", content: "when is breakfast?" }}
      />,
    );
    expect(screen.getByText(/when is breakfast/i)).toBeInTheDocument();
  });

  it("renders assistant content", () => {
    render(
      <Message
        message={{ id: "2", role: "assistant", content: "At 8:00 a.m." }}
      />,
    );
    expect(screen.getByText(/8:00 a\.m\./i)).toBeInTheDocument();
  });

  it("renders typing dots for an empty assistant message", () => {
    const { container } = render(
      <Message message={{ id: "3", role: "assistant", content: "" }} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });
});
