import { updateFeature } from "../../src/api/features/updateFeature";
import {
  getFeature,
  updateFeature as updateFeatureToDb,
} from "../../src/models/FeatureModel";

jest.mock("../../src/models/FeatureModel", () => ({
  getFeature: jest.fn(),
  updateFeature: jest.fn(),
}));

describe("REST updateFeature publish permission", () => {
  const canPublishFeature = jest.fn();
  const org = { id: "org", settings: { environments: [{ id: "production" }] } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = async (body: Record<string, unknown>): Promise<any> => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await updateFeature(
      {
        params: { id: "feat_1" },
        body,
        query: {},
        organization: org,
        context: {
          org,
          permissions: {
            canUpdateFeature: () => true,
            canPublishFeature,
            throwPermissionError: () => {
              throw new Error("permission denied");
            },
          },
        },
      } as never,
      res as never,
      jest.fn()
    );
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getFeature as jest.Mock).mockResolvedValue({
      id: "feat_1",
      organization: "org",
      project: "proj_a",
      valueType: "boolean",
      defaultValue: "false",
      environmentSettings: {},
    });
    canPublishFeature.mockReturnValue(false);
  });

  it("checks publish permission against the feature's own project", async () => {
    const res = await call({ archived: true });

    expect(canPublishFeature).toHaveBeenCalledWith(
      { project: "proj_a" },
      expect.any(Array)
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "permission denied" });
    expect(updateFeatureToDb).not.toHaveBeenCalled();
  });
});
