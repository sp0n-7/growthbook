export const FEATURE_EVENT_TYPES = [
  "feature.created",
  "feature.updated",
  "feature.deleted",
] as const;

export type FeatureEventType = typeof FEATURE_EVENT_TYPES[number];

interface FilterParams {
  currentPage: number;
  perPage: number;
  fromDate: Date | null;
  toDate: Date | null;
  sortOrder: "asc" | "desc";
}

export function buildFeatureHistoryFilterParams({
  currentPage,
  perPage,
  fromDate,
  toDate,
  sortOrder,
}: FilterParams): string {
  return new URLSearchParams({
    page: currentPage.toString(),
    perPage: perPage.toString(),
    from: fromDate ? fromDate.toISOString() : "",
    to: toDate ? toDate.toISOString() : "",
    type: JSON.stringify([...FEATURE_EVENT_TYPES]),
    sortOrder,
  }).toString();
}

export function getFeatureChangesSummary(
  eventType: string,
  previousAttributes: Record<string, unknown> | undefined
): string {
  if (eventType === "feature.created") {
    return "Feature created";
  }

  if (eventType === "feature.deleted") {
    return "Feature deleted";
  }

  if (eventType === "feature.updated") {
    if (!previousAttributes || Object.keys(previousAttributes).length === 0) {
      return "Feature updated";
    }

    const changedFields = Object.keys(previousAttributes);
    const maxFieldsToShow = 3;

    if (changedFields.length <= maxFieldsToShow) {
      return `Changed: ${changedFields.join(", ")}`;
    }

    const shownFields = changedFields.slice(0, maxFieldsToShow);
    const remainingCount = changedFields.length - maxFieldsToShow;
    return `Changed: ${shownFields.join(", ")}, +${remainingCount} more`;
  }

  return eventType;
}

export function formatEventType(eventType: string): string {
  switch (eventType) {
    case "feature.created":
      return "Created";
    case "feature.updated":
      return "Updated";
    case "feature.deleted":
      return "Deleted";
    default:
      return eventType;
  }
}
