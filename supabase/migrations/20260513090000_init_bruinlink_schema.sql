create extension if not exists pgcrypto;

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('engineering', 'computer science', 'business', 'cultural', 'volunteering', 'games', 'art', 'music', 'media', 'food', 'other')),
  short_description text not null default '',
  about text not null default '',
  upcoming_events text not null default '',
  announcements text not null default '',
  contact_info text not null default '',
  meeting_time text not null default '',
  location jsnobj not null,
  members integer not null default 0 check (members >= 0),
  status text not null default 'fresh' check (status in ('fresh', 'steady', 'needs update')),
  visibility_state text not null default 'visible' check (visibility_state in ('visible', 'hidden')),
  edit_code_hash text not null unique,
  last_edited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_image_path text
);

create table public.club_registration_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  club_name text not null,
  club_slug text not null,
  category text not null check (category in ('engineering', 'computer science', 'business', 'cultural', 'volunteering', 'games', 'art', 'music', 'media', 'food', 'other')),
  short_description text not null,
  about text not null,
  meeting_time text not null,
  location jsonb not null ,
  public_contact_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_image_path text,
  members integer not null default 0 check (members >= 0),
);

create unique index club_registration_requests_active_slug_key
  on public.club_registration_requests (club_slug)
  where status in ('pending', 'approved');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clubs_set_updated_at
  before update on public.clubs
  for each row
  execute function public.set_updated_at();

create trigger club_registration_requests_set_updated_at
  before update on public.club_registration_requests
  for each row
  execute function public.set_updated_at();

alter table public.clubs enable row level security;
alter table public.club_registration_requests enable row level security;

create policy "Public can read visible clubs"
  on public.clubs
  for select
  to anon, authenticated
  using (visibility_state = 'visible');

grant usage on schema public to anon, authenticated;
grant select on public.clubs to anon, authenticated;

