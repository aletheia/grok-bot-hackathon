# Portal update plan: Luma sign-in, teams 4–6, team lock, admission

Status: plan for PR #1 (branch `feat/grok-hackathon-pavia-landing`). Based on Luca's answers of 2026-10-20.

## 0. What exists today (reused)

- **Auth**: Better Auth 1.7. Participants sign in with Google OAuth (`/register`); admins and staff use email+password, admins also need TOTP 2FA. A Resend sender is already in `lib/email/send.ts` (`RESEND_API_KEY`, `EMAIL_FROM`).
- **Teams**: `team`, `team_member`, `team_invite` tables plus `lib/teams/service.ts`. It already has:
  - create, join by code, leave, remove, transfer lead;
  - 8-char invite codes from a 32-char unambiguous alphabet (`crypto.randomBytes`, unique index);
  - one active team per user (partial unique index);
  - `SELECT … FOR UPDATE` on the team row when joining;
  - a check constraint `member_count <= max_members`;
  - the size cap, which is currently 5.
- Admin: users / teams / screening / credits / staff pages, gated by super admin + 2FA.

## 1. Content changes (landing + portal)

1. **Asset placeholders** in `lib/event.ts` (`EVENT.assets`): logos (SpaceXAI, Ctrl+Alt Museum, comPVter), photos (Ralph Johnson, each host). Each is `null` until Luca provides it. Landing components render a labelled dashed placeholder ("Logo: SpaceXAI, coming soon") when the value is `null`, and the real image or link once set.
2. **Announcement-driven sections**: `EVENT.tracks`, `EVENT.prizes`, `EVENT.jury` and `EVENT.criteria` are typed arrays, all empty for now. An empty array renders a "To be announced" card; a filled one renders the list. No invented content.
3. **English only**: remove the language switcher, the Italian copy, the DE/ES page copy and the onboarding language toggle. `lib/i18n.ts` becomes plain English strings, and `Localized` values in `lib/event.ts` become plain strings.
4. **Time zone**: the admin project deadline and every displayed time use `Europe/Rome`, DST-correct. Helpers live in `lib/time/rome.ts` (`romeLocalToUtc`, `utcToRomeLocal`, `formatRome`) and use `Intl` offsets, not a fixed +5/+1.

## 2. Sign in with the Luma email (allowlist)

- **New table `luma_registrant`**:
  - `email` (PK, lower-cased, trimmed)
  - `name`
  - `luma_status` (the CSV `approval_status`, raw text)
  - `luma_registered_at` (the CSV `created_at`, nullable)
  - `imported_at`, `updated_at`
- **Admin import** at `/admin/dashboard/luma`: paste or upload the Luma guest-list CSV export.
  - The parser in `lib/luma/csv.ts` handles a UTF-8 BOM, CRLF, quoted fields with commas/quotes/newlines, and header variants case-insensitively:
    - email: `email`, `e-mail`, `email address`, `guest email`
    - name: `name`, `full name`, `guest name`, or `first_name` + `last_name`
    - status: `approval_status`, `approval status`, `status`
    - registered: `created_at`, `registered_at`, `registration date`, `created at`
  - Rows are upserted by email (merge, never deletes). The admin gets back counts: inserted, updated, skipped (no or invalid email), duplicates in file.
- **Who may sign in**: an email in `luma_registrant` whose status is not in `EVENT.portal.blockedLumaStatuses` (default: `declined`). *Superseded, see "Decision: approved guests only" below.*
  - Bypass: `SUPER_ADMIN_EMAILS`, users whose role is not `participant` (staff/judges/mentors), and emails with a pending staff invite.
  - Matching is case-insensitive and trimmed (`normalizeEmail`).
- **Mechanism**: Better Auth `emailOTP` plugin. The 6-digit code is sent through the existing Resend sender, with `sign-up` on first sign-in.
  - Gate 1: the before-hook on `/email-otp/send-verification-otp` and `/sign-in/email-otp` rejects non-allowlisted emails with "This email is not on the Luma guest list. Sign in with the same email you used to register on Luma (luma.com/…)". No email is sent to unknown addresses.
  - Gate 2 (defence in depth): a `session.create.before` database hook applies the same check to every sign-in method, Google included.
  - Without `RESEND_API_KEY` in development, the code is logged to the server console.
- **Login page `/register`** (kept as the URL so existing links work): an email field, then a code field. It says clearly "Sign in with the same email you used to register on Luma". The Google button is removed from the UI; the provider stays configurable but is gated.

## 3. Teams

