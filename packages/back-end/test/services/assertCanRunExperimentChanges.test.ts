import { ExperimentInterface } from "../../types/experiment";
import { ReqContext } from "../../types/organization";
import { assertCanRunExperimentChanges } from "../../src/services/experiments";

const experiment = (over: Partial<ExperimentInterface> = {}) =>
  ({
    id: "exp_1",
    project: "proj_1",
    linkedFeatures: [],
    hasVisualChangesets: true,
    hasURLRedirects: false,
    ...over,
  } as ExperimentInterface);

const canRunExperiment = jest.fn();
const throwPermissionError = jest.fn(() => {
  throw new Error("permission denied");
});

const context = ({
  org: { id: "org_1" },
  permissions: { canRunExperiment, throwPermissionError },
} as unknown) as ReqContext;

describe("assertCanRunExperimentChanges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    canRunExperiment.mockReturnValue(false);
  });

  it("skips the check for changes that never reach a payload", () => {
    assertCanRunExperimentChanges(context, experiment(), {
      description: "new text",
    });
    expect(canRunExperiment).not.toHaveBeenCalled();
  });

  it("checks bucketing fields, which do reach the payload", () => {
    expect(() =>
      assertCanRunExperimentChanges(context, experiment(), {
        hashAttribute: "device_id",
      })
    ).toThrow("permission denied");
    expect(canRunExperiment).toHaveBeenCalledWith({ project: "proj_1" }, [
      "__ALL__",
    ]);
  });

  it("checks both the current and the new project on a move", () => {
    canRunExperiment.mockImplementation(({ project }) => project === "proj_1");
    expect(() =>
      assertCanRunExperimentChanges(context, experiment(), {
        project: "proj_2",
      })
    ).toThrow("permission denied");
    expect(canRunExperiment).toHaveBeenCalledWith({ project: "proj_2" }, [
      "__ALL__",
    ]);
  });

  it("skips the check when the experiment affects no environment", () => {
    assertCanRunExperimentChanges(
      context,
      experiment({ hasVisualChangesets: false }),
      { status: "running" }
    );
    expect(canRunExperiment).not.toHaveBeenCalled();
  });
});
