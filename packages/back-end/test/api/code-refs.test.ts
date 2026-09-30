import { postCodeRefs } from "../../src/api/code-refs/postCodeRefs";
import { getFeatureProjectsByIds } from "../../src/models/FeatureModel";
import {
  getFeatureCodeRefsByFeatures,
  upsertFeatureCodeRefs,
} from "../../src/models/FeatureCodeRefs";

jest.mock("../../src/models/FeatureModel", () => ({
  getFeatureProjectsByIds: jest.fn(),
}));

jest.mock("../../src/models/FeatureCodeRefs", () => ({
  getFeatureCodeRefsByFeatures: jest.fn(),
  upsertFeatureCodeRefs: jest.fn(),
}));

describe("REST postCodeRefs permissions", () => {
  // Caller may write features in proj_a only, and has no global access.
  const canUpdateFeature = jest.fn(
    (existing: { project?: string }) => existing.project === "proj_a"
  );
  const canCreateFeature = jest.fn(() => false);

  const ref = (flagKey: string) => ({
    filePath: "src/index.ts",
    startingLineNumber: 1,
    lines: "gb.isOn()",
    flagKey,
    contentHash: "abc",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = async (flagKeys: string[]): Promise<any> => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await postCodeRefs(
      {
        params: {},
        query: {},
        body: {
          branch: "main",
          repoName: "org/repo",
          refs: flagKeys.map(ref),
        },
        context: {
          org: { id: "org" },
          permissions: {
            canUpdateFeature,
            canCreateFeature,
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
    (getFeatureProjectsByIds as jest.Mock).mockResolvedValue(
      new Map([
        ["feat_a", "proj_a"],
        ["feat_b", "proj_b"],
      ])
    );
    (getFeatureCodeRefsByFeatures as jest.Mock).mockResolvedValue([]);
  });

  it("upserts refs for features the caller can write", async () => {
    const res = await call(["feat_a"]);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(upsertFeatureCodeRefs).toHaveBeenCalledTimes(1);
  });

  it("refuses the whole request if any feature is in an unwritable project", async () => {
    const res = await call(["feat_a", "feat_b"]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "permission denied" });
    expect(upsertFeatureCodeRefs).not.toHaveBeenCalled();
  });

  it("gates flag keys with no matching feature on global access", async () => {
    const res = await call(["feat_a", "unknown_flag"]);

    expect(canCreateFeature).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(upsertFeatureCodeRefs).not.toHaveBeenCalled();
  });
});
