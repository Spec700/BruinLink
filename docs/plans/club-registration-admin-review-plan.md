# Club Registration and Admin Review Plan

## Purpose

This plan defines how BruinLink will add a controlled club registration path without overlapping with the current Supabase/edit-mode work.

The feature should let prospective club representatives submit new club listing requests, keep those requests unpublished by default, and give a project admin a protected place to approve or reject them.

## Product Outcome

The MVP should support this flow:

1. A user clicks a "Register a Club" entry point from the homepage.
2. The user submits required club and responsible-contact information.
3. The request is stored as `pending`.
4. The request does not appear in the public directory.
5. An admin signs in to `/admin`.
6. The admin reviews pending requests.
7. The admin approves or rejects each request.
8. Approved requests become visible public club pages and receive an auto-generated club edit code.
9. Rejected requests remain unpublished.

## Implementation Progress

Status as of this branch:

- Completed: PRD updated for registration/admin review scope.
- Completed: this planning document created as the source of truth.
- Completed: locked decisions recorded for `/register`, `/admin`, env-var admin password, optional rejection notes, hide/delete semantics, blank initial event/announcement sections, and `BL-XXXX-XXXX` edit codes.
- Completed: shared registration domain helpers added in `src/lib/clubRegistration.ts`.
- Completed: local sample admin data added in `src/lib/adminSamples.ts` for pre-Supabase UI development.
- Completed: registration page added at `src/app/register/page.tsx` with `src/components/ClubRegistrationForm.tsx`.
- Completed: homepage entry points added for `/register` and `/admin`.
- Completed: admin page added at `src/app/admin/page.tsx` with `src/components/AdminReviewPanel.tsx`.
- Completed: admin password server action added at `src/app/admin/actions.ts`, reading `BRUINLINK_ADMIN_PASSWORD`.
- Completed: `.env.example` added with `BRUINLINK_ADMIN_PASSWORD=`.
- Completed: pre-Supabase admin interactions implemented against sample state: approve, reject, generated edit-code display, hide, and permanent delete confirmation.
- Completed: `npm run lint` passes.
- Completed: `npm run build` passes and includes `/register` and `/admin`.
- Completed: browser verification against localhost using ruflo.
- Pending until Supabase is ready: real persistence, request approval writes, club hide/delete writes, and public DB reads.

Implementation notes:

- `src/lib/clubRegistration.ts` currently owns registration input types, validation, category checks, slug generation, edit-code format validation, `BL-XXXX-XXXX` code generation, and a SHA-256 hash helper placeholder.
- `src/lib/adminSamples.ts` intentionally contains deterministic sample requests and maps seeded clubs into admin-manageable records. This is UI scaffolding only and should be replaced by Supabase reads later.
- The registration form validates locally and shows a pending-review success state. It does not persist requests until Supabase is wired.
- The admin page verifies the password through a server action, then uses local component state for sample request and club-management interactions.
- TypeScript caught and fixed the distinction between draft form input, where category can be blank, and stored registration requests, where category must be a valid `ClubCategory`.
- Browser verification found the original category select and top-only submit were awkward to test and weaker UX. Category is now explicit segmented buttons, and the form has a bottom submit action for long-form completion.
- Browser verification found native `window.confirm` blocked automation for delete. Delete now uses an in-app two-step confirmation: first click arms deletion, second click confirms.
- Verified in browser: homepage entry points render, `/register` success state appears after valid input, `/admin` password gate accepts `BRUINLINK_ADMIN_PASSWORD`, approval emits a `BL-XXXX-XXXX` edit code, rejection removes a request from pending, hide changes club visibility, and delete removes a club after confirmation.

May 13 Supabase implementation checkpoint:

