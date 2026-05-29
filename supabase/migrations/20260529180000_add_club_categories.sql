alter table public.clubs
  drop constraint if exists clubs_category_check;

alter table public.clubs
  add constraint clubs_category_check
  check (category in ('engineering', 'computer science', 'business', 'cultural', 'volunteering', 'games', 'art', 'music', 'media', 'food', 'other'));

alter table public.club_registration_requests
  drop constraint if exists club_registration_requests_category_check;

alter table public.club_registration_requests
  add constraint club_registration_requests_category_check
  check (category in ('engineering', 'computer science', 'business', 'cultural', 'volunteering', 'games', 'art', 'music', 'media', 'food', 'other'));