create or replace function public.approve_club_registration_request(
  target_request_id uuid,
  generated_edit_code_hash text,
  approval_note text default null
)
returns table (
  approved_club_slug text,
  approved_club_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  request_record public.club_registration_requests%rowtype;
begin
  select *
    into request_record
    from public.club_registration_requests
    where id = target_request_id
    for update;

  if not found then
    raise exception 'Registration request not found';
  end if;

  if request_record.status <> 'pending' then
    raise exception 'Registration request has already been reviewed';
  end if;

  insert into public.clubs (
    slug,
    name,
    category,
    short_description,
    about,
    upcoming_events,
    announcements,
    contact_info,
    meeting_time,
    location,
    members,
    status,
    visibility_state,
    edit_code_hash,
    last_edited_at,
    profile_image_path
  )
  values (
    request_record.club_slug,
    request_record.club_name,
    request_record.category,
    request_record.short_description,
    request_record.about,
    '',
    '',
    request_record.public_contact_email,
    request_record.meeting_time,
    request_record.location,
    0,
    'fresh',
    'visible',
    generated_edit_code_hash,
    now(),
    request_record.profile_image_path
  );

  update public.club_registration_requests
    set status = 'approved',
        admin_note = nullif(trim(approval_note), ''),
        reviewed_at = now()
    where id = target_request_id;

  approved_club_slug := request_record.club_slug;
  approved_club_name := request_record.club_name;
  return next;
end;
$$;

revoke all on function public.approve_club_registration_request(uuid, text, text) from public;
grant execute on function public.approve_club_registration_request(uuid, text, text) to service_role;

insert into public.clubs (
  slug,
  name,
  category,
  short_description,
  about,
  upcoming_events,
  announcements,
  contact_info,
  meeting_time,
  location,
  members,
  status,
  visibility_state,
  edit_code_hash
)
values
  (
    'bruin-forge-engineering',
    'Bruin Forge Engineering',
    'engineering',
    'Hands-on design team building small-scale mechanical systems for campus challenges.',
    'Bruin Forge Engineering gives students a place to prototype, test, and present practical engineering projects. Members work in small squads and rotate through design reviews, CAD workshops, and build nights.',
    'Spring prototype night is scheduled for Thursday at Boelter Hall. New members can join the design review table at 6:30 PM.',
    'Project leads are collecting interest forms for the next campus mobility challenge.',
    'bruinforge@g.ucla.edu',
    'Thursdays, 6:30 PM',
    'Boelter Hall',
    48,
    'fresh',
    'visible',
    '90584278499047be4173fb20e58cc816606859df868ee2978716094dad0c5a0d'
  ),
  (
    'westwood-rocket-works',
    'Westwood Rocket Works',
    'engineering',
    'A student group exploring aerospace design, launch simulations, and build safety.',
    'Westwood Rocket Works introduces students to aerospace fundamentals through simulation sessions, model fabrication, and safety-first launch planning.',
    'Wind tunnel demo planning session meets next Monday in the engineering makerspace.',
    'The propulsion reading group has opened a beginner track for spring quarter.',
    'rocketworks@g.ucla.edu',
    'Mondays, 7:00 PM',
    'Engineering VI',
    36,
    'steady',
    'visible',
    'fc013e14d18e89f69719530bd4b26f0ee1504d21125e33aa3c8ae0890427d5fa'
  ),
  (
    'pacific-design-lab',
    'Pacific Design Lab',
    'engineering',
    'Interdisciplinary studio for product design, fabrication, and critique.',
    'Pacific Design Lab pairs engineering students with designers to turn early concepts into usable physical prototypes. The club emphasizes sketching, testing, and clear presentation.',
    'Portfolio critique night is Friday at 5:00 PM with peer feedback tables.',
    'Members can reserve 3D printer slots for final project week through the club form.',
    'pacificdesign@g.ucla.edu',
    'Fridays, 5:00 PM',
    'Perloff Hall',
    29,
    'needs update',
    'visible',
    'bb6d9dd7fbe53663506e156ef8764b50d75a252b47a3021161058837d9dfc6d2'
  ),
  (
    'bruin-software-union',
    'Bruin Software Union',
    'computer science',
    'A collaborative coding community for students building web apps and tools.',
    'Bruin Software Union helps students ship small software projects in teams. Weekly sessions include code review, product planning, and practical workshops for React, databases, and deployment.',
    'React component clinic meets Wednesday in the Young Research Library collaboration room.',
    'Spring project teams are matching designers and engineers this week.',
    'softwareunion@g.ucla.edu',
    'Wednesdays, 6:00 PM',
    'YRL Collaboration Room',
    72,
    'fresh',
    'visible',
    'd7cd08594a9b4260a4018a46ff3664b07e5962997563e6a73a23d96ff43b6d86'
  ),
  (
    'westwood-data-collective',
    'Westwood Data Collective',
    'computer science',
    'Data science club focused on public datasets, visualization, and campus insights.',
    'Westwood Data Collective teaches students how to clean, analyze, and present data. Members work on short case studies and publish visual reports for practice.',
    'The next notebook lab covers transit data and map-based visualizations.',
    'Beginner Python office hours are moving to Tuesday evenings for the rest of spring.',
    'datacollective@g.ucla.edu',
    'Tuesdays, 7:30 PM',
    'Mathematical Sciences',
    64,
    'steady',
    'visible',
    'd19d04cdecf8c49d07001f334e5f088340da360d654d62a3c2785934a6616890'
  ),
  (
    'ucla-web-builders',
    'UCLA Web Builders',
    'computer science',
    'Student builders practicing frontend, backend, and product collaboration.',
    'UCLA Web Builders runs short build sprints where students create portfolio-ready web projects. The club is beginner-friendly and emphasizes readable code and thoughtful interfaces.',
    'Design systems workshop happens Sunday afternoon in the student activities center.',
    'The spring showcase signup form is open for teams that want feedback.',
    'webbuilders@g.ucla.edu',
    'Sundays, 3:00 PM',
    'Student Activities Center',
    55,
    'fresh',
    'visible',
    '7052aabc27dadd61ed6b6e2b24297fe42fe9469b6c57d38c5d1f05cb584d3ea7'
  ),
  (
    'bruin-venture-circle',
    'Bruin Venture Circle',
    'business',
    'A student entrepreneurship group for pitch practice and startup research.',
    'Bruin Venture Circle brings together students interested in startups, product strategy, and early-stage investing. Members practice concise pitches and analyze emerging markets.',
    'Founder fireside chat preparation meets Thursday in Ackerman Union.',
    'Pitch deck peer reviews are available by appointment this month.',
    'venturecircle@g.ucla.edu',
    'Thursdays, 7:00 PM',
    'Ackerman Union',
    41,
    'steady',
    'visible',
    '0ba6791eef817fb1d4fd466e5706df6c186f80040774733e93e549db0f70ae15'
  ),
  (
    'startup-strategy-society',
    'Startup Strategy Society',
    'business',
    'Case-practice community for students interested in growth and operations.',
    'Startup Strategy Society studies how early companies choose customers, price products, and run operations. Meetings mix short talks with team-based cases.',
    'Market sizing practice night is next Tuesday with three beginner prompts.',
    'Applications for the internal consulting sprint close at the end of the week.',
    'startupstrategy@g.ucla.edu',
    'Tuesdays, 6:30 PM',
    'Bunche Hall',
    38,
    'needs update',
    'visible',
    'c47c9ec5e523d8d0a7b626506b508cbc8ab826804d4b4d8061f9fc2fbcd239d6'
  ),
  (
    'campus-consulting-collective',
    'Campus Consulting Collective',
    'business',
    'Student consulting practice group supporting local and campus organizations.',
    'Campus Consulting Collective gives members a structured way to learn client research, slide writing, and presentation skills through scoped student projects.',
    'Client scoping workshop meets Saturday morning with returning project leads.',
    'New analyst onboarding packets have been posted to the member drive.',
    'campusconsulting@g.ucla.edu',
    'Saturdays, 10:00 AM',
    'Anderson Courtyard',
    52,
    'fresh',
    'visible',
    '3910f112c5387f26f869f69126ae9877d834e4c5be51583003b466c316af8806'
  ),
  (
    'mosaic-bruins',
    'Mosaic Bruins',
    'cultural',
    'Cultural exchange club hosting story nights, food socials, and discussion circles.',
    'Mosaic Bruins creates space for students to share culture through conversation, food, music, and campus events. The club welcomes members from every background.',
    'Community story night takes place Friday evening on the Hill.',
    'Members are invited to suggest themes for the end-of-quarter culture showcase.',
    'mosaicbruins@g.ucla.edu',
    'Fridays, 7:00 PM',
    'De Neve Commons',
    67,
    'steady',
    'visible',
    '3e8fa48259bf5f22454046c7f551554452f3b4d0cafc97240641e3ce1045fae8'
  ),
  (
    'pacific-islander-arts-circle',
    'Pacific Islander Arts Circle',
    'cultural',
    'Arts and heritage group centered on performance, storytelling, and community.',
    'Pacific Islander Arts Circle supports students interested in heritage arts, performance, and cultural education. Meetings include practice sessions and informal discussion.',
    'Spring performance rehearsal is scheduled for Wednesday night.',
    'Costume inventory volunteers are needed before the next showcase rehearsal.',
    'piartscircle@g.ucla.edu',
    'Wednesdays, 8:00 PM',
    'Kerckhoff Hall',
    34,
    'fresh',
    'visible',
    'dfe06e6a10182078f825fe1d6976d029801593092d1b07c7bf96a97ef99d5398'
  ),
  (
    'global-bruins-exchange',
    'Global Bruins Exchange',
    'cultural',
    'A student-led space for international friendship and cross-cultural events.',
    'Global Bruins Exchange connects domestic and international students through small group outings, language tables, and practical campus conversations.',
    'Language table mixer meets next Monday on Bruin Walk.',
    'Host signups are open for the spring welcome picnic.',
    'globalbruins@g.ucla.edu',
    'Mondays, 5:00 PM',
    'Bruin Walk',
    73,
    'steady',
    'visible',
    '1bf6b3d0b1e3ead3d478278bd15bf4d2e982188a3bcf8ffb25c1a922f2858202'
  ),
  (
    'bruin-board-game-society',
    'Bruin Board Game Society',
    'other',
    'Casual strategy, party game, and tabletop nights for students across campus.',
    'Bruin Board Game Society hosts relaxed game nights where students can learn new tabletop games or bring their favorites. No experience is required.',
    'Draft-and-play night is this Saturday in the residence hall lounge.',
    'The club library added five new strategy games for spring quarter.',
    'boardgames@g.ucla.edu',
    'Saturdays, 8:00 PM',
    'Rieber Hall',
    44,
    'fresh',
    'visible',
    '62512fae0c87321ec2fd380e1b2b48944f42997aefb89c50c219ffe748bec0f0'
  ),
  (
    'sunset-service-crew',
    'Sunset Service Crew',
    'other',
    'Volunteer group organizing weekend service trips around Los Angeles.',
    'Sunset Service Crew coordinates approachable volunteer opportunities for students who want to serve local communities and meet new people.',
    'Beach cleanup carpool leaves from campus at 9:00 AM on Sunday.',
    'Drivers are needed for two upcoming food bank volunteer shifts.',
    'sunsetservice@g.ucla.edu',
    'Sundays, 9:00 AM',
    'Westwood Plaza',
    58,
    'steady',
    'visible',
    'd195b84b36e2cd0a253356539e7d1325e6f1b7c07f86437e21a6aba995ba0117'
  ),
  (
    'westwood-wellness-club',
    'Westwood Wellness Club',
    'other',
    'Peer community for low-pressure wellness events, walks, and study breaks.',
    'Westwood Wellness Club organizes accessible activities that help students reset during busy weeks. Events include walks, tea socials, and quiet study breaks.',
    'Sunset walk meets outside Powell Library this Thursday.',
    'The spring finals care package packing shift is open for volunteers.',
    'westwoodwellness@g.ucla.edu',
    'Thursdays, 5:30 PM',
    'Powell Library',
    46,
    'needs update',
    'visible',
    'dcb799f29aff5c97454e6c24d5f8b4adfdb80676d392518c70fc776448f1bc4b'
  )
on conflict (slug) do nothing;