- Completed: user confirmed seeded 15-club directory is desired for the MVP.
- Completed: `@supabase/supabase-js` installed for this branch.
- Completed: `.env.example` updated with Supabase URL, anon key, and server-only service role key placeholders.
- Completed: initial migration drafted at `supabase/migrations/20260513090000_init_bruinlink_schema.sql`.
- Completed: migration creates `clubs`, `club_registration_requests`, updated-at triggers, visible-only public club read policy, approval RPC, and 15 seeded club rows with hashed edit codes only.
- Completed: public and server-only Supabase client helpers added.
- Completed: static club array replaced with async visible-club reads.
- Completed: homepage now receives visible clubs from Supabase.
- Completed: club detail pages now fetch visible DB rows and 404 for hidden/missing clubs.
- Completed: registration form now calls a server action that validates and inserts a pending request.
- Completed: admin auth now uses an HTTP-only admin session cookie after password verification.
- Completed: admin panel now reads pending requests/clubs from Supabase and calls server actions for approve, reject, hide, and delete.
- Completed: `npm run lint` passes.
- Completed: `npx tsc --noEmit` passes.
- Completed: `supabase db push --dry-run` showed exactly one pending migration.
- Completed: remote migration pushed successfully.
- Completed: REST probe confirms anon-visible `clubs` returns 15 seeded visible clubs.
- Completed: REST probe confirms `club_registration_requests` exists and exposes no rows to anon reads.
- Completed: production build passes.
- Completed: browser verification confirmed homepage reads 15 clubs from Supabase.
- Completed: browser verification submitted a new registration request and confirmed it appeared in the admin pending queue.
- Completed: browser verification approved the pending request, generated a `BL-XXXX-XXXX` edit code, and showed the approved club publicly.
- Completed: browser verification hid an on-screen club through the admin UI and confirmed public visible count changed accordingly.
- Completed: browser verification used the two-step admin delete UI on a disposable approved club and confirmed the club count returned to 15.
- Completed: temporary verification club/request were removed from Supabase and the hidden seed club was restored; final remote check shows 15 total clubs, 15 visible clubs, and 0 registration requests.
- Completed: `next` patched from `16.2.4` to `16.2.6`, removing the high-severity `npm audit --omit=dev` finding.
- Completed: PRD updated with the implemented Supabase/RLS/service-role/admin-session architecture.
- Note: `npm audit --omit=dev` still reports a moderate PostCSS advisory under Next, but the suggested `npm audit fix --force` path would install a breaking Next version path, so it was not applied.

## Ownership Boundaries

To avoid overlapping with teammate work:

- Teammate owns Supabase setup, DB-backed club freshness, per-club code verification, edit mode, inline edit buttons, and club content saving.
- This branch owns registration request UX, admin review UX, request data contract, validation plan, and the approval flow design.
- Shared boundary: final Supabase table names, field names, and server actions must match between both workstreams.

## MVP Scope

Required:

- Homepage entry point for club registration.
- Standalone registration form route at `/register`.
- Required fields:
  - responsible contact name
  - responsible contact email
  - club name
  - category
  - short description
  - about
  - meeting time
  - meeting location
  - public student contact email
- Validation before creating a pending request.
- Protected admin page.
- Pending request list.
- Approve request.
- Reject request.
- Approved requests create public club records.
- Approved requests automatically generate a unique random edit code.
- Admin can hide existing clubs from the public directory.
- Admin can permanently delete existing clubs.
- Pending and rejected requests stay out of public search/filter results.

Optional after the required path works:

- Admin internal review notes.
- Email notification to an admin when a request is submitted.

Explicitly not in scope for this feature:

- Student accounts.
- Full UCLA ownership verification.
- Multi-admin roles.
- Email approval links.
- Club creation directly from the club dashboard.

## Recommended Routes

- `/register` - public registration request form.
- `/admin` - protected admin review page.

Using `/register` keeps the homepage clean while still allowing a prominent homepage button. A modal can be added later, but the route is simpler to test, link, and wire to server actions. `/admin` is acceptable for the MVP because the page is still protected by the admin password.

