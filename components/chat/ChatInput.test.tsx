// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "./ChatInput";

describe("<ChatInput />", () => {
  it("submits the trimmed value and clears the input", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "  how are tuition fees set?  " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSend).toHaveBeenCalledWith("how are tuition fees set?");
    expect(input.value).toBe("");
  });

  it("ignores submits when the value is blank", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText(/message/i);
    fireEvent.submit(input.closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables the send button while streaming", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });
});
