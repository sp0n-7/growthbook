import { ListFeatureRevisionsResponse } from "../../../types/openapi";
import { getFeature as getFeatureDB } from "../../models/FeatureModel";
import { getRevisions } from "../../models/FeatureRevisionModel";
import { toApiFeatureRevisionInterface } from "../../services/features";
import { applyPagination, createApiRequestHandler } from "../../util/handler";
import { listFeatureRevisionsValidator } from "../../validators/openapi";

export const listFeatureRevisions = createApiRequestHandler(
  listFeatureRevisionsValidator
)(
  async (req): Promise<ListFeatureRevisionsResponse> => {
    const feature = await getFeatureDB(req.context, req.params.id);
    if (!feature) {
      throw new Error("Could not find a feature with that key");
    }

    const all = await getRevisions(req.organization.id, feature.id);
    const filtered = req.query.status
      ? all.filter((r) => r.status === req.query.status)
      : all;

    const { filtered: paged, returnFields } = applyPagination(
      filtered,
      req.query
    );

    return {
      revisions: paged.map(toApiFeatureRevisionInterface),
      ...returnFields,
    };
  }
);