## Locked Decisions

- The registration surface is `/register`, linked from the homepage.
- The admin surface is `/admin`.
- Admin access uses an environment variable, not a DB-stored secret, for the MVP.
- Rejection notes are optional.
- Hiding a club is the soft-delete behavior: hidden clubs stay in the DB but do not appear publicly.
- Deleting a club is a true permanent delete.
- Registration requests do not ask for Upcoming Events or Announcements in the first implementation.
- Registration requests do not ask for verification notes in the first implementation.
- When a request is approved, the new club starts with blank Upcoming Events and Announcements sections.
- Approval auto-generates a unique random edit code.
- The edit code format is always `BL-XXXX-XXXX`, where each `X` is an uppercase letter `A-Z` or digit `0-9`.
- Admins distribute the generated edit code to the responsible contact person outside the app.

## Data Contract

Final Supabase tables should support at least the following fields.

### `clubs`

- `id`
- `name`
- `slug`
- `category`
- `short_description`
- `about`
- `upcoming_events`
- `announcements`
- `contact_info`
- `meeting_time`
- `location`
- `visibility_state`
- `edit_code_hash`
- `last_edited_at`
- `created_at`
- `updated_at`

Allowed `visibility_state` values:

- `visible`
- `hidden`

### `club_registration_requests`

- `id`
- `requester_name`
- `requester_email`
- `club_name`
- `category`
- `short_description`
- `about`
- `meeting_time`
- `meeting_location`
- `public_contact_email`
- `status`
- `admin_note`
- `reviewed_at`
- `created_at`
- `updated_at`

Allowed `status` values:

- `pending`
- `approved`
- `rejected`

Allowed `category` values:

- `engineering`
- `computer science`
- `business`
- `cultural`
- `other`

## Validation Rules

Registration request validation:

- Required text fields must be non-empty after trimming.
- Category must be one of the five allowed categories.
- Responsible contact email must be a valid email format.
- Public contact email must be a valid email format.
- Club name must produce a valid slug.
- Duplicate slug should be rejected or handled by asking the admin to resolve it before approval.

Admin approval validation:

- Admin access must be verified before pending requests are shown.
- Only `pending` requests can be approved or rejected.
- Approval must create one public club record.
- Approval must generate one edit code in `BL-XXXX-XXXX` format.
- Approval must store only the edit-code hash, not the plaintext edit code.
- Approval should show the plaintext edit code to the admin once after creation.
- Approval should initialize `upcoming_events` and `announcements` as blank strings.
- Approval must mark the request as `approved`.
- Rejection must mark the request as `rejected`.
- Rejection notes are optional.
- Failed approval must not partially create a public club.

Existing club admin validation:

- Hide requires admin access and sets `visibility_state` to `hidden`.
- Public reads must exclude clubs where `visibility_state` is not `visible`.
- Delete requires admin access and permanently deletes the selected club.
- Delete should use a confirmation UI because it is destructive.

Edit code generation:

- Generate codes with a cryptographically secure random source.
- Use only uppercase `A-Z` and digits `0-9`.
- Format every code as `BL-XXXX-XXXX`.
- Check for collisions before saving; if a collision is detected, generate a new code.
- Store a server-side hash of the code in `clubs.edit_code_hash`.
- Never store or log plaintext edit codes.

## Implementation Sequence Before Supabase Is Ready

1. Create shared TypeScript types for club records and registration requests.
2. Create validation helpers for category, required strings, email fields, and slug generation.
3. Create an edit-code generation helper that always returns `BL-XXXX-XXXX`.
4. Create an edit-code hashing helper behind a small interface so the hash implementation can match teammate DB work later.
5. Build `/register` UI against the final field contract.
6. Build `/admin` UI against the final field contract.
7. Add server-action/API placeholders only if they match the final Supabase shape.
8. Use deterministic local sample data only to develop and verify UI states while Supabase is unavailable.
9. Keep data access isolated so Supabase can replace the local sample implementation without changing page/component contracts.

