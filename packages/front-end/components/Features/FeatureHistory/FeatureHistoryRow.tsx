import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { EventInterface } from "back-end/types/event";
import { datetime } from "shared/dates";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Code from "@/components/SyntaxHighlighting/Code";
import { formatEventType, getFeatureChangesSummary } from "./utils";

// Dynamically import JsonDiff with SSR disabled because react-json-view-compare uses 'self'
const JsonDiff = dynamic(() => import("@/components/Features/JsonDiff"), {
  ssr: false,
  loading: () => <div className="text-muted">Loading diff...</div>,
});

type FeatureHistoryRowProps = {
  event: EventInterface;
};

// Type for feature event data structure
interface FeatureEventData {
  object?: Record<string, unknown>;
  current?: Record<string, unknown>;
  previous?: Record<string, unknown>;
  previous_attributes?: Record<string, unknown>;
}

function getEventData(event: EventInterface): FeatureEventData {
  return (event.data.data as unknown) as FeatureEventData;
}

function getFeatureId(event: EventInterface): string {
  const eventData = getEventData(event);

  if (event.version) {
    return (eventData?.object?.id as string) || "unknown";
  }
  // Legacy format
  return (
    (eventData?.current?.id as string) ||
    (eventData?.previous?.id as string) ||
    "unknown"
  );
}

function getUserDisplay(event: EventInterface): string {
  if (!event.data?.user) return "";
  if ("name" in event.data.user && event.data.user.name) {
    return event.data.user.name;
  }
  if ("email" in event.data.user && event.data.user.email) {
    return event.data.user.email;
  }
  return "";
}

function getUserEmail(event: EventInterface): string {
  if (!event.data?.user) return "";
  if ("email" in event.data.user) {
    return event.data.user.email || "";
  }
  return "";
}

function getPreviousAttributes(
  event: EventInterface
): Record<string, unknown> | undefined {
  const eventData = getEventData(event);
  return eventData?.previous_attributes;
}

function getCurrentState(
  event: EventInterface
): Record<string, unknown> | null {
  const eventData = getEventData(event);
  if (event.version) {
    return eventData?.object || null;
  }
  return eventData?.current || null;
}

function getPreviousState(
  event: EventInterface
): Record<string, unknown> | null {
  const eventData = getEventData(event);
  const previousAttributes = eventData?.previous_attributes;

  // For updates, reconstruct previous state from current + previous_attributes
  if (previousAttributes && Object.keys(previousAttributes).length > 0) {
    const currentState = getCurrentState(event);
    if (currentState) {
      // Previous state = current state with changed fields replaced by old values
      return { ...currentState, ...previousAttributes };
    }
  }

  // For deletes or legacy format
  if (event.version) {
    return eventData?.object || null;
  }
  return eventData?.previous || eventData?.current || null;
}

export const FeatureHistoryRow: React.FC<FeatureHistoryRowProps> = ({
  event,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const featureId = getFeatureId(event);
  const eventType = event.data.event || event.event;
  const userDisplay = getUserDisplay(event);
  const userEmail = getUserEmail(event);
  const previousAttributes = getPreviousAttributes(event);
  const changesSummary = getFeatureChangesSummary(
    eventType,
    previousAttributes
  );

  const currentState = getCurrentState(event);
  const previousState = getPreviousState(event);
  const isUpdate = eventType === "feature.updated";
  const canShowDiff = isUpdate && previousState && currentState;

  return (
    <>
      <tr>
        <td>
          <span className="py-1 d-block nowrap">
            {datetime(event.dateCreated)}
          </span>
        </td>
        <td>
          <Link href={`/features/${featureId}`} className="font-weight-bold">
            {featureId}
          </Link>
        </td>
        <td>
          <span
            className={`badge ${
              eventType === "feature.created"
                ? "badge-success"
                : eventType === "feature.deleted"
                ? "badge-danger"
                : "badge-info"
            }`}
          >
            {formatEventType(eventType)}
          </span>
        </td>
        <td>
          <span className="py-1 d-block" title={userEmail}>
            {userDisplay}
          </span>
        </td>
        <td>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowDetails(!showDetails);
            }}
          >
            <div className="d-flex align-items-center py-1">
              <span className="mb-0">{changesSummary}</span>
              {showDetails ? (
                <FaAngleUp className="ml-2" />
              ) : (
                <FaAngleDown className="ml-2" />
              )}
            </div>
          </a>
          {showDetails && (
            <div className="mt-2">
              {canShowDiff ? (
                <JsonDiff
                  defaultVal={JSON.stringify(previousState, null, 2)}
                  value={JSON.stringify(currentState, null, 2)}
                  fullStyle={{
                    maxHeight: 400,
                    overflowY: "auto",
                    maxWidth: "100%",
                  }}
                />
              ) : (
                <Code
                  language="json"
                  filename={
                    eventType === "feature.created"
                      ? "New Feature"
                      : eventType === "feature.deleted"
                      ? "Deleted Feature"
                      : "Feature State"
                  }
                  code={JSON.stringify(currentState || previousState, null, 2)}
                  expandable={false}
                />
              )}
            </div>
          )}
        </td>
        <td>
          <span className="tr-hover small py-1">
            <Link href={`/events/${event.id}`}>Details</Link>
          </span>
        </td>
      </tr>
    </>
  );
};
