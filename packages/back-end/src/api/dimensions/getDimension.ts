import { GetDimensionResponse } from "../../../types/openapi";
import {
  findDimensionById,
  hasDimensionDatasourceAccess,
  toDimensionApiInterface,
} from "../../models/DimensionModel";
import { createApiRequestHandler } from "../../util/handler";
import { getDimensionValidator } from "../../validators/openapi";

export const getDimension = createApiRequestHandler(getDimensionValidator)(
  async (req): Promise<GetDimensionResponse> => {
    const dimension = await findDimensionById(
      req.params.id,
      req.organization.id
    );
    if (
      !dimension ||
      !(await hasDimensionDatasourceAccess(req.context, dimension))
    ) {
      throw new Error("Could not find dimension with that id");
    }

    return {
      dimension: toDimensionApiInterface(dimension),
    };
  }
);
