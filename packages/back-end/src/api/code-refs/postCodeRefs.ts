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

    // Require write access to every feature being upserted before touching the
    // collection. Code ref flag keys equal feature ids. Resolve the project of
    // each existing feature (regardless of the caller's read access) so a
    // feature in a project the caller can't reach is still checked against
    // that project, not silently treated as a non-existent key.
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
      // Flag key with no matching feature: gate on a global manageFeatures check.
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
