"use client";

import { useMemo, useState } from "react";

import { normalizeSearch } from "../blog/normalize-search";
import { featureGroupSections } from "./feature-groups";

/** Text the features search looks into, per feature. */
const searchIndex = new Map(
  featureGroupSections.flatMap((section) =>
    section.features.map((feature) => [
      feature,
      normalizeSearch(
        [
          feature.title,
          feature.description,
          feature.detail ?? "",
          section.navLabel,
          ...section.heading,
        ].join(" "),
      ),
    ]),
  ),
);

/**
 * Search over the feature groups: the groups that still have features for the
 * query, and the entries (id, label, count) the sticky features bar lists.
 */
export function useFeatureSearch() {
  const [query, setQuery] = useState("");
  const searchTerm = normalizeSearch(query);
  const groups = useMemo(
    () =>
      featureGroupSections
        .map((section) => ({
          ...section,
          features: section.features.filter(
            (feature) =>
              !searchTerm || searchIndex.get(feature)?.includes(searchTerm),
          ),
        }))
        .filter((section) => section.features.length > 0),
    [searchTerm],
  );
  const entries = useMemo(
    () =>
      groups.map((section) => ({
        id: section.id,
        label: section.navLabel,
        count: section.features.length,
      })),
    [groups],
  );
  return { query, setQuery, searchTerm, groups, entries };
}
