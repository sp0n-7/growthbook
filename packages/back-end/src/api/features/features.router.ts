import { Router } from "express";
import { listFeatures } from "./listFeatures";
import { toggleFeature } from "./toggleFeature";
import { getFeature } from "./getFeature";
import { postFeature } from "./postFeature";
import { updateFeature } from "./updateFeature";
import { listFeatureRevisions } from "./listFeatureRevisions";
import { getFeatureRevision } from "./getFeatureRevision";

const router = Router();

// Feature Endpoints
// Mounted at /api/v1/features
router.get("/", listFeatures);
router.post("/", postFeature);
// Revisions must be registered before "/:id" so the param doesn't swallow them
router.get("/:id/revisions", listFeatureRevisions);
router.get("/:id/revisions/:version", getFeatureRevision);
router.get("/:id", getFeature);
router.post("/:id", updateFeature);
router.post("/:id/toggle", toggleFeature);

export default router;
