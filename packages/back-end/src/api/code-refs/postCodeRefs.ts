import { groupBy, values } from "lodash";
import { PostCodeRefsResponse } from "../../../types/openapi";
import { createApiRequestHandler } from "../../util/handler";
import { postCodeRefsValidator } from "../../validators/openapi";
import {
  getFeatureCodeRefsByFeatures,
  upsertFeatureCodeRefs,
} from "../../models/FeatureCodeRefs";
import { getFeatureProjectsByIds } from "../../models/FeatureModel";

export const postCodeRefs = createApiRequestHandler(postCodeRefsValidator)(
  async (req): Promise<PostCodeRefsResponse> => {
    const { branch, repoName: repo } = req.body;
    const refsByFeature = groupBy(req.body.refs, "flagKey");

    // Ignore read access here so features in unreadable projects are still
    // checked against their own project instead of looking like new keys.
    const featureIds = Object.keys(refsByFeature);
    const featureProjects = await getFeatureProjectsByIds(
      req.context,
      featureIds
    );
    const cannotWriteAll = featureIds.some((featureId) => {
      if (featureProjects.has(featureId)) {
        const project = featureProjects.get(featureId);
        return !req.context.permissions.canUpdateFeature(
          { project },
          { project }
        );
      }
      return !req.context.permissions.canCreateFeature({});
    });
    if (cannotWriteAll) {
      req.context.permissions.throwPermissionError();
    }

    await Promise.all(
      values(refsByFeature).map(async (refs) => {
        await upsertFeatureCodeRefs({
          feature: refs[0].flagKey,
          repo,
          branch,
          codeRefs: refs,
          organization: req.context.org,
        });
      })
    );

    return {
      featuresUpdated: (
        await getFeatureCodeRefsByFeatures({
          repo,
          branch,
          features: featureIds,
          organization: req.context.org,
        })
      ).map((f) => f.feature),
    };
  }
);
