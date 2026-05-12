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
- Clear empty state when there are no pending requests.
- Clear success/error state after admin action.

## Security Notes

- Do not commit the admin password.
- Keep admin password in an environment variable, such as `BRUINLINK_ADMIN_PASSWORD`.
- Do not expose pending request data publicly.
- Do not collect student ID in the baseline MVP.
- Do not allow registration submission to write directly to `clubs`.
- Do not allow approval/rejection without admin verification.
- Do not store plaintext edit codes.
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

- Final Supabase project credentials and schema are not available yet.
- Edit-code hash/compare implementation needs to match teammate's club sign-in work once that code lands.
- Final DB field names need confirmation once the Supabase schema exists.

## Answered Questions

1. `/register` will be a standalone page.
2. Approved requests automatically generate a unique random edit code.
3. The first admin page includes existing-club hide and permanent delete.
4. Rejection notes are optional.
5. Admin notification email is optional and should wait until the core admin page works.
6. Registration will not include verification notes in the first implementation.
7. The admin password lives in `.env`; the project owner distributes it outside the app.
