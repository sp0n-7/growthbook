import { ListDimensionsResponse } from "../../../types/openapi";
import {
  findDimensionsByOrganization,
  toDimensionApiInterface,
} from "../../models/DimensionModel";
import { getDataSourcesByOrganization } from "../../models/DataSourceModel";
import {
  applyFilter,
  applyPagination,
  createApiRequestHandler,
} from "../../util/handler";
import { listDimensionsValidator } from "../../validators/openapi";

export const listDimensions = createApiRequestHandler(listDimensionsValidator)(
  async (req): Promise<ListDimensionsResponse> => {
    const dimensions = await findDimensionsByOrganization(req.organization.id);

    // A dimension inherits project access from its datasource, so drop any whose
    // datasource is inaccessible or no longer exists.
    const readableDatasourceIds = new Set(
      (await getDataSourcesByOrganization(req.context)).map((ds) => ds.id)
    );

    // TODO: Move sorting/limiting to the database query for better performance
    const { filtered, returnFields } = applyPagination(
      dimensions
        .filter((dimension) => readableDatasourceIds.has(dimension.datasource))
        .filter((dimension) =>
          applyFilter(req.query.datasourceId, dimension.datasource)
        )
        .sort((a, b) => a.id.localeCompare(b.id)),
      req.query
    );

    return {
      dimensions: filtered.map((dimension) =>
        toDimensionApiInterface(dimension)
      ),
      ...returnFields,
    };
  }
);
