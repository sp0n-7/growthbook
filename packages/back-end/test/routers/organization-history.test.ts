import { getHistory } from "../../src/routers/organizations/organizations.controller";
import { getContextFromReq } from "../../src/services/organizations";
import {
  findAuditByEntity,
  findAuditByEntityParent,
} from "../../src/models/AuditModel";

jest.mock("../../src/services/organizations", () => ({
  getContextFromReq: jest.fn(),
}));

jest.mock("../../src/models/AuditModel", () => ({
  findAuditByEntity: jest.fn(),
  findAuditByEntityParent: jest.fn(),
}));

describe("getHistory", () => {
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };

  const mockContext = (canManageTeam: boolean) =>
    (getContextFromReq as jest.Mock).mockReturnValue({
      org: { id: "org_1" },
      permissions: {
        canManageTeam: () => canManageTeam,
        throwPermissionError: () => {
          throw new Error("You do not have permission");
        },
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    (findAuditByEntity as jest.Mock).mockResolvedValue([]);
    (findAuditByEntityParent as jest.Mock).mockResolvedValue([]);
  });

  it("rejects organization history for users who cannot manage the team", async () => {
    mockContext(false);
    const req = { params: { type: "organization", id: "org_1" } };

    await expect(getHistory(req as never, res as never)).rejects.toThrow(
      "You do not have permission"
    );
    expect(findAuditByEntity).not.toHaveBeenCalled();
  });

  it("returns organization history for team managers", async () => {
    mockContext(true);
    const req = { params: { type: "organization", id: "org_1" } };

    await getHistory(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not gate other entity types on team management", async () => {
    mockContext(false);
    const req = { params: { type: "feature", id: "feat_1" } };

    await getHistory(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
