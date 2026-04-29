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

export const clubs: Club[] = [
  {
    slug: "bruin-forge-engineering",
    name: "Bruin Forge Engineering",
    category: "engineering",
    shortDescription:
      "Hands-on design team building small-scale mechanical systems for campus challenges.",
    about:
      "Bruin Forge Engineering gives students a place to prototype, test, and present practical engineering projects. Members work in small squads and rotate through design reviews, CAD workshops, and build nights.",
    upcomingEvents:
      "Spring prototype night is scheduled for Thursday at Boelter Hall. New members can join the design review table at 6:30 PM.",
    announcements:
      "Project leads are collecting interest forms for the next campus mobility challenge.",
    contactInfo: "bruinforge@g.ucla.edu",
    meetingTime: "Thursdays, 6:30 PM",
    location: "Boelter Hall",
    members: 48,
    status: "fresh",
  },
  {
    slug: "westwood-rocket-works",
    name: "Westwood Rocket Works",
    category: "engineering",
    shortDescription:
      "A student group exploring aerospace design, launch simulations, and build safety.",
    about:
      "Westwood Rocket Works introduces students to aerospace fundamentals through simulation sessions, model fabrication, and safety-first launch planning.",
    upcomingEvents:
      "Wind tunnel demo planning session meets next Monday in the engineering makerspace.",
    announcements:
      "The propulsion reading group has opened a beginner track for spring quarter.",
    contactInfo: "rocketworks@g.ucla.edu",
    meetingTime: "Mondays, 7:00 PM",
    location: "Engineering VI",
    members: 36,
    status: "steady",
  },
  {
    slug: "pacific-design-lab",
    name: "Pacific Design Lab",
    category: "engineering",
    shortDescription:
      "Interdisciplinary studio for product design, fabrication, and critique.",
    about:
      "Pacific Design Lab pairs engineering students with designers to turn early concepts into usable physical prototypes. The club emphasizes sketching, testing, and clear presentation.",
    upcomingEvents:
      "Portfolio critique night is Friday at 5:00 PM with peer feedback tables.",
    announcements:
      "Members can reserve 3D printer slots for final project week through the club form.",
    contactInfo: "pacificdesign@g.ucla.edu",
    meetingTime: "Fridays, 5:00 PM",
    location: "Perloff Hall",
    members: 29,
    status: "needs update",
  },
  {
    slug: "bruin-software-union",
    name: "Bruin Software Union",
    category: "computer science",
    shortDescription:
      "A collaborative coding community for students building web apps and tools.",
    about:
      "Bruin Software Union helps students ship small software projects in teams. Weekly sessions include code review, product planning, and practical workshops for React, databases, and deployment.",
    upcomingEvents:
      "React component clinic meets Wednesday in the Young Research Library collaboration room.",
    announcements:
      "Spring project teams are matching designers and engineers this week.",
    contactInfo: "softwareunion@g.ucla.edu",
    meetingTime: "Wednesdays, 6:00 PM",
    location: "YRL Collaboration Room",
    members: 72,
    status: "fresh",
  },
  {
    slug: "westwood-data-collective",
    name: "Westwood Data Collective",
    category: "computer science",
    shortDescription:
      "Data science club focused on public datasets, visualization, and campus insights.",
    about:
      "Westwood Data Collective teaches students how to clean, analyze, and present data. Members work on short case studies and publish visual reports for practice.",
    upcomingEvents:
      "The next notebook lab covers transit data and map-based visualizations.",
    announcements:
      "Beginner Python office hours are moving to Tuesday evenings for the rest of spring.",
    contactInfo: "datacollective@g.ucla.edu",
    meetingTime: "Tuesdays, 7:30 PM",
    location: "Mathematical Sciences",
    members: 64,
    status: "steady",
  },
  {
    slug: "ucla-web-builders",
    name: "UCLA Web Builders",
    category: "computer science",
    shortDescription:
      "Student builders practicing frontend, backend, and product collaboration.",
    about:
      "UCLA Web Builders runs short build sprints where students create portfolio-ready web projects. The club is beginner-friendly and emphasizes readable code and thoughtful interfaces.",
    upcomingEvents:
      "Design systems workshop happens Sunday afternoon in the student activities center.",
    announcements:
      "The spring showcase signup form is open for teams that want feedback.",
    contactInfo: "webbuilders@g.ucla.edu",
    meetingTime: "Sundays, 3:00 PM",
    location: "Student Activities Center",
    members: 55,
    status: "fresh",
  },
  {
    slug: "bruin-venture-circle",
    name: "Bruin Venture Circle",
    category: "business",
    shortDescription:
      "A student entrepreneurship group for pitch practice and startup research.",
    about:
      "Bruin Venture Circle brings together students interested in startups, product strategy, and early-stage investing. Members practice concise pitches and analyze emerging markets.",
    upcomingEvents:
      "Founder fireside chat preparation meets Thursday in Ackerman Union.",
    announcements:
      "Pitch deck peer reviews are available by appointment this month.",
    contactInfo: "venturecircle@g.ucla.edu",
    meetingTime: "Thursdays, 7:00 PM",
    location: "Ackerman Union",
    members: 41,
    status: "steady",
  },
  {
    slug: "startup-strategy-society",
    name: "Startup Strategy Society",
    category: "business",
    shortDescription:
      "Case-practice community for students interested in growth and operations.",
    about:
      "Startup Strategy Society studies how early companies choose customers, price products, and run operations. Meetings mix short talks with team-based cases.",
    upcomingEvents:
      "Market sizing practice night is next Tuesday with three beginner prompts.",
    announcements:
      "Applications for the internal consulting sprint close at the end of the week.",
    contactInfo: "startupstrategy@g.ucla.edu",
    meetingTime: "Tuesdays, 6:30 PM",
    location: "Bunche Hall",
    members: 38,
    status: "needs update",
  },
  {
    slug: "campus-consulting-collective",
    name: "Campus Consulting Collective",
    category: "business",
    shortDescription:
      "Student consulting practice group supporting local and campus organizations.",
    about:
      "Campus Consulting Collective gives members a structured way to learn client research, slide writing, and presentation skills through scoped student projects.",
    upcomingEvents:
      "Client scoping workshop meets Saturday morning with returning project leads.",
    announcements:
      "New analyst onboarding packets have been posted to the member drive.",
    contactInfo: "campusconsulting@g.ucla.edu",
    meetingTime: "Saturdays, 10:00 AM",
    location: "Anderson Courtyard",
    members: 52,
    status: "fresh",
  },
  {
    slug: "mosaic-bruins",
    name: "Mosaic Bruins",
    category: "cultural",
    shortDescription:
      "Cultural exchange club hosting story nights, food socials, and discussion circles.",
    about:
      "Mosaic Bruins creates space for students to share culture through conversation, food, music, and campus events. The club welcomes members from every background.",
    upcomingEvents:
      "Community story night takes place Friday evening on the Hill.",
    announcements:
      "Members are invited to suggest themes for the end-of-quarter culture showcase.",
    contactInfo: "mosaicbruins@g.ucla.edu",
    meetingTime: "Fridays, 7:00 PM",
    location: "De Neve Commons",
    members: 67,
    status: "steady",
  },
  {
    slug: "pacific-islander-arts-circle",
    name: "Pacific Islander Arts Circle",
    category: "cultural",
    shortDescription:
      "Arts and heritage group centered on performance, storytelling, and community.",
    about:
      "Pacific Islander Arts Circle supports students interested in heritage arts, performance, and cultural education. Meetings include practice sessions and informal discussion.",
    upcomingEvents:
      "Spring performance rehearsal is scheduled for Wednesday night.",
    announcements:
      "Costume inventory volunteers are needed before the next showcase rehearsal.",
    contactInfo: "piartscircle@g.ucla.edu",
    meetingTime: "Wednesdays, 8:00 PM",
    location: "Kerckhoff Hall",
    members: 34,
    status: "fresh",
  },
  {
    slug: "global-bruins-exchange",
    name: "Global Bruins Exchange",
    category: "cultural",
    shortDescription:
      "A student-led space for international friendship and cross-cultural events.",
    about:
      "Global Bruins Exchange connects domestic and international students through small group outings, language tables, and practical campus conversations.",
    upcomingEvents:
      "Language table mixer meets next Monday on Bruin Walk.",
    announcements:
      "Host signups are open for the spring welcome picnic.",
    contactInfo: "globalbruins@g.ucla.edu",
    meetingTime: "Mondays, 5:00 PM",
    location: "Bruin Walk",
    members: 73,
    status: "steady",
  },
  {
    slug: "bruin-board-game-society",
    name: "Bruin Board Game Society",
    category: "other",
    shortDescription:
      "Casual strategy, party game, and tabletop nights for students across campus.",
    about:
      "Bruin Board Game Society hosts relaxed game nights where students can learn new tabletop games or bring their favorites. No experience is required.",
    upcomingEvents:
      "Draft-and-play night is this Saturday in the residence hall lounge.",
    announcements:
      "The club library added five new strategy games for spring quarter.",
    contactInfo: "boardgames@g.ucla.edu",
    meetingTime: "Saturdays, 8:00 PM",
    location: "Rieber Hall",
    members: 44,
    status: "fresh",
  },
  {
    slug: "sunset-service-crew",
    name: "Sunset Service Crew",
    category: "other",
    shortDescription:
      "Volunteer group organizing weekend service trips around Los Angeles.",
    about:
      "Sunset Service Crew coordinates approachable volunteer opportunities for students who want to serve local communities and meet new people.",
    upcomingEvents:
      "Beach cleanup carpool leaves from campus at 9:00 AM on Sunday.",
    announcements:
      "Drivers are needed for two upcoming food bank volunteer shifts.",
    contactInfo: "sunsetservice@g.ucla.edu",
    meetingTime: "Sundays, 9:00 AM",
    location: "Westwood Plaza",
    members: 58,
    status: "steady",
  },
  {
    slug: "westwood-wellness-club",
    name: "Westwood Wellness Club",
    category: "other",
    shortDescription:
      "Peer community for low-pressure wellness events, walks, and study breaks.",
    about:
      "Westwood Wellness Club organizes accessible activities that help students reset during busy weeks. Events include walks, tea socials, and quiet study breaks.",
    upcomingEvents:
      "Sunset walk meets outside Powell Library this Thursday.",
    announcements:
      "The spring finals care package packing shift is open for volunteers.",
    contactInfo: "westwoodwellness@g.ucla.edu",
    meetingTime: "Thursdays, 5:30 PM",
    location: "Powell Library",
    members: 46,
    status: "needs update",
  },
];

export function getClubBySlug(slug: string) {
  return clubs.find((club) => club.slug === slug);
}

export function getCategoryCount(category: ClubCategory) {
  return clubs.filter((club) => club.category === category).length;
}
