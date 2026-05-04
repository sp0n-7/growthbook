import { GetFeatureRevisionsResponse } from "../../../types/openapi";
import { getFeature as getFeatureDB } from "../../models/FeatureModel";
import {
  countDocuments,
  getFeatureRevisionsByStatus,
} from "../../models/FeatureRevisionModel";
import { toApiFeatureRevisionInterface } from "../../services/features";
import { createApiRequestHandler } from "../../util/handler";
import { getFeatureRevisionsValidator } from "../../validators/openapi";

export const getFeatureRevisions = createApiRequestHandler(
  getFeatureRevisionsValidator
)(
  async (req): Promise<GetFeatureRevisionsResponse> => {
    const feature = await getFeatureDB(req.context, req.params.id);
    if (!feature) {
      throw new Error("Could not find a feature with that key");
    }

    const limit = req.query.limit ?? 10;
    const offset = req.query.offset ?? 0;

    const revisions = await getFeatureRevisionsByStatus({
      organization: req.organization.id,
      featureId: feature.id,
      status: req.query.status,
      limit,
      offset,
      sort: "desc",
    });

    const total = await countDocuments(req.organization.id, feature.id);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < total;

    return {
      revisions: revisions.map(toApiFeatureRevisionInterface),
      limit,
      offset,
      count: revisions.length,
      total,
      hasMore,
      nextOffset: hasMore ? nextOffset : null,
    };
  }
);
