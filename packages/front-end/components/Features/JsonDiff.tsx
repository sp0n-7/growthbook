import React, { CSSProperties, useEffect, useRef } from "react";
import ReactJsonViewCompare from "react-json-view-compare";

function fixJsonRecursive(obj) {
  if (typeof obj != "string" && typeof obj != "object") {
    return obj;
  }
  if (typeof obj == "string") {
    let jsonObj;
    try {
      jsonObj = JSON.parse(obj);
    } catch (e) {
      return obj;
    }
    obj = jsonObj;
  }

  for (const key in obj) {
    obj[key] = fixJsonRecursive(obj[key]);
  }
  return obj;
}

export default function JsonDiff({
  value,
  defaultVal = "{}",
  fullStyle = { maxHeight: 300, overflowY: "auto", maxWidth: "100%" },
}: {
  value: string;
  defaultVal?: string;
  fullStyle?: CSSProperties;
}) {
  let oldData = JSON.parse(defaultVal);
  oldData = fixJsonRecursive(oldData);
  let newData = JSON.parse(value);
  newData = fixJsonRecursive(newData);

  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToFirstDiff = () => {
      if (viewerRef.current) {
        const firstDiff = viewerRef.current.querySelector(
          ".c-json-p.c-line-del, .c-json-p.c-line-add"
        );
        if (firstDiff) {
          // calculate offset relative to the scrollable container
          const containerRect = viewerRef.current.getBoundingClientRect();
          const diffRect = firstDiff.getBoundingClientRect();
          const offsetTop =
            diffRect.top - containerRect.top + viewerRef.current.scrollTop - 30;

          // scroll the container to the calculated offset
          viewerRef.current.scrollTo({ top: offsetTop, behavior: "instant" });
        }
      }
    };

    // add a slight delay to ensure rendering is complete
    const timeout = setTimeout(scrollToFirstDiff, 10);

    return () => clearTimeout(timeout); // Cleanup timeout if component unmounts
  }, []);

  return (
    <div ref={viewerRef} style={fullStyle}>
      <ReactJsonViewCompare oldData={oldData} newData={newData} />
    </div>
  );
}
