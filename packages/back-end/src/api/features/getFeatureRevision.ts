import { GetFeatureRevisionResponse } from "../../../types/openapi";
import { getFeature as getFeatureDB } from "../../models/FeatureModel";
import { getRevision } from "../../models/FeatureRevisionModel";
import { toApiFeatureRevisionInterface } from "../../services/features";
import { createApiRequestHandler } from "../../util/handler";
import { getFeatureRevisionValidator } from "../../validators/openapi";

export const getFeatureRevision = createApiRequestHandler(
  getFeatureRevisionValidator
)(
  async (req): Promise<GetFeatureRevisionResponse> => {
    const feature = await getFeatureDB(req.context, req.params.id);
    if (!feature) {
      throw new Error("Could not find a feature with that key");
    }

    const revision = await getRevision(
      req.organization.id,
      feature.id,
      req.params.version
    );
    if (!revision) {
      throw new Error("Could not find a revision with that version");
    }

    return {
      revision: toApiFeatureRevisionInterface(revision),
    };
  }
);
