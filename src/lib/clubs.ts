import { supabase, supabaseConfigured } from "./supabase";

export const categories = [
  "engineering",
  "computer science",
  "business",
  "cultural",
  "other",
] as const;

export type ClubCategory = (typeof categories)[number];

export type Club = {
  slug: string;
  name: string;
  category: ClubCategory;
  shortDescription: string;
  about: string;
  upcomingEvents: string;
  announcements: string;
  contactInfo: string;
  meetingTime: string;
  location: string;
  members: number;
  status: "fresh" | "needs update" | "steady";
};

export const categoryLabels: Record<ClubCategory, string> = {
  engineering: "Engineering",
  "computer science": "Computer Science",
  business: "Business",
  cultural: "Cultural",
  other: "Other",
};

type ClubRow = {
  slug: string;
  name: string;
  category: string;
  short_description: string;
  about: string;
  upcoming_events: string;
  announcements: string;
  contact_info: string;
  meeting_time: string;
  location: string;
  members: number;
  status: string;
};

function rowToClub(row: ClubRow): Club {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as ClubCategory,
    shortDescription: row.short_description,
    about: row.about,
    upcomingEvents: row.upcoming_events,
    announcements: row.announcements,
    contactInfo: row.contact_info,
    meetingTime: row.meeting_time,
    location: row.location,
    members: row.members,
    status: row.status as Club["status"],
  };
}

export async function fetchAllClubs(): Promise<Club[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from("clubs")
    .select(
      "slug, name, category, short_description, about, upcoming_events, announcements, contact_info, meeting_time, location, members, status"
    )
    .order("name");

  if (error) {
    console.error("Failed to fetch clubs:", error.message);
    return [];
  }

  return (data as ClubRow[]).map(rowToClub);
}

export async function fetchClubBySlug(slug: string): Promise<Club | null> {
  if (!supabaseConfigured) return null;

  const { data, error } = await supabase
    .from("clubs")
    .select(
      "slug, name, category, short_description, about, upcoming_events, announcements, contact_info, meeting_time, location, members, status"
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return rowToClub(data as ClubRow);
}

export async function verifyClubPin(
  slug: string,
  pin: string
): Promise<{ valid: boolean; clubName: string | null }> {
  if (!supabaseConfigured) return { valid: false, clubName: null };

  const { data, error } = await supabase
    .from("clubs")
    .select("name, edit_pin")
    .eq("slug", slug)
    .single();

  if (error || !data) return { valid: false, clubName: null };

  if (data.edit_pin === pin) {
    return { valid: true, clubName: data.name };
  }

  return { valid: false, clubName: null };
}

export async function updateClub(
  slug: string,
  fields: Partial<
    Pick<
      Club,
      | "about"
      | "upcomingEvents"
      | "announcements"
      | "contactInfo"
      | "meetingTime"
      | "location"
      | "shortDescription"
    >
  >
): Promise<boolean> {
  const mapped: Record<string, string> = {};
  if (fields.about !== undefined) mapped.about = fields.about;
  if (fields.upcomingEvents !== undefined)
    mapped.upcoming_events = fields.upcomingEvents;
  if (fields.announcements !== undefined)
    mapped.announcements = fields.announcements;
  if (fields.contactInfo !== undefined) mapped.contact_info = fields.contactInfo;
  if (fields.meetingTime !== undefined) mapped.meeting_time = fields.meetingTime;
  if (fields.location !== undefined) mapped.location = fields.location;
  if (fields.shortDescription !== undefined)
    mapped.short_description = fields.shortDescription;

  if (!supabaseConfigured) return false;

  mapped.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("clubs")
    .update(mapped)
    .eq("slug", slug);

  if (error) {
    console.error("Failed to update club:", error.message);
    return false;
  }

  return true;
}

export async function fetchClubSlugsAndNames(): Promise<
  { slug: string; name: string }[]
> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from("clubs")
    .select("slug, name")
    .order("name");

  if (error) {
    console.error("Failed to fetch club list:", error.message);
    return [];
  }

  return data ?? [];
}