The local sample implementation should be treated as scaffolding for UI development, not as an alternate production persistence path.

## Supabase Integration Sequence

Once the DB is ready:

1. Add Supabase client/server utilities.
2. Replace hard-coded club reads with DB reads for approved, visible clubs.
3. Wire registration submission to insert a `pending` row into `club_registration_requests`.
4. Wire admin login/access to the agreed admin-password mechanism.
5. Wire admin pending request fetch.
6. Wire approve action:
   - verify request is pending
   - derive slug
   - generate unique `BL-XXXX-XXXX` edit code
   - hash edit code for storage
   - create `clubs` row
   - initialize blank Upcoming Events and Announcements
   - mark request approved
   - return plaintext edit code once to the admin success UI
7. Wire reject action:
   - verify request is pending
   - mark request rejected
   - optionally save an admin note
8. Wire hide action:
   - verify admin access
   - set `visibility_state` to `hidden`
9. Wire delete action:
   - verify admin access
   - permanently delete selected club after confirmation
10. Verify public directory only reads approved, visible clubs.
11. Coordinate with teammate so club edit-code verification uses the same hash/compare logic.

## Supabase Readiness Check - May 13, 2026

Current repo state:

- Current working branch: `codex/club-registration-admin-review`.
- Registration/admin branch is clean and contains the pre-Supabase UI scaffolding.
- After `git fetch origin`, `origin/main` still points at the older dashboard prototype commit and does not include the Supabase work.
- The Supabase work is present on `origin/backend-with-supabase` at commit `128cb1a`.
- For integration planning, treat `origin/backend-with-supabase` as the source of the teammate DB/edit-mode work unless `main` is updated again before implementation starts.

Local environment check:

- `.env` exists locally.
- `NEXT_PUBLIC_SUPABASE_URL` is present.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is present.
- A server-only privileged key is present locally as `SUPABASE_SERVICE_ROLE_KEY`; it should be used only by server actions that approve, reject, hide, and delete.
- A read-only Supabase REST request reaches the project successfully.
- `clubs` currently returns `PGRST205` table-not-found.
- `club_registration_requests` currently returns `PGRST205` table-not-found.
- Conclusion: credentials are usable, but the public schema is not created yet from the anon client's perspective. The database is not merely empty; required tables are currently missing.

CLI/link readiness:

- User installed/ran Supabase CLI setup steps through `npx supabase`.
- Local Supabase CLI version observed: `2.98.2`.
- `supabase/config.toml` now exists from `supabase init`.
- Local project is linked to Supabase project ref `juisaedunesjpbpqsfan`.
- `supabase/.gitignore` excludes `.temp`, so local link metadata should stay out of git.
- User added `SUPABASE_SERVICE_ROLE_KEY` to local `.env`; the key is present but was not printed.
- No migration has been created or pushed yet.
- When implementation is greenlit, create a migration under `supabase/migrations`, run `supabase db push --dry-run`, inspect the output, then run `supabase db push` only if the dry run is correct.

Observed teammate Supabase branch shape:

- Adds `@supabase/supabase-js`.
- Adds `src/lib/supabase.ts` with env-based client setup.
- Replaces hard-coded public club reads with Supabase reads.
- Adds per-club sign-in through a 4-digit `edit_pin`.
- Adds `club_session` cookie-based club edit authorization.
- Adds `ClubPageEditor` for owner-only editing of page sections.
- Adds `supabase/seed.sql` with a `clubs` table and seed data.

Observed `clubs` table fields from `origin/backend-with-supabase`:

- `id`
- `slug`
- `name`
- `category`
- `short_description`
- `about`
- `upcoming_events`
- `announcements`
- `contact_info`
- `meeting_time`
- `location`
- `members`
- `status`
- `edit_pin`
- `created_at`
- `updated_at`

