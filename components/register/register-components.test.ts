import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OtpInput } from "@/components/register/OtpInput";
import { StepIndicator } from "@/components/register/StepIndicator";

describe("StepIndicator", () => {
  it("has three steps with the current one marked, and an sr-only status for each", () => {
    const html = renderToStaticMarkup(createElement(StepIndicator, { current: 2 }));
    expect(html).toContain("Email");
    expect(html).toContain("Code");
    expect(html).toContain("You’re in");
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html).toContain("Step 1 of 3: ");
    expect(html).toContain("(completed)");
    expect(html).toContain("(current step)");
  });

  it("marks everything complete on success", () => {
    const html = renderToStaticMarkup(createElement(StepIndicator, { current: 4 }));
    expect(html).not.toContain("aria-current");
    expect(html.match(/\(completed\)/g)).toHaveLength(3);
  });
});

describe("OtpInput", () => {
  const render = (props: Partial<Parameters<typeof OtpInput>[0]> = {}) =>
    renderToStaticMarkup(createElement(OtpInput, { id: "code", value: "12", onChange: () => {}, ...props }));

  it("is one real numeric one-time-code input over six decorative boxes", () => {
    const html = render({ describedBy: "code-hint code-alert" });
    expect(html.match(/<input/g)).toHaveLength(1);
    expect(html).toContain('autoComplete="one-time-code"');
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('maxLength="6"');
    expect(html).toContain('aria-describedby="code-hint code-alert"');
    expect(html).toContain('value="12"');
    // boxes are hidden from assistive tech and show the digits typed so far
    const boxes = html.slice(html.indexOf('data-testid="otp-boxes"'), html.indexOf("<input"));
    expect(html).toContain('aria-hidden="true" data-testid="otp-boxes"');
    expect(boxes.match(/<div/g)).toHaveLength(6);
    expect(boxes).toContain(">1<");
    expect(boxes).toContain(">2<");
  });

  it("stays visible but read-only once the code is dead (expired / locked)", () => {
    const html = render({ dead: true, invalid: true, value: "791284" });
    expect(html).toContain('value="791284"');
    expect(html).toContain('readOnly=""');
    expect(html).toContain('aria-invalid="true"');
  });

  it("uses the stronger input border token, not the 1.3:1 card border", () => {
    const html = render();
    expect(html).toContain("border-[var(--border-input)]");
    expect(html).not.toContain("border-[var(--border-color)]");
  });
});
