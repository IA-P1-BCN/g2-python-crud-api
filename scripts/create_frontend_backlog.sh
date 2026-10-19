#!/usr/bin/env bash
# =============================================================================
# Gym Management Frontend – backlog generator for GitHub Projects
#
# Independent frontend backlog generator. This script does NOT modify the
# existing backend backlog generator. It creates the frontend stories and
# sub-issues from frontend-issues.md for Project #28.
#
# Source backlog: 16 stories / 108 subtasks. E11 already exists as #134;
# this script keeps #134 and creates its 11 frontend subtasks underneath it.
# Issues #135 and #136 are left untouched as requested by the backlog.
#
# Estimate scale: 1 = ~½ day | 2 = ~1 day | 3 = ~2 days | 4 = 3+ days
# Priority:       P0 = must have | P1 = should have | P2 = nice to have
#
# Configuration can be overridden with environment variables, e.g.:
#   REPO=owner/repo PROJECT_OWNER=owner PROJECT_NUMBER=28 bash create_frontend_backlog.sh
#   SKIP_ASSIGNEES=1 bash create_frontend_backlog.sh
#
# Requirements:
#   - gh CLI >= 2.40 and jq
#   - gh auth refresh -s project
#   - Organization repo with Feature/Task issue types enabled
# =============================================================================
set -euo pipefail

# ------------------------------- CONFIG --------------------------------------
REPO="${REPO:-IA-P1-BCN/g2-python-crud-api}"
PROJECT_OWNER="${PROJECT_OWNER:-IA-P1-BCN}"
PROJECT_NUMBER="${PROJECT_NUMBER:-28}"
STORY_TYPE="Feature"
TASK_TYPE="Task"
SKIP_ASSIGNEES="${SKIP_ASSIGNEES:-0}"
# The frontend backlog does not define assignees, so none are invented here.
# Set DEFAULT_ASSIGNEE to assign every newly-created issue to one person.
DEFAULT_ASSIGNEE="${DEFAULT_ASSIGNEE:-}"

command -v gh >/dev/null || { echo "gh CLI not found"; exit 1; }
command -v jq >/dev/null || { echo "jq not found"; exit 1; }

echo "▶ Preparing project fields..."
PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq .id)
gh project field-create "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --name "Priority" \
  --data-type SINGLE_SELECT --single-select-options "P0,P1,P2" >/dev/null 2>&1 || true
gh project field-create "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --name "Estimate" \
  --data-type NUMBER >/dev/null 2>&1 || true
FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json)
PRIORITY_FIELD_ID=$(jq -r '.fields[]|select(.name=="Priority").id' <<<"$FIELDS")
ESTIMATE_FIELD_ID=$(jq -r '.fields[]|select(.name=="Estimate").id' <<<"$FIELDS")
prio_opt() { jq -r --arg p "$1" '.fields[]|select(.name=="Priority").options[]|select(.name==$p).id' <<<"$FIELDS"; }

echo "▶ Creating frontend labels..."
mk_label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }
mk_label "user-story" "1D76DB" "User story"
mk_label "subtask" "C5DEF5" "Sub-task of a user story"
mk_label "frontend" "E99695" "Web UI"
mk_label "atom" "BFDADC" "Frontend backlog level: atom"
mk_label "molecule" "C5DEF5" "Frontend backlog level: molecule"
mk_label "organism" "D4C5F9" "Frontend backlog level: organism"
mk_label "layout" "F9D0C4" "Frontend backlog level: layout"
mk_label "page" "FBCA04" "Frontend backlog level: page"
mk_label "data" "5319E7" "Frontend backlog level: data"
mk_label "setup" "0E8A16" "Frontend backlog level: setup"
mk_label "config" "1D76DB" "Frontend backlog level: config"
mk_label "docs" "0075CA" "Frontend backlog level: docs"

echo "▶ Ensuring milestone exists..."
gh api -X POST "repos/$REPO/milestones" -f title="Phase 4 - Expert" >/dev/null 2>&1 || true

