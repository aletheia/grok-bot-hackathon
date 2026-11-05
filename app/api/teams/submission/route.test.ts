import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PUT } from "./route";

const mockRequireSessionUser = vi.fn();
const mockGet = vi.fn();
const mockSave = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireSessionUser: (...args: unknown[]) => mockRequireSessionUser(...args),
}));
vi.mock("@/lib/submissions/service", () => ({
  getMyTeamSubmission: (...args: unknown[]) => mockGet(...args),
  saveMyTeamSubmission: (...args: unknown[]) => mockSave(...args),
}));

const URL_ = "http://localhost/api/teams/submission";
const put = (body: unknown) =>
  new Request(URL_, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("/api/teams/submission", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET returns 401 without a session and never reads the submission", async () => {
    const { AppError } = await import("@/lib/api/http");
    mockRequireSessionUser.mockRejectedValue(new AppError(401, "UNAUTHORIZED", "Sign in first."));
    const res = await GET(new Request(URL_) as never);
    expect(res.status).toBe(401);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("GET returns the member's submission", async () => {
    const actor = { id: "u1", teamId: 3 };
    mockRequireSessionUser.mockResolvedValue(actor);
    mockGet.mockResolvedValue({ team: { id: 3, name: "T" }, submission: null });
    const res = await GET(new Request(URL_) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.team.name).toBe("T");
    expect(mockGet).toHaveBeenCalledWith(actor);
  });

  it("PUT passes only the repo and video fields to the service", async () => {
    const actor = { id: "u1", teamId: 3 };
    mockRequireSessionUser.mockResolvedValue(actor);
    mockSave.mockResolvedValue({ ok: true });
    const res = await PUT(put({ githubUrl: "https://github.com/a/b", videoUrl: "", teamId: 99, name: "x" }) as never);
    expect(res.status).toBe(200);
    expect(mockSave).toHaveBeenCalledWith(actor, { githubUrl: "https://github.com/a/b", videoUrl: "" });
  });

  it("PUT surfaces service errors (closed / not public)", async () => {
    const { AppError } = await import("@/lib/api/http");
    mockRequireSessionUser.mockResolvedValue({ id: "u1", teamId: 3 });
    mockSave.mockRejectedValue(new AppError(422, "REPO_NOT_PUBLIC", "This repo isn't public yet."));
    const res = await PUT(put({ githubUrl: "https://github.com/a/b" }) as never);
    const data = await res.json();
    expect(res.status).toBe(422);
    expect(data.error.code).toBe("REPO_NOT_PUBLIC");
  });

  it("PUT returns 401 without a session", async () => {
    const { AppError } = await import("@/lib/api/http");
    mockRequireSessionUser.mockRejectedValue(new AppError(401, "UNAUTHORIZED", "Sign in first."));
    const res = await PUT(put({ githubUrl: "https://github.com/a/b" }) as never);
    expect(res.status).toBe(401);
    expect(mockSave).not.toHaveBeenCalled();
  });
});
