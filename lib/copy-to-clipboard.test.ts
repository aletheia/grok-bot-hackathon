import { describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

describe("copyToClipboard", () => {
  it("copies with the Clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const legacyCopy = vi.fn();
    expect(await copyToClipboard("ABC123", { writeText, legacyCopy })).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("ABC123");
    expect(legacyCopy).not.toHaveBeenCalled();
  });

  it("falls back to the legacy copy when the Clipboard API rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const legacyCopy = vi.fn().mockReturnValue(true);
    expect(await copyToClipboard("ABC123", { writeText, legacyCopy })).toBe("copied");
    expect(legacyCopy).toHaveBeenCalledWith("ABC123");
  });

  it("reports failed (and does not throw) when every path fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    expect(await copyToClipboard("x", { writeText, legacyCopy: () => false })).toBe("failed");
    expect(await copyToClipboard("x", { writeText, legacyCopy: () => { throw new Error("no"); } })).toBe("failed");
    expect(await copyToClipboard("x", {})).toBe("failed");
  });
});