# ------------------------------ HELPERS --------------------------------------
LEVEL=""; MS="Phase 4 - Expert"; CURRENT=""; PRIO=""; ASSIGNEE=""
declare -A ISSUE_BY_TITLE
declare -A NEEDS_BY_ISSUE

create_issue() { # title body labels
  local url
  if [ "$SKIP_ASSIGNEES" != "1" ] && [ -n "$ASSIGNEE" ]; then
    url=$(gh issue create --repo "$REPO" --title "$1" --body "$2" --label "$3" --milestone "$MS" --assignee "$ASSIGNEE")
  else
    url=$(gh issue create --repo "$REPO" --title "$1" --body "$2" --label "$3" --milestone "$MS")
  fi
  sleep 1
  echo "${url##*/}"
}

set_type() { # issue_number type
  gh api -X PATCH "repos/$REPO/issues/$1" -f type="$2" >/dev/null 2>&1 \
    || echo "  ⚠ issue type '$2' not set on #$1 (needs org repo with issue types)"
}

add_to_project() { # issue_number priority estimate
  local item
  item=$(gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" \
         --url "https://github.com/$REPO/issues/$1" --format json --jq .id)
  gh project item-edit --id "$item" --project-id "$PROJECT_ID" --field-id "$PRIORITY_FIELD_ID" \
     --single-select-option-id "$(prio_opt "$2")" >/dev/null
  gh project item-edit --id "$item" --project-id "$PROJECT_ID" --field-id "$ESTIMATE_FIELD_ID" \
     --number "$3" >/dev/null
}

link_sub() { # parent_number child_number
  local cid
  cid=$(gh api "repos/$REPO/issues/$2" --jq .id)
  gh api -X POST "repos/$REPO/issues/$1/sub_issues" -F sub_issue_id="$cid" >/dev/null
}

# Add a real GitHub "blocked by" relationship when the dependency resolves.
# GitHub exposes this through gh issue edit --add-blocked-by.
apply_dependencies() {
  local child needs need blocker
  echo
  echo "▶ Applying frontend issue dependencies..."
  for child in "${!NEEDS_BY_ISSUE[@]}"; do
    needs="${NEEDS_BY_ISSUE[$child]}"
    [ -z "$needs" ] && continue
    IFS="," read -ra need_list <<< "$needs"
    for need in "${need_list[@]}"; do
      need="${need#"${need%%[![:space:]]*}"}"; need="${need%"${need##*[![:space:]]}"}"
      [ -z "$need" ] || [ "$need" = "–" ] && continue
      blocker=""
      case "$need" in
        "Tailwind setup") blocker="${ISSUE_BY_TITLE["Install and configure Tailwind CSS (Vite plugin)"]:-}" ;;
        "Tokens") blocker="${ISSUE_BY_TITLE["Add design tokens (\`theme.css\`) and token docs"]:-}" ;;
        "Folders") blocker="${ISSUE_BY_TITLE["Restructure \`src/\` into atomic design and remove legacy UI"]:-}" ;;
        "cn") blocker="${ISSUE_BY_TITLE["Add \`cn\` class helper"]:-}" ;;
        "Trainer sessions data") blocker="${ISSUE_BY_TITLE["Data: trainer own classes and schedules"]:-}" ;;
        "Backend:"*) blocker="" ;;
        "Pages") blocker="" ;;
        "all dashboard organisms") blocker="" ;;
        "sections") blocker="" ;;
        *) blocker="${ISSUE_BY_TITLE[$need]:-}" ;;
      esac
      if [ -n "$blocker" ]; then
        gh issue edit "$child" --repo "$REPO" --add-blocked-by "$blocker" >/dev/null 2>&1 || \
          echo "  ⚠ Could not set #$child blocked by #$blocker"
      fi
    done
  done
}

# story "Title" "area-labels" PRIORITY ESTIMATE
story() {
  local body; body=$(cat)
  PRIO="$3"
  ASSIGNEE="$DEFAULT_ASSIGNEE"
  CURRENT=$(create_issue "$1" "$body" "user-story,frontend")
  ISSUE_BY_TITLE["$1"]="$CURRENT"
  set_type "$CURRENT" "$STORY_TYPE"
  add_to_project "$CURRENT" "$3" "$4"
  echo "● Story #$CURRENT [$3 · $4] $1"
}

# sub "Title" "level" ESTIMATE "Description" "Needs"
sub() {
  local n body needs
  needs="${5:-}"
  body="$4"
  if [ -n "$needs" ] && [ "$needs" != "–" ]; then
    body="$body"$'\n\n'"**Needs:** $needs"
  fi
  body="$body"$'\n\n'"Part of #$CURRENT"
  ASSIGNEE="$DEFAULT_ASSIGNEE"
  n=$(create_issue "$1" "$body" "subtask,$2,frontend")
  ISSUE_BY_TITLE["$1"]="$n"
  NEEDS_BY_ISSUE["$n"]="$needs"
  set_type "$n" "$TASK_TYPE"
  add_to_project "$n" "$PRIO" "$3"
  link_sub "$CURRENT" "$n"
  echo "    ↳ #$n [$3] $1"
}

# Existing E11 story. Do not recreate or edit #134 itself.
use_existing_e11() {
  CURRENT="134"
  PRIO="P0"
  ASSIGNEE="$DEFAULT_ASSIGNEE"
  echo
  echo "══════ E11 · Trainer sessions page (existing #134) ══════"
  echo "● Keeping existing story #134; adding only its 11 frontend subtasks."
}

# E0 · Frontend foundation: Tailwind, tokens and atomic folders
story 'Frontend foundation: Tailwind, tokens and atomic folders' "" P0 1 <<'EOF'
**User story:** As a developer I want Tailwind, the design tokens and the atomic-design folder structure in place so that every page is built on the same base.

**Acceptance criteria**

- Tailwind v4 works in Vite and the app builds.
- `src/styles/theme.css` (tokens from Figma) is imported and documented in `docs/design-tokens.md`.
- `src/` follows atomic design; the legacy `components/ui` is migrated and removed.
- Lint, format check, tests and build pass.
EOF
sub 'Install and configure Tailwind CSS (Vite plugin)' setup 1 'Add `tailwindcss` and `@tailwindcss/vite` to package.json and update the lockfile. Import `theme.css` after `@import "tailwindcss"`.' '–'
sub 'Add design tokens (`theme.css`) and token docs' setup 1 'Files are generated from Figma. Review the unified palette and the open inconsistencies listed in the docs.' 'Tailwind setup'
sub 'Install and load fonts (Space Grotesk, Inter)' setup 1 'Use `@fontsource-variable/space-grotesk` and `@fontsource-variable/inter`.' 'Tailwind setup'
sub 'Restructure `src/` into atomic design and remove legacy UI' setup 2 'Keep `api/`, `auth/`, `lib/`, `types/`. Migrate Button, Table, Pagination and Alert, then delete `components/ui`. Convention: `components/<level>/<Name>/{Name.tsx, Name.test.tsx, index.ts}`.' Tokens
sub 'Add `cn` class helper' setup 1 '`clsx` + `tailwind-merge`, with a unit test.' 'Tailwind setup'
sub 'Choose the icon library and create the `Icon` atom (atom)' atom 1 'Decision needed before starting: Figma icons are exported SVGs that expire. One wrapper with typed icon names and sizes 16/20/24.' Tokens
sub 'Document component conventions in the frontend README' docs 1 'In Spanish: folders, naming, token rules, how to add a component.' Folders

# E1 · App shell and shared UI kit
story 'App shell and shared UI kit' "" P0 1 <<'EOF'
**User story:** As a developer I want a shared set of atoms, molecules, organisms and layouts so that pages reuse the same components and the UI stays consistent (DRY).

**Acceptance criteria**

- Every component listed here is built once and reused by the pages.
- Role-based navigation (member, trainer, admin) renders from one configuration.
- Each component has tests and meets the common definition of done.
EOF
sub 'Button (atom)' atom 2 'Variants: primary, secondary, white, ghost, danger-outline. Sizes, loading, disabled, optional icon, `full` width. Migrates the existing Button.' 'Folders, cn'
sub 'IconButton (atom)' atom 1 'Round 44px touch target, `aria-label` required.' Icon
sub 'Input (atom)' atom 2 'Pill field with optional left/right icon slot, error state, password reveal handled outside.' Tokens
sub 'Badge (atom)' atom 1 'Chip variants: neutral, primary, secondary, success, danger. Optional status dot.' Tokens
sub 'Avatar (atom)' atom 1 'Sizes 32/40/56, image with initials fallback, optional status dot.' Tokens
sub 'ProgressBar (atom)' atom 1 'Track `line`, fill by variant (primary, secondary-soft, muted), `aria-valuenow`.' Tokens
sub 'Logo (atom)' atom 1 'Mark + name; variant with role subtitle (Admin, Trainer). Product name pending (Athletica vs GymFlow).' Tokens
sub 'Skeleton (atom)' atom 1 'Loading placeholder blocks used by every page.' Tokens
sub 'Toggle (atom)' atom 1 'Accessible switch (role=switch).' Tokens
sub 'FormField (molecule)' molecule 1 'Label + Input + helper/error text, wired with `htmlFor` and `aria-describedby`.' Input
sub 'SearchInput (molecule)' molecule 1 'Input with search icon and clear button, debounced `onChange`.' Input
sub 'StatCard (molecule)' molecule 2 'Label, big number, optional delta badge and progress. Variants: surface, secondary.' 'Badge, ProgressBar'
sub 'AvatarStack (molecule)' molecule 1 'Overlapping avatars with `+N` counter.' Avatar
sub 'ProfileGreeting (molecule)' molecule 1 'Avatar + greeting + subtitle (plan or date). Used by member and trainer home.' Avatar
sub 'Alert (molecule)' molecule 1 'Migrate the existing one. Variants: error, success, info; dismissible.' Folders
sub 'EmptyState (molecule)' molecule 1 'Icon, title, hint and optional action. Used by every list.' Button
sub 'ErrorState (molecule)' molecule 1 'Message with retry action; also used by the 403 and 404 pages.' Button
sub 'Pagination (molecule)' molecule 1 'Migrate the existing component and restyle with tokens.' Button
sub 'AppHeader (organism)' organism 2 'Logo with role subtitle and avatar button (opens profile/logout). No notification bell.' 'Logo, Avatar'
sub 'BottomNav (organism)' organism 2 'Mobile tab bar: icon above label, active item as lime pill, 80px high. Items come from props.' Icon
sub 'TopNav (organism)' organism 2 'Desktop top menu with the same items as BottomNav.' Icon
sub 'Table (organism)' organism 2 'Migrate the existing Table for desktop lists (admin).' Folders
sub 'Role navigation config' config 1 'Single source for menus: member (Inicio, Reservas, Mi plan), trainer (Inicio, Sesiones), admin (Dashboard, Socios, Planes).' Icon
sub 'AppLayout (layout)' layout 3 'Header + BottomNav on mobile, TopNav on desktop, content area `max-w-app`. Chooses the menu by role.' 'AppHeader, BottomNav, TopNav, Role navigation config'
sub 'AuthLayout (layout)' layout 1 'Centered column with logo and background glow for Login and Register.' Logo
sub 'PublicLayout (layout)' layout 2 'Header with `Entrar` button and footer for the landing page.' 'Logo, Button'
sub 'Router: new routes and role guards' config 2 'Wire every page below to its route; redirect by role after login.' Pages

# E2 · Landing page
story 'Landing page' "" P1 1 <<'EOF'
**User story:** As a visitor I want a landing page with the gym, its plans and featured classes so that I can decide to join or log in.

**Acceptance criteria**

- Shows presentation, plans with price, featured classes, and the buttons `Entrar` and `Hazte socio`.
- Plans load without a token.
- Mobile first, adapted to desktop.
EOF
sub 'FeatureItem (molecule)' molecule 1 'Icon + title + short text for the benefits row.' Icon
sub 'PlanCard (molecule)' molecule 2 'Name, monthly price, feature list, highlighted variant (blue). Optional actions slot, reused by admin plans.' 'Badge, Button'
sub 'FeaturedClassCard (molecule)' molecule 1 'Class name, trainer, schedule; horizontal scroll item.' Badge
sub 'HeroSection (organism)' organism 2 'Slogan, subtitle, `Hazte socio` and `Entrar` buttons.' Button
sub 'BenefitsSection (organism)' organism 1 'Row of three FeatureItem.' FeatureItem
sub 'PlansSection (organism)' organism 2 'Title + PlanCard list from the API; loading, empty and error states.' 'PlanCard, EmptyState, Skeleton'
sub 'FeaturedClassesSection (organism)' organism 2 'Scrollable list of FeaturedClassCard.' FeaturedClassCard
sub 'LandingFooter + CTA (organism)' organism 1 'Final call to action and simple footer.' Button
sub 'Data: public plans and featured classes' data 1 'Needs public read access to plans while the API is protected (backend). Types come from `schema.d.ts`.' 'Backend: public plans endpoint'
sub LandingPage page 2 'Composes the sections inside PublicLayout.' 'PublicLayout, sections'

# E3 · Login page
story 'Login page' "" P0 1 <<'EOF'
**User story:** As a user I want to log in with email and password so that I land on the home screen of my role.

**Acceptance criteria**

- Email and password with validation and server errors shown in an Alert.
- Success stores the session and redirects by role.
- No social login, no password recovery, no language selector.
EOF
sub 'AuthHeroCard (molecule)' molecule 1 'Blue card with slogan and subtitle. Remove the chips from the Figma frame.' Badge
sub 'LoginForm (organism)' organism 2 'Email, password (reveal toggle), submit, `Registrarse` link. Error and loading states.' 'FormField, Button, Alert'
sub 'Data: login mutation' data 2 'Expects `{email, password}` and `{access_token, token_type, user}`.' 'Backend: JWT (#82)'
sub LoginPage page 1 'AuthLayout + AuthHeroCard + LoginForm.' AuthLayout

# E4 · Register page
story 'Register page' "" P0 1 <<'EOF'
**User story:** As a visitor I want to create an account with name, email and password so that I can become a member.

**Acceptance criteria**

- Name, email and password with validation.
- Server errors (for example, email already used) shown in an Alert.
- After registering, the user is logged in or sent to login (to be confirmed).
EOF
sub 'RegisterForm (organism)' organism 2 'Name, email, password; error and loading states.' 'FormField, Button, Alert'
sub 'Data: register mutation' data 1 'Uses the JWT endpoints.' 'Backend: JWT (#82)'
sub RegisterPage page 1 'AuthLayout + AuthHeroCard + RegisterForm.' 'AuthLayout, AuthHeroCard'

# E5 · Error pages: 403 and 404
story 'Error pages: 403 and 404' "" P0 1 <<'EOF'
**User story:** As a user I want clear 403 and 404 pages so that I know what happened and how to go back.

**Acceptance criteria**

- 403 appears when the role cannot access a route (ProtectedRoute).
- 404 appears for unknown routes.
- Both offer a button to go to the home of the user's role.
EOF
sub 'ForbiddenPage (403)' page 1 'Uses ErrorState.' ErrorState
sub 'NotFoundPage (404)' page 1 'Uses ErrorState.' ErrorState

# E6 · Member home page
story 'Member home page' "" P0 1 <<'EOF'
**User story:** As a member I want a home screen with my next booking, my membership status and quick links so that I know what to do next.

**Acceptance criteria**

- Shows the next booking (or an empty state) with cancel action.
- Shows membership status and remaining days.
- Quick links go to Reservas and Mi plan.
- No QR, check-in, locker, turnstile or notifications.
EOF
sub 'NextBookingCard (molecule)' molecule 2 'Blue card: class, time, sala, trainer, `Cancelar reserva`. Empty variant with a link to Reservas.' 'Button, Badge'
sub 'QuickAccessTile (molecule)' molecule 1 'Icon + label tile that links to a route.' Icon
sub 'QuickAccessGrid (organism)' organism 1 'Grid of QuickAccessTile.' QuickAccessTile
sub 'Data: next booking and membership summary' data 2 'Depends on `/auth/me` and bookings.' 'Backend: JWT (#82)'
sub MemberHomePage page 2 'ProfileGreeting, StatCards (days left, plan), NextBookingCard, QuickAccessGrid.' 'AppLayout, StatCard, ProfileGreeting'

# E7 · Reservas page (member)
story 'Reservas page (member)' "" P0 1 <<'EOF'
**User story:** As a member I want to pick a day of the week and see the sessions with free spots so that I can book one.

**Acceptance criteria**

- Day selector for the week and list of sessions of the selected day.
- Each session shows time, class, trainer, sala, free spots and booked state.
- Tapping a session opens Detalles de la sesión.
- There is no separate sessions page for members.
EOF
sub 'Data: week sessions with free spots' data 2 'Needs a new backend endpoint that returns free spots per session and date.' 'Backend: free spots endpoint'
sub ReservasPage page 2 'WeekSelector + SessionList (variant `member`, reuses the components from the trainer sessions story).' 'AppLayout, WeekSelector, SessionList'

# E8 · Session detail page (member)
story 'Session detail page (member)' "" P0 1 <<'EOF'
**User story:** As a member I want to see the details of a session and book or cancel it so that I manage my reservations.

**Acceptance criteria**

- Shows class, trainer, sala, schedule and free spots.
- Reservar, Cancelar reserva and Sin plazas states.
- Booking rules errors (inactive membership, full, overlap) shown in an Alert.
EOF
sub 'SessionHero (molecule)' molecule 2 'Blue card with class, date, time, trainer, sala and free-spots progress.' 'Avatar, ProgressBar, Badge'
sub 'BookingActionBar (organism)' organism 2 'Primary action by state: Reservar, Cancelar reserva, Sin plazas (disabled).' 'Button, Alert'
sub 'Data: session detail and book/cancel mutations' data 2 'Invalidate week sessions and next booking after each mutation.' 'Backend: bookings rules'
sub SessionDetailPage page 2 'Titled `Detalles de la sesión`, with back navigation.' 'AppLayout, SessionHero, BookingActionBar'

# E9 · Mi plan page (member)
story 'Mi plan page (member)' "" P1 1 <<'EOF'
**User story:** As a member I want to see my plan, its status, end date and remaining days so that I know when to renew.

**Acceptance criteria**

- Shows plan name, status, end date and days left.
- Shows what the plan includes.
- Empty state when the member has no active plan.
EOF
sub 'MembershipCard (molecule)' molecule 2 'Blue card: plan, status badge, end date, remaining days with progress.' 'Badge, ProgressBar'
sub 'PlanBenefitsList (molecule)' molecule 1 'List of what the plan includes.' Icon
sub 'Data: my membership' data 1 'Uses the member'"'"'s own membership.' 'Backend: JWT (#82)'
sub MyPlanPage page 1 'Composes MembershipCard and PlanBenefitsList.' AppLayout

# E10 · Profile page (member and trainer)
story 'Profile page (member and trainer)' "" P1 1 <<'EOF'
**User story:** As a member or trainer I want to view and edit my name, email and password, and log out, so that I control my account.

**Acceptance criteria**

- Shows and edits name and email.
- Changes the password (current + new).
- Log out clears the session and goes to the login.
- The same page serves both roles.
EOF
sub 'ProfileHeader (molecule)' molecule 1 'Avatar, name and role badge.' 'Avatar, Badge'
sub 'ProfileForm (organism)' organism 2 'Name and email with save feedback.' 'FormField, Button, Alert'
sub 'ChangePasswordForm (organism)' organism 2 'Current, new and confirm password.' 'FormField, Button, Alert'
sub 'Data: update profile and password' data 2 'Needs the JWT and roles work.' 'Backend: JWT (#82), roles'
sub ProfilePage page 1 'Header, forms and `Cerrar sesión` button.' AppLayout

# E11 · Trainer sessions page (existing #134)
use_existing_e11
sub 'DayChip (molecule)' molecule 1 'Day abbreviation + number; selected state in lime; marker when the day has sessions. (#135)' Tokens
sub 'SessionCard (molecule)' molecule 3 'Time, sala, class, enrolled/capacity with ProgressBar, AvatarStack and a variant per role (trainer: `Ver inscritos`; member: free spots + state). (#135)' 'Badge, ProgressBar, AvatarStack, Button'
sub 'WeekSelector (organism)' organism 2 'Week range with previous/next arrows and a row of DayChip. (#135)' 'DayChip, IconButton'
sub 'SessionList (organism)' organism 2 'List of SessionCard with loading, empty and error states. Used by trainer, member and trainer home. (#135)' 'SessionCard, Skeleton, EmptyState'
sub 'Data: trainer own classes and schedules' data 2 'Only the logged-in trainer'"'"'s data. (#135)' 'Backend: trainer schedules endpoint'
sub 'TrainerSessionsPage (list)' page 2 'WeekSelector + SessionList; owns the selected date. (#135)' 'AppLayout, WeekSelector, SessionList'
sub 'CapacitySummary (molecule)' molecule 1 '`14 / 20` with progress and percentage badge. (#136)' 'ProgressBar, Badge'
sub 'EnrolledMemberRow (molecule)' molecule 1 'Avatar, name, member number, booking time. (#136)' Avatar
sub 'EnrolledMembersPanel (organism)' organism 3 'Side panel / sheet: header with class and date, CapacitySummary, SearchInput, EnrolledMemberRow list, empty and error states. (#136)' 'CapacitySummary, EnrolledMemberRow, SearchInput, EmptyState'
sub 'Data: members booked for a schedule on a date' data 2 'Endpoint by schedule and date. (#136)' 'Backend: enrolled members endpoint'
sub 'Wire the panel into the sessions page' page 1 'Open/close state, selected session and date. (#136)' EnrolledMembersPanel

# E12 · Trainer home page
story 'Trainer home page' "" P1 1 <<'EOF'
**User story:** As a trainer I want a home screen with today's numbers, my next session and today's list so that I start the day prepared.

**Acceptance criteria**

- Shows today's classes and members count.
- Highlights the next session with its capacity and `Ver inscritos`.
- Lists today's sessions.
- No `En turno`, `Head Coach`, check-in or notifications.
EOF
sub 'NextSessionCard (molecule)' molecule 2 'Blue card: class, time, sala, capacity progress, AvatarStack, `Ver inscritos`.' 'ProgressBar, AvatarStack, Button'
sub 'Data: today'"'"'s sessions summary' data 1 'Reuses the trainer sessions endpoint filtered by today.' 'Trainer sessions data'
sub TrainerHomePage page 2 'ProfileGreeting, two StatCard, NextSessionCard, SessionList (today).' 'AppLayout, StatCard, SessionList'

# E13 · Admin dashboard page
story 'Admin dashboard page' "" P0 1 <<'EOF'
**User story:** As an admin I want a dashboard with relevant data about members, classes, trainers and revenue so that I can run the gym.

**Acceptance criteria**

- Shows active members, monthly revenue, bookings per day, class occupancy, expiring memberships, most contracted plans and most popular classes.
- Date range filter (7 / 30 days).
- Removed from the design: retention, revenue goal, average ticket, room map, auto-renewal button, monitor schedule, ratings.
- Uses aggregate endpoints.
EOF
sub 'DateRangeFilter (molecule)' molecule 1 'Segmented control (Hoy / 7 días / 30 días).' Tokens
sub 'ChartCard (molecule)' molecule 1 'Card shell: title, subtitle, optional badge and body slot.' Badge
sub 'BookingsByDayChart (organism)' organism 3 'Weekly bar chart on a blue card with highlighted peak. Chart approach (library or SVG) to be decided.' ChartCard
sub 'OccupancyList (organism)' organism 2 'Per-class occupancy with ProgressBar and average badge.' 'ChartCard, ProgressBar'
sub 'ExpiringMembershipsList (organism)' organism 2 'Members expiring in 7 days with days-left badge; no renewal button.' 'ChartCard, Avatar, Badge'
sub 'PlansDistributionChart (organism)' organism 3 'Donut with legend by plan.' ChartCard
sub 'TopClassesList (organism)' organism 2 'Ranked classes by bookings; no ratings.' ChartCard
sub 'SignupsVsCancellationsChart (organism)' organism 3 'Pending decision: cancellations of memberships are not defined in the project. Build only if confirmed.' ChartCard
sub 'TrainersSummaryCard (organism)' organism 2 'Pending decision: active trainers and sessions per trainer. Proposed, not in the Figma.' ChartCard
sub 'QuickActions (organism)' organism 1 'Pending decision: `Nuevo socio`, `Nueva clase`, `Exportar CSV` need destinations that have no design yet.' Button
sub 'Data: dashboard aggregates' data 3 'New backend endpoints are required; there is no story for them yet.' 'Backend: stats endpoints'
sub AdminDashboardPage page 3 'Composes filter, StatCards and chart cards.' 'AppLayout, StatCard, all dashboard organisms'

# E14 · Admin members page
story 'Admin members page' "" P0 1 <<'EOF'
**User story:** As an admin I want to see the list of members with their plan and payments, with a search bar, so that I can manage them.

**Acceptance criteria**

- List of members with plan and last payment status.
- Search by name.
- Pagination.
EOF
sub 'MemberListItem (molecule)' molecule 2 'Avatar, name, plan badge, membership state, last payment (amount, date, paid/pending).' 'Avatar, Badge'
sub 'MembersList (organism)' organism 3 'SearchInput + list (cards on mobile, Table on desktop) + Pagination, with all states.' 'MemberListItem, SearchInput, Pagination, Table, EmptyState'
sub 'Data: members with plan and payments' data 2 'Server-side search and pagination.' 'Backend: users, memberships, payments'
sub AdminMembersPage page 1 'Composes MembersList.' 'AppLayout, MembersList'

# E15 · Admin plans page
story 'Admin plans page' "" P0 1 <<'EOF'
**User story:** As an admin I want to see the plan types and edit them so that I keep prices and conditions up to date.

**Acceptance criteria**

- Shows every plan type with price, duration and status.
- Edit opens a form with name, price, duration and active toggle.
- Saving updates the list. Create and delete are not included.
EOF
sub 'Sheet (molecule)' molecule 2 'Bottom sheet on mobile, dialog on desktop, focus trap and close on escape.' IconButton
sub 'PlanEditForm (organism)' organism 2 'Name, price, duration, Toggle, `Guardar cambios`; validation and server errors.' 'FormField, Toggle, Button, Alert'
sub 'PlansAdminList (organism)' organism 2 'PlanCard list with `Editar` action.' 'PlanCard, EmptyState, Skeleton'
sub 'Data: list and update plans' data 2 'Reuses the plans API from the landing page plus the update mutation.' 'Backend: plans CRUD'
sub AdminPlansPage page 2 'PlansAdminList + Sheet with PlanEditForm.' 'AppLayout, PlansAdminList, Sheet, PlanEditForm'

apply_dependencies

echo
echo "✅ Frontend backlog created."
echo "   15 new Feature stories + 108 Task sub-issues were created/linked."
echo "   Existing E11 #134 was preserved; #135 and #136 were not modified."
echo "   Project: #$PROJECT_NUMBER · Milestone: Phase 4 - Expert"