Schema gaps relative to the registration/admin plan:

- Missing `club_registration_requests`.
- Missing `visibility_state` for admin hide/soft-delete behavior.
- Missing `edit_code_hash`.
- Uses plaintext 4-digit `edit_pin`, while the locked product decision is `BL-XXXX-XXXX` edit codes with only a hash stored.
- Existing public reads do not filter out hidden clubs because hide state does not exist yet.
- Existing RLS policy in the seed script allows all updates, which is too broad for the final MVP shape.

Recommended DB integration approach:

1. First integrate the Supabase branch code into `codex/club-registration-admin-review` or update this branch from the eventual merged `main`, resolving UI conflicts deliberately.
2. Keep the registration/admin UI from this branch and the club sign-in/edit-mode pieces from the Supabase branch.
3. Replace the 4-digit PIN contract with the locked `BL-XXXX-XXXX` edit-code contract, unless the team explicitly changes the PRD decision.
4. Update the Supabase schema before wiring UI actions:
   - create `club_registration_requests`
   - add `visibility_state` to `clubs`
   - replace `edit_pin` with `edit_code_hash`
   - keep `status` for freshness
   - keep `members` for current UI
5. Wire data access through small server-side functions/actions rather than direct component queries.
6. Use the anon key only for public-safe operations, such as visible club reads and pending registration inserts.
7. Use a server-only privileged Supabase client for admin writes after the app-level admin password check.
8. Make public reads return only visible clubs.
9. Make registration submission insert only into `club_registration_requests`.
10. Make admin approval create the public club row, generate one plaintext code, store only the hash, mark the request approved, and return the plaintext code once to the admin UI.
11. Make rejection, hide, and delete admin-only server actions.
12. Re-run lint, build, and browser verification after the merge and DB schema are in place.

Implementation should not start until the team confirms whether to preserve the locked `BL-XXXX-XXXX` edit-code decision or adopt the teammate branch's current 4-digit PIN design.

## UI Plan

Homepage:

- Add a visible "Register a Club" button near the directory header or utility area.
- Keep student discovery as the main homepage task.

Registration page:

- Clear form grouped by:
  - Responsible contact
  - Public club profile
  - Meeting details
- Do not ask for Upcoming Events or Announcements in the first implementation.
- Do not ask for verification notes in the first implementation.
- Submission success state should explain that the listing is pending admin review.
- Failure state should explain which fields need attention.

Admin page:

- Password gate first.
- Pending requests table/list.
- Request detail view or expandable panel.
- Approve and Reject buttons.
- Optional rejection note field.
- Approval success state shows the generated edit code exactly once.
- Existing clubs section with Hide and Delete controls.
- Existing clubs section should support Unhide for hidden clubs.
- Existing clubs section should support search/filter controls so admins can quickly find a club.
- Clear empty state when there are no pending requests.
- Clear success/error state after admin action.

## Planned Admin Refinements - May 13, 2026

User feedback after seeing the DB-backed admin dashboard:

1. Confirmed question: the registration flow should be fully end-to-end, meaning a public request from `/register` appears in `/admin`, approval creates the public club, and the club then appears in the directory.
2. Gap: hidden clubs currently cannot be restored from the admin UI.
3. Gap: existing clubs are listed in a scrollable panel, but there is no search/filter control for larger club sets.

Current answer to item 1:

- Yes, this has already been implemented and browser-verified on this branch.
- Verified path: submit `/register` form -> pending request appears in `/admin` -> admin approves -> generated `BL-XXXX-XXXX` code appears once -> new club appears in public directory.
- Verification data was cleaned up afterward, so the remote DB is back to the seeded 15 clubs and 0 pending requests.

Planned unhide behavior:

