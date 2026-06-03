import { createSupabasePublicClient } from "@/lib/supabasePublic";
import {
  calculateClubStatus,
  type ClubStatus,
} from "@/lib/clubFreshness";
import { LocationData } from "./clubRegistration";

export type { ClubStatus } from "@/lib/clubFreshness";

export const categories = [
  "engineering",
  "computer science",
  "business",
  "cultural",
  "volunteering",
  "games",
  "art",
  "music",
  "media",
  "food",
  "other",
] as const;

export type ClubCategory = (typeof categories)[number];
export type ClubVisibilityState = "visible" | "hidden";

export type Club = {
  id: string;
  slug: string;
  name: string;
  category: ClubCategory;
  shortDescription: string;
  about: string;
  upcomingEvents: string;
  announcements: string;
  contactInfo: string;
  meetingTime: string;
  location: LocationData
  members: number;
  status: ClubStatus;
  visibilityState: ClubVisibilityState;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
  profileImagePath: string | null;
  profileImageUrl: string | null;
};

export type ClubRow = {
  id: string;
  slug: string;
  name: string;
  category: ClubCategory;
  short_description: string;
  about: string;
  upcoming_events: string;
  announcements: string;
  contact_info: string;
  meeting_time: string;
  location: LocationData;
  members: number;
  status: ClubStatus;
  visibility_state: ClubVisibilityState;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
  profile_image_path: string | null;
};

export const clubSelectColumns = [
  "id",
  "slug",
  "name",
  "category",
  "short_description",
  "about",
  "upcoming_events",
  "announcements",
  "contact_info",
  "meeting_time",
  "location",
  "members",
  "status",
  "visibility_state",
  "last_edited_at",
  "created_at",
  "updated_at",
  "profile_image_path",
].join(", ");

export const categoryLabels: Record<ClubCategory, string> = {
  engineering: "Engineering",
  "computer science": "Computer Science",
  business: "Business",
  cultural: "Cultural",
  volunteering: "Volunteering",
  games: "Games",
  art: "Art",
  music: "Music",
  media: "Media",
  food: "Food",
  other: "Other",
};

export function rowToClub(row: ClubRow): Club {
  const supabase = createSupabasePublicClient();
  const profileImageUrl = row.profile_image_path ? supabase.storage
    .from("club-profile-images")
    .getPublicUrl(row.profile_image_path).data.publicUrl 
    : null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    shortDescription: row.short_description,
    about: row.about,
    upcomingEvents: row.upcoming_events,
    announcements: row.announcements,
    contactInfo: row.contact_info,
    meetingTime: row.meeting_time,
    location: row.location,
    members: row.members,
    status: calculateClubStatus(row.last_edited_at),
    visibilityState: row.visibility_state,
    lastEditedAt: row.last_edited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profileImagePath: row.profile_image_path,
    profileImageUrl,
  };
}

export async function fetchVisibleClubs(): Promise<Club[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("clubs")
    .select(clubSelectColumns)
    .eq("visibility_state", "visible")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch clubs: ${error.message}`);
  }

  return ((data ?? []) as unknown as ClubRow[]).map(rowToClub);
}

export async function fetchVisibleClubBySlug(
  slug: string,
): Promise<Club | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("clubs")
    .select(clubSelectColumns)
    .eq("slug", slug)
    .eq("visibility_state", "visible")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch club: ${error.message}`);
  }

  return data ? rowToClub(data as unknown as ClubRow) : null;
}
