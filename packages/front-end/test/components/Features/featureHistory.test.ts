import {
  buildFeatureHistoryFilterParams,
  getFeatureChangesSummary,
  formatEventType,
  FEATURE_EVENT_TYPES,
} from "@/components/Features/FeatureHistory/utils";

describe("Feature History Utils", () => {
  describe("FEATURE_EVENT_TYPES", () => {
    it("should contain the correct feature event types", () => {
      expect(FEATURE_EVENT_TYPES).toEqual([
        "feature.created",
        "feature.updated",
        "feature.deleted",
      ]);
    });
  });

  describe("buildFeatureHistoryFilterParams", () => {
    it("should build params with pagination", () => {
      const params = buildFeatureHistoryFilterParams({
        currentPage: 2,
        perPage: 30,
        fromDate: null,
        toDate: null,
        sortOrder: "desc",
      });

      const parsed = new URLSearchParams(params);
      expect(parsed.get("page")).toBe("2");
      expect(parsed.get("perPage")).toBe("30");
      expect(parsed.get("sortOrder")).toBe("desc");
      expect(parsed.get("type")).toBe(JSON.stringify(FEATURE_EVENT_TYPES));
    });

    it("should include fromDate when provided", () => {
      const fromDate = new Date("2024-01-15T00:00:00.000Z");
      const params = buildFeatureHistoryFilterParams({
        currentPage: 1,
        perPage: 30,
        fromDate,
        toDate: null,
        sortOrder: "desc",
      });

      const parsed = new URLSearchParams(params);
      expect(parsed.get("from")).toBe(fromDate.toISOString());
    });

    it("should include toDate when provided", () => {
      const toDate = new Date("2024-01-20T23:59:59.000Z");
      const params = buildFeatureHistoryFilterParams({
        currentPage: 1,
        perPage: 30,
        fromDate: null,
        toDate,
        sortOrder: "desc",
      });

      const parsed = new URLSearchParams(params);
      expect(parsed.get("to")).toBe(toDate.toISOString());
    });

    it("should include both dates when provided", () => {
      const fromDate = new Date("2024-01-15T00:00:00.000Z");
      const toDate = new Date("2024-01-20T23:59:59.000Z");
      const params = buildFeatureHistoryFilterParams({
        currentPage: 1,
        perPage: 30,
        fromDate,
        toDate,
        sortOrder: "asc",
      });

      const parsed = new URLSearchParams(params);
      expect(parsed.get("from")).toBe(fromDate.toISOString());
      expect(parsed.get("to")).toBe(toDate.toISOString());
      expect(parsed.get("sortOrder")).toBe("asc");
    });

    it("should have empty from/to when dates are null", () => {
      const params = buildFeatureHistoryFilterParams({
        currentPage: 1,
        perPage: 30,
        fromDate: null,
        toDate: null,
        sortOrder: "desc",
      });

      const parsed = new URLSearchParams(params);
      expect(parsed.get("from")).toBe("");
      expect(parsed.get("to")).toBe("");
    });
  });

  describe("getFeatureChangesSummary", () => {
    it("should return 'Feature created' for feature.created events", () => {
      const summary = getFeatureChangesSummary("feature.created", undefined);
      expect(summary).toBe("Feature created");
    });

    it("should return 'Feature deleted' for feature.deleted events", () => {
      const summary = getFeatureChangesSummary("feature.deleted", undefined);
      expect(summary).toBe("Feature deleted");
    });

    it("should return changed fields for feature.updated events", () => {
      const previousAttributes = {
        defaultValue: "false",
        description: "Old description",
      };
      const summary = getFeatureChangesSummary(
        "feature.updated",
        previousAttributes
      );
      expect(summary).toBe("Changed: defaultValue, description");
    });

    it("should return 'Feature updated' when no previous_attributes for update", () => {
      const summary = getFeatureChangesSummary("feature.updated", undefined);
      expect(summary).toBe("Feature updated");
    });

    it("should return 'Feature updated' when previous_attributes is empty for update", () => {
      const summary = getFeatureChangesSummary("feature.updated", {});
      expect(summary).toBe("Feature updated");
    });

    it("should truncate long lists of changed fields", () => {
      const previousAttributes = {
        field1: "a",
        field2: "b",
        field3: "c",
        field4: "d",
        field5: "e",
        field6: "f",
      };
      const summary = getFeatureChangesSummary(
        "feature.updated",
        previousAttributes
      );
      expect(summary).toBe("Changed: field1, field2, field3, +3 more");
    });
  });

  describe("formatEventType", () => {
    it("should format feature.created as Created", () => {
      expect(formatEventType("feature.created")).toBe("Created");
    });

    it("should format feature.updated as Updated", () => {
      expect(formatEventType("feature.updated")).toBe("Updated");
    });

    it("should format feature.deleted as Deleted", () => {
      expect(formatEventType("feature.deleted")).toBe("Deleted");
    });

    it("should return the event type for unknown types", () => {
      expect(formatEventType("unknown.type")).toBe("unknown.type");
    });
  });
});
