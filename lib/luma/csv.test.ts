import { describe, expect, it } from "vitest";
import { mapHeaders, parseCsv, parseLumaGuestCsv } from "@/lib/luma/csv";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, embedded commas/newlines, CRLF and BOM", () => {
    const rows = parseCsv('\uFEFFa,b,c\r\n"x, y","he said ""hi""","line1\nline2"\r\n\r\n');
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["x, y", 'he said "hi"', "line1\nline2"],
    ]);
  });
});

describe("mapHeaders", () => {
  it("accepts header variants case-insensitively", () => {
    expect(mapHeaders(["Name", "E-mail", "Approval Status", "Created At"])).toEqual({
      name: 0,
      email: 1,
      status: 2,
      registeredAt: 3,
    });
    expect(mapHeaders(["first_name", "last_name", "EMAIL", "approval_status"])).toMatchObject({
      firstName: 0,
      lastName: 1,
      email: 2,
      status: 3,
    });
  });
});

describe("parseLumaGuestCsv", () => {
  it("parses a Luma export, normalising emails and statuses", () => {
    const csv = [
      "api_id,name,first_name,last_name,email,approval_status,created_at",
      'gst-1,"Ada Lovelace",Ada,Lovelace,  Ada@Example.COM ,Approved,2026-09-01T10:00:00.000Z',
      "gst-2,,Alan,Turing,alan@example.com,waitlist,2026-09-02T10:00:00.000Z",
      "gst-3,No Email,,,,approved,",
      "gst-4,Bad,,,not-an-email,approved,",
      "gst-5,Ada again,,,ada@example.com,approved,2026-09-03T10:00:00.000Z",
    ].join("\n");

    const result = parseLumaGuestCsv(csv);
    expect(result.totalRows).toBe(5);
    expect(result.skippedRows).toEqual([4, 5]);
    expect(result.duplicateEmails).toEqual(["ada@example.com"]);
    expect(result.guests).toEqual([
      {
        email: "ada@example.com",
        name: "Ada again",
        lumaStatus: "approved",
        lumaRegisteredAt: new Date("2026-09-03T10:00:00.000Z"),
      },
      {
        email: "alan@example.com",
        name: "Alan Turing",
        lumaStatus: "waitlist",
        lumaRegisteredAt: new Date("2026-09-02T10:00:00.000Z"),
      },
    ]);
  });

  it("works with only an email column", () => {
    expect(parseLumaGuestCsv("Email\nx@y.it\n").guests).toEqual([
      { email: "x@y.it", name: null, lumaStatus: null, lumaRegisteredAt: null },
    ]);
  });

  it("rejects files without an email column", () => {
    expect(() => parseLumaGuestCsv("name,status\nA,approved")).toThrow(/email column/);
    expect(() => parseLumaGuestCsv("")).toThrow(/empty/);
  });
});