- Admin panel should show hidden clubs in the Existing clubs list.
- Visible clubs should show `Hide` and `Delete`.
- Hidden clubs should show `Unhide` and `Delete`.
- `Unhide` should call a server action after admin-session validation.
- Server action should set `clubs.visibility_state` from `hidden` to `visible`.
- Public directory and club page revalidation should run after unhide.
- Metrics should continue to show visible count and total count; optionally add a hidden count if the UI has room.
- The public directory should continue filtering to `visibility_state = 'visible'`, so hidden clubs stay private until unhidden.

Planned existing-club search/filter behavior:

- Add a search input above the Existing clubs list in `/admin`.
- Search should match at least club name, category label, meeting location, and public contact email.
- Add a simple visibility filter with `All`, `Visible`, and `Hidden`.
- Keep filtering client-side because the admin page already fetches the manageable club list and the MVP data set is small.
- The filtered list should preserve alphabetical ordering from the server data.
- The empty state should distinguish between no clubs existing and no clubs matching the current filters.

Implementation sequence for these refinements:

1. Add an `unhideClub` data helper beside `hideClub`.
2. Add `unhideClubAction` in `src/app/admin/actions.ts`.
3. Update `AdminReviewPanel` to keep `clubSearchQuery` and `clubVisibilityFilter` client state.
4. Derive `filteredManagedClubs` with `useMemo`.
5. Add search input and visibility segmented controls above the Existing clubs list.
6. Change managed club card actions to show `Hide` for visible clubs and `Unhide` for hidden clubs.
7. Verify in browser: hide a club, confirm it disappears publicly, unhide it, confirm it returns publicly.
8. Verify in browser: search narrows the Existing clubs list and visibility filters show the right groups.

Admin refinement implementation checkpoint:

- Completed: `src/lib/adminReviewData.ts` now includes an admin-only `unhideClub` helper that sets `clubs.visibility_state` back to `visible` and revalidates the directory, club detail page, and admin page.
- Completed: `src/app/admin/actions.ts` now exposes `unhideClubAction`, guarded by the existing admin session check.
- Completed: `src/components/AdminReviewPanel.tsx` now keeps client-side search text and `All`/`Visible`/`Hidden` filter state for the Existing clubs panel.
- Completed: existing club cards now show `Hide` for visible clubs and `Unhide` for hidden clubs, while keeping permanent delete available in both states.
- Completed: the Existing clubs list search matches club name, category value, category label, public contact email, meeting time, location, and visibility state.
- Completed: `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass after these edits.
- Completed: browser verification on localhost confirmed search narrows the Existing clubs list, the Hidden filter shows the empty filtered state when no hidden clubs exist, hiding a visible club removes it from public directory reads, and unhide restores it to public directory reads.
- Completed: direct Supabase sanity check after verification shows 15 total clubs, 15 visible clubs, and 0 hidden clubs, so the seeded data was restored after the reversible hide/unhide test.

## Planned Registration UX and Edit-Code Recovery - May 13, 2026

User feedback after using `/register` and approving a request:

1. The registration success notification should appear near the bottom submit button, not near the top of the form.
2. The extra top submit button is unnecessary because the primary submit action lives at the bottom of the long form.
3. Club representatives may forget their edit code, and admins need a secure recovery path.

Locked recovery decision:

- BruinLink should not store plaintext edit codes.
- Supabase stores only `clubs.edit_code_hash`.
- Admins should not be able to retrieve the old plaintext code because it is intentionally one-way hashed.
- Recovery should be handled by admin-triggered regeneration.
- Regeneration should generate a new unique `BL-XXXX-XXXX` code, replace `clubs.edit_code_hash`, and show the plaintext code once to the admin.
- The previous code should stop working immediately after regeneration.
- Admins distribute regenerated codes outside the app for the MVP.

Implementation sequence:

1. Remove the top submit button from `ClubRegistrationForm`.
2. Move registration success and form-level error messages to the bottom action area, directly above the bottom submit row.
3. Add `regenerateClubEditCode` beside the approval code-generation helper.
4. Add `regenerateClubEditCodeAction` in admin server actions after admin-session validation.
5. Add a `Regenerate code` control to existing-club admin cards.
6. Reuse the existing success notice code-display pattern so regenerated plaintext codes are shown once.
7. Verify `/register` success appears near the bottom action.
8. Verify admin regeneration returns a `BL-XXXX-XXXX` code and updates the stored hash.

Implementation checkpoint:

- Completed: `/register` now has only the bottom `Submit request` button.
- Completed: registration success and form-level error summaries now render in the bottom action area, directly above the submit row.
- Completed: `src/lib/adminReviewData.ts` now supports admin-only edit-code regeneration by generating a unique `BL-XXXX-XXXX`, hashing it, replacing `clubs.edit_code_hash`, and returning the plaintext code once.
- Completed: `src/app/admin/actions.ts` exposes `regenerateClubEditCodeAction` behind the existing admin-session requirement.
- Completed: each existing-club card in `/admin` now includes a `Regenerate code` control.
- Completed: regenerated codes reuse the one-time admin notice display pattern used by approvals.
- Completed: `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass after these edits.
- Completed: browser verification submitted a disposable request, confirmed only one submit button exists, confirmed the success message appears above the bottom submit row, approved the request, regenerated its edit code, and confirmed the stored hash changed in Supabase.
- Completed: disposable verification club and request rows were removed after testing.
- Final verification state after cleanup: 16 total clubs, 16 visible clubs, 0 hidden clubs, 1 approved historical registration request, and 0 pending requests.

