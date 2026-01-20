import React, { useState } from "react";
import Link from "next/link";
import { EventInterface } from "back-end/types/event";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import useApi from "@/hooks/useApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";
import Field from "@/components/Forms/Field";
import SelectField from "@/components/Forms/SelectField";
import usePermissionsUtil from "@/hooks/usePermissionsUtils";
import { FeatureHistoryRow } from "./FeatureHistoryRow";
import { buildFeatureHistoryFilterParams, FEATURE_EVENT_TYPES } from "./utils";

export const FeatureHistoryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sort, setSort] = useState<{ field: string; dir: number }>({
    field: "dateCreated",
    dir: -1,
  });

  const permissionsUtil = usePermissionsUtil();

  const sortOrder = sort.dir === 1 ? "asc" : "desc";
  const filterURLParams = buildFeatureHistoryFilterParams({
    currentPage,
    perPage,
    fromDate,
    toDate,
    sortOrder,
  });

  const { data, error } = useApi<{ events: EventInterface[] }>(
    "/events?" + filterURLParams
  );

  const { data: countData } = useApi<{ count: number }>(
    "/events/count?type=" +
      JSON.stringify([...FEATURE_EVENT_TYPES]) +
      (fromDate ? "&from=" + fromDate.toISOString() : "") +
      (toDate ? "&to=" + toDate.toISOString() : "")
  );

  const hasFilters = !!fromDate || !!toDate;

  if (!permissionsUtil.canViewAuditLogs()) {
    return (
      <div className="container pagecontents">
        <div className="alert alert-danger">
          You do not have access to view this page.
        </div>
      </div>
    );
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  const events = data.events;

  return (
    <div className="container py-4">
      <div className="row mb-3">
        <div className="col">
          <Link href="/features" className="text-muted">
            &larr; Back to Features
          </Link>
          <h1 className="mt-2">Feature Flag Changes History</h1>
          <p className="text-muted">
            View all changes made to feature flags within a date range.
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-between flex-row mt-2">
        <div>
          <Field
            type="date"
            label="From"
            className="text-muted"
            labelClassName="mr-2 mb-0"
            containerClassName="d-flex align-items-center mb-0"
            value={fromDate ? fromDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              setFromDate(e.target.value ? new Date(e.target.value) : null);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <Field
            type="date"
            label="To"
            className="text-muted"
            labelClassName="mr-2 mb-0"
            containerClassName="ml-2 d-flex align-items-center mb-0"
            value={toDate ? toDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              setToDate(e.target.value ? new Date(e.target.value) : null);
              setCurrentPage(1);
            }}
          />
        </div>
        {hasFilters && (
          <div>
            <button
              className="btn btn-outline-info ml-2"
              onClick={(e) => {
                e.preventDefault();
                setFromDate(null);
                setToDate(null);
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
          </div>
        )}
        <div className="flex-grow-1"></div>
        <div>
          <SelectField
            containerClassName="ml-2 d-flex align-items-center mb-0"
            labelClassName="mr-2 mb-0"
            label="Show"
            options={[
              { label: "10", value: "10" },
              { label: "20", value: "20" },
              { label: "30", value: "30" },
              { label: "50", value: "50" },
              { label: "100", value: "100" },
            ]}
            sort={false}
            value={"" + perPage}
            onChange={(v) => {
              if (parseInt(v) === perPage) return;
              setPerPage(parseInt(v));
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-2">
          There was an error loading the events.
        </div>
      )}

      <table className="mt-3 table gbtable appbox--align-top table-hover appbox">
        <thead>
          <tr>
            <th style={{ width: 180 }}>
              <span
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setSort({
                    field: "dateCreated",
                    dir: sort.dir * -1,
                  });
                }}
              >
                Date/Time{" "}
                <a
                  href="#"
                  className={
                    sort.field === "dateCreated" ? "activesort" : "inactivesort"
                  }
                >
                  {sort.field === "dateCreated" ? (
                    sort.dir < 0 ? (
                      <FaSortDown />
                    ) : (
                      <FaSortUp />
                    )
                  ) : (
                    <FaSort />
                  )}
                </a>
              </span>
            </th>
            <th style={{ width: 200 }}>Feature</th>
            <th style={{ width: 100 }}>Event Type</th>
            <th style={{ width: 150 }}>User</th>
            <th>Changes</th>
            <th style={{ width: 50 }}></th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={6}>
                {hasFilters ? (
                  <div className="text-center py-4">
                    No feature changes were found that match the filters.
                  </div>
                ) : (
                  <div className="text-center py-4">
                    No feature changes were found. Feature changes are recorded
                    when users create, update, or delete feature flags.
                  </div>
                )}
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <FeatureHistoryRow key={event.id} event={event} />
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        numItemsTotal={countData?.count || 0}
        perPage={perPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
      />
    </div>
  );
};
