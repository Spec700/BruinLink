import { clubs } from "@/lib/clubs";
import type {
  ClubRegistrationRequest,
  ManagedClub,
} from "@/lib/clubRegistration";

export const sampleRegistrationRequests: ClubRegistrationRequest[] = [
  {
    id: "request-design-collective",
    requesterName: "Maya Chen",
    requesterEmail: "maya.chen@g.ucla.edu",
    clubName: "Bruin Product Design Collective",
    category: "engineering",
    shortDescription:
      "A studio-style community for students practicing product design, prototyping, and critique.",
    about:
      "Bruin Product Design Collective helps students turn early product ideas into polished prototypes through critique nights, research practice, and collaborative build sessions.",
    meetingTime: "Tuesdays, 6:00 PM",
    meetingLocation: "Engineering VI",
    publicContactEmail: "productdesign@g.ucla.edu",
    status: "pending",
    createdAt: "2026-04-28T18:30:00.000Z",
  },
  {
    id: "request-fintech-forum",
    requesterName: "Andre Patel",
    requesterEmail: "andre.patel@g.ucla.edu",
    clubName: "Westwood FinTech Forum",
    category: "business",
    shortDescription:
      "Student forum exploring payments, financial data, and startup case studies.",
    about:
      "Westwood FinTech Forum hosts beginner-friendly talks and project nights for students interested in the intersection of finance, software, and product strategy.",
    meetingTime: "Fridays, 4:30 PM",
    meetingLocation: "Anderson Courtyard",
    publicContactEmail: "fintechforum@g.ucla.edu",
    status: "pending",
    createdAt: "2026-04-29T20:15:00.000Z",
  },
];

export function getSampleManagedClubs(): ManagedClub[] {
  return clubs.map((club) => ({
    slug: club.slug,
    name: club.name,
    category: club.category,
    contactInfo: club.contactInfo,
    meetingTime: club.meetingTime,
    location: club.location,
    visibilityState: "visible",
  }));
}