## Security Notes

- Do not commit the admin password.
- Keep admin password in an environment variable, such as `BRUINLINK_ADMIN_PASSWORD`.
- Do not expose pending request data publicly.
- Do not collect student ID in the baseline MVP.
- Do not allow registration submission to write directly to `clubs`.
- Do not allow approval/rejection without admin verification.
- Do not store plaintext edit codes.
- Forgot-code recovery should regenerate and replace the hashed edit code instead of retrieving old plaintext codes.
- Treat permanent delete as destructive and require confirmation in the UI.

## Testing and Verification

Before Supabase:

- Form validation rejects missing fields.
- Category validation rejects invalid values.
- Success and error UI states render cleanly.
- Admin page can display pending, empty, approved, and rejected states from sample data.
- Admin page can display existing clubs with hide/delete controls from sample data.
- Edit-code generation always returns `BL-XXXX-XXXX`.
- Public directory remains focused on approved clubs only.

After Supabase:

- Registration creates a pending request row.
- Pending request is visible only in admin view.
- Pending request is not visible in public search/filter results.
- Approval creates one public club page.
- Approval generates an edit code in `BL-XXXX-XXXX` format.
- Approval stores the edit-code hash, not plaintext.
- Rejection does not create a public club page.
- Hide removes a club from public directory/page reads without deleting the row.
- Delete permanently removes the selected club.
- Admin password is required for review actions.
- Lint and production build pass.

## Blockers

- No current blocker for the registration/admin-review MVP path on this branch.
- Coordination remains needed before merging with teammate work because `origin/backend-with-supabase` uses plaintext 4-digit pins, while this branch implements the confirmed hashed `BL-XXXX-XXXX` edit-code contract.
- `npm audit --omit=dev` still reports a moderate PostCSS advisory nested under Next. The high-severity Next audit finding was removed by patching to `next@16.2.6`; the remaining forced fix path is not appropriate without a deliberate dependency-upgrade decision.

## Answered Questions

1. `/register` will be a standalone page.
2. Approved requests automatically generate a unique random edit code.
3. The first admin page includes existing-club hide and permanent delete.
4. Rejection notes are optional.
5. Admin notification email is optional and should wait until the core admin page works.
6. Registration will not include verification notes in the first implementation.
7. The admin password lives in `.env`; the project owner distributes it outside the app.