| Rule | Implementation |
|---|---|
| Size 4–6 | `TEAM_LIMITS.minMembers = 4`, `maxMembers = 6`; migration widens the check to `max_members <= 6`, default 6, and sets `max_members = 6` on existing active teams |
| Close at 6 | join rejected when `member_count >= max_members`; enforced under the team row lock (`FOR UPDATE`) **and** by the DB check constraint, so concurrent joins cannot exceed 6 |
| Reopen | a leave decrements `member_count`; a team below 6 accepts joins again (derived `isOpen`) |
| Secret code | reuse the invite code: 8 chars, alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`, `crypto.randomBytes` (unbiased: 256 % 32 = 0), unique index, retry on collision; shown to members with a copy button |
| One team per user | existing partial unique index on `team_member(user_id) where left_at is null` |
| Leaving | anyone can leave. If the leaving member is the lead and others remain, the lead role goes automatically to the **earliest-joined remaining member** (`joined_at`, then id). The last member leaving archives the team (soft delete: hidden everywhere, code revoked, history kept) |
| Available to join | new columns `user.available_for_team_at` (null = not available) and `user.available_note` (≤ 280 chars, written by the participant, e.g. skills and how to reach them). Listed to signed-in members of teams that are still open: name + note + since. **No email is exposed.** Cleared automatically on create/join |
| Lock | `EVENT.portal.teamLockAt = "2026-10-31T23:59:00+01:00"` (Rome, CET after DST ends on 25 Oct). After it, create/join/leave/remove/available are rejected server-side (`TEAMS_LOCKED`, 409). Admin force-membership stays allowed for corrections. The UI shows a countdown |

## 4. Admission after lock (admin view, no emails)

- **Formed team**: an active team with `member_count >= 4` at lock. All its members get guaranteed seats.
- `guaranteed = Σ members of formed teams`; `remaining = max(0, EVENT.registration.capacity (100) − guaranteed)`.
- **FCFS queue**: everyone else who may attend, meaning allowlisted Luma registrants (not blocked) who are not in a formed team. That covers solo people, people marked available, people in teams under 4, and registrants who never signed in to the portal (flagged).
- **Order key**: Luma registration time (`luma_registered_at`, from the CSV `created_at`). Fallbacks: the portal account creation time (`user.created_at`), then `imported_at`; ties broken by email.
- The first `remaining` people in the queue are marked "admitted", the rest "waitlist".
- Pure function `computeAdmission()` in `lib/teams/admission.ts`, unit-tested. Page at `/admin/dashboard/admission`, which shows "provisional" before the lock.

## 5. Rules

- `/rules` page (public) "How teams work": sign in with the Luma email; create, join with code or mark yourself available; 4–6 members; auto-close at 6; leaving and lead hand-over; lock on 31 Oct 23:59 Rome time; guaranteed seats for teams of 4+; everyone else first-come, first-served.
- A short version on the landing (`#teams`) and inline help on the team screen.

## 6. Schema / migration

`drizzle/0012_luma_allowlist_teams.sql` (generated by drizzle-kit), all additive:

- `create table luma_registrant`
- `alter table user add available_for_team_at timestamptz, add available_note text`
- drop and re-add the check `team_max_members_limit_check` (`<= 6`), `alter column max_members set default 6`, `update team set max_members = 6 where status = 'active'`

No data is dropped.

## 7. Env

- `RESEND_API_KEY` and `EMAIL_FROM`: required in production for the sign-in codes.
- `SUPER_ADMIN_EMAILS`: admins bypass the allowlist.
- No other new variables. The deadline and capacity live in `lib/event.ts`.

## 8. Tests (vitest, pure functions)

Code generation (length, alphabet, uniqueness retry); size limits and close at 6; reopen on leave; ownership transfer pick; lock deadline incl. time zone (Rome 23:59 = 22:59Z); Rome DST conversions; allowlist matching (case and whitespace, blocked statuses, bypass); FCFS ordering and seat math; CSV parsing (BOM, quotes, header variants, first+last name, duplicates, invalid emails).

## 9. Out of scope / follow-ups

- No automatic emails about admission.
- `/profile` (a legacy duplicate of the dashboard team UI) redirects to `/dashboard`.
- Screening, scoring and credits flows are unchanged.

## Implementation notes (after building it)

- Migration `0012_luma_allowlist_teams` also adds `two_factor.verified`, `failed_verification_count` and `locked_until`. Better Auth 1.7 (already on `main`) refuses to start its two-factor plugin without them, so every authenticated API call returned 500 on a fresh database. The change only adds columns.
- `nextCookies()` is now the last Better Auth plugin, as Better Auth recommends.
- `https://app.cursorcommunity.uz` (the template's production origin) was removed from `trustedOrigins`.
- Sending a sign-in code tells the person whether their email is on the guest list. That small enumeration risk was accepted so the "not on the list → go to Luma" message is clear. Better Auth's built-in rate limit applies (about 3 requests per minute per IP on that endpoint).
- If Resend fails, Better Auth runs the sender in the background: the person sees the code step but no email arrives, and the error is logged server-side. Configure `RESEND_API_KEY` and `EMAIL_FROM` before going live.

## Decision: approved guests only (Luca, PR #1 review)

- Only confirmed guests may sign in. The Luma `approval_status` value (Luma's API/CSV docs: `approved` = "Going", `pending_approval` = "Pending", `waitlist`, `invited`, `declined` = "Not Going") is normalised (trim, lower case, spaces/hyphens → `_`). A guest passes only if it matches `EVENT.portal.approvedLumaStatuses` = `approved` or `going`.
- Waitlist, pending, invited and empty/unknown statuses get "Your Luma registration isn't approved yet. You can sign in once the organisers approve it on Luma." Declined gets its own declined message. Both use error code `LUMA_NOT_APPROVED`, so they are distinct from "not on the list" (`NOT_ON_GUEST_LIST`). Super admins and staff still bypass.
- The gate runs on every session creation, so after a re-import an existing participant whose status is no longer approved cannot start a new session. Sessions that are already open stay valid until they expire.
- Admission counts only approved guests, both in the FCFS queue and as members of formed teams.
- Empty teams are archived (soft delete), as confirmed.
