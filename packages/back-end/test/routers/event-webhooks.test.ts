import { testWebHookParams } from "../../src/routers/event-webhooks/event-webhooks.controller";
import { getContextFromReq } from "../../src/services/organizations";
import { cancellableFetch } from "../../src/util/http.util";

jest.mock("../../src/services/organizations", () => ({
  getContextFromReq: jest.fn(),
}));

jest.mock("../../src/util/http.util", () => ({
  cancellableFetch: jest.fn(),
}));

describe("testWebHookParams", () => {
  const req = {
    body: { name: "hook", method: "POST", url: "https://example.com/hook" },
  };
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  const mockContext = (canCreate: boolean) =>
    (getContextFromReq as jest.Mock).mockReturnValue({
      permissions: {
        canCreateEventWebhook: () => canCreate,
        throwPermissionError: () => {
          throw new Error("You do not have permission");
        },
      },
    });

  beforeEach(() => jest.clearAllMocks());

  it("rejects callers without event webhook create permission before fetching", async () => {
    mockContext(false);

    await expect(testWebHookParams(req as never, res as never)).rejects.toThrow(
      "You do not have permission"
    );
    expect(cancellableFetch).not.toHaveBeenCalled();
  });

  it("sends the test request through cancellableFetch with limits", async () => {
    mockContext(true);
    (cancellableFetch as jest.Mock).mockResolvedValue({
      responseWithoutBody: { ok: true },
      stringBody: "",
    });

    await testWebHookParams(req as never, res as never);

    expect(cancellableFetch).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({ method: "POST" }),
      { maxTimeMs: 30000, maxContentSize: 1000 }
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
