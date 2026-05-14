export const clubFreshnessStatuses = [
  "fresh",
  "steady",
  "needs update",
] as const;

export type ClubStatus = (typeof clubFreshnessStatuses)[number];

const dayInMs = 24 * 60 * 60 * 1000;
const freshThresholdDays = 3;
const steadyThresholdDays = 14;

export const clubStatusLabels: Record<ClubStatus, string> = {
  fresh: "fresh",
  steady: "current",
  "needs update": "needs update",
};

export const clubDashboardStatusLabels: Record<ClubStatus, string> = {
  fresh: "Recently updated",
  steady: "Current",
  "needs update": "Needs attention",
};

export function calculateClubStatus(
  lastEditedAt: string,
  now: Date = new Date(),
): ClubStatus {
  const editedAt = new Date(lastEditedAt);

  if (Number.isNaN(editedAt.getTime())) {
    return "needs update";
  }

  const daysSinceEdit = Math.max(0, now.getTime() - editedAt.getTime()) / dayInMs;

  if (daysSinceEdit <= freshThresholdDays) {
    return "fresh";
  }

  if (daysSinceEdit <= steadyThresholdDays) {
    return "steady";
  }

  return "needs update";
}

export function formatLastUpdated(
  lastEditedAt: string,
  now: Date = new Date(),
) {
  const editedAt = new Date(lastEditedAt);

  if (Number.isNaN(editedAt.getTime())) {
    return "Last updated: Unknown";
  }

  const daysSinceEdit = Math.floor(
    Math.max(0, now.getTime() - editedAt.getTime()) / dayInMs,
  );

  if (daysSinceEdit === 0) {
    return "Last updated: Today";
  }

  if (daysSinceEdit === 1) {
    return "Last updated: 1 day ago";
  }

  if (daysSinceEdit < 30) {
    return `Last updated: ${daysSinceEdit} days ago`;
  }

  return `Last updated: ${editedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
