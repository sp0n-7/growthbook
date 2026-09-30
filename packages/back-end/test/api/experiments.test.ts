import { updateExperiment } from "../../src/api/experiments/updateExperiment";
import {
  getExperimentById,
  updateExperiment as updateExperimentToDb,
} from "../../src/models/ExperimentModel";
import { getDataSourceById } from "../../src/models/DataSourceModel";

jest.mock("../../src/models/ExperimentModel", () => ({
  getExperimentById: jest.fn(),
  getExperimentByTrackingKey: jest.fn(),
  updateExperiment: jest.fn(),
}));

jest.mock("../../src/models/DataSourceModel", () => ({
  getDataSourceById: jest.fn(),
}));

// Import cycles: a lazy Proxy defers requireActual to first property access.
jest.mock("../../src/services/experiments", () => {
  const overrides: Record<string, unknown> = {
    toExperimentApiInterface: async (_ctx: unknown, exp: unknown) => exp,
  };
  return new Proxy(
    {},
    {
      get: (_t, prop: string) =>
        prop in overrides
          ? overrides[prop]
          : jest.requireActual("../../src/services/experiments")[prop],
    }
  );
});

describe("REST updateExperiment run-experiments permission", () => {
  // An experiment that reaches every environment (visual changesets), and a
  // caller who may update the experiment's analysis but may not run it.
  const experiment = {
    id: "exp_123",
    organization: "org",
    project: "proj_1",
    datasource: "ds_1",
    name: "Experiment",
    hasVisualChangesets: true,
    linkedFeatures: [],
    variations: [],
    phases: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = async (body: Record<string, unknown>): Promise<any> => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await updateExperiment(
      {
        params: { id: "exp_123" },
        query: {},
        body,
        context: {
          org: { id: "org" },
          permissions: {
            canUpdateExperiment: () => true,
            canRunExperiment: () => false,
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
    (getExperimentById as jest.Mock).mockResolvedValue(experiment);
    (getDataSourceById as jest.Mock).mockResolvedValue({ settings: {} });
    (updateExperimentToDb as jest.Mock).mockImplementation(
      async ({ experiment: exp, changes }) => ({ ...exp, ...changes })
    );
  });

  it("refuses a phases change without run permission", async () => {
    const res = await call({
      phases: [{ name: "Main", dateStarted: "2026-02-01T00:00:00.000Z" }],
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "permission denied" });
    expect(updateExperimentToDb).not.toHaveBeenCalled();
  });

  it("refuses a bucketing change without run permission", async () => {
    const res = await call({ hashAttribute: "device_id" });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(updateExperimentToDb).not.toHaveBeenCalled();
  });

  it("allows an analysis-only change without run permission", async () => {
    const res = await call({ description: "Updated description" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(updateExperimentToDb).toHaveBeenCalled();
  });
});
