#!/usr/bin/env bash
# =============================================================================
# Gym Management API – backlog generator for GitHub Projects
# Creates: labels, milestones (one per level/phase), user stories (issue type
# Feature), sub-issues (issue type Task) linked to their parent, and fills the
# project fields Priority (P0/P1/P2) and Estimate (1-4).
#
# Estimate scale: 1 = ~½ day | 2 = ~1 day | 3 = ~2 days | 4 = 3+ days (split if more)
# Priority:       P0 = must have | P1 = should have | P2 = nice to have
#
# Configuration can be overridden with environment variables, e.g.:
#   REPO=owner/repo PROJECT_OWNER=owner PROJECT_NUMBER=1 bash create_backlog.sh
#   SKIP_ASSIGNEES=1 bash create_backlog.sh
#
# Requirements:
#   - gh CLI >= 2.40 and jq
#   - gh auth refresh -s project      (adds the "project" scope)
#   - Issue types need an ORGANIZATION repo with issue types enabled
#     (Org settings > Planning > Issue types: Feature, Task). On a personal
#     repo the script keeps going and just prints a warning for each issue.
# =============================================================================
set -euo pipefail

# ------------------------------- CONFIG --------------------------------------
REPO="${REPO:-IA-P1-BCN/g2-python-crud-api}"
PROJECT_OWNER="${PROJECT_OWNER:-IA-P1-BCN}"
PROJECT_NUMBER="${PROJECT_NUMBER:-28}"
STORY_TYPE="Feature"
TASK_TYPE="Task"
# Set SKIP_ASSIGNEES=1 to create the backlog without assigning people.
SKIP_ASSIGNEES="${SKIP_ASSIGNEES:-0}"

# Team (direct collaborators of the repo)
ASSIGNEE_EVA="miskybox"
ASSIGNEE_NAYELI="nagicome03"
ASSIGNEE_PEDRO="PDguezPgr"
ASSIGNEE_IVANNA="IvannaRCA"
ASSIGNEE_ELENA="elenaalmansacampos"
# -----------------------------------------------------------------------------

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

echo "▶ Creating labels..."
mk_label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }
mk_label "level:essential" "0E8A16" "Essential level"
mk_label "level:medium"    "FBCA04" "Medium level"
mk_label "level:advanced"  "F9A03F" "Advanced level"
mk_label "level:expert"    "D93F0B" "Expert level"
mk_label "user-story"      "1D76DB" "User story"
mk_label "subtask"         "C5DEF5" "Sub-task of a user story"
mk_label "backend"         "5319E7" "API / business logic"
mk_label "database"        "0052CC" "Schema, models, migrations"
mk_label "auth"            "B60205" "Authentication and authorization"
mk_label "testing"         "BFD4F2" "Unit / integration tests"
mk_label "docs"            "0075CA" "Documentation"
mk_label "devops"          "6F42C1" "CI/CD, Docker, deployment"
mk_label "scrum"           "FEF2C0" "Agile process and team management"
mk_label "frontend"        "E99695" "Web UI"
mk_label "performance"     "C2E0C6" "Caching and optimization"
mk_label "realtime"        "D4C5F9" "WebSockets"

echo "▶ Creating milestones..."
for m in "Phase 1 - Essential" "Phase 2 - Medium" "Phase 3 - Advanced" "Phase 4 - Expert"; do
  gh api -X POST "repos/$REPO/milestones" -f title="$m" >/dev/null 2>&1 || true
done

# ------------------------------ HELPERS --------------------------------------
LEVEL=""; MS=""; CURRENT=""; PRIO=""; ASSIGNEE=""

phase() { LEVEL="$1"; MS="$2"; echo; echo "══════ $MS ══════"; }

create_issue() { # title body labels
  local url
  if [ "$SKIP_ASSIGNEES" != "1" ] && [ -n "$ASSIGNEE" ]; then
    url=$(gh issue create --repo "$REPO" --title "$1" --body "$2" --label "$3" \
            --milestone "$MS" --assignee "$ASSIGNEE")
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

# story "Title" "area-labels" PRIORITY ESTIMATE ASSIGNEE   (body read from stdin)
story() {
  local body; body=$(cat)
  PRIO="$3"
  ASSIGNEE="$5"
  CURRENT=$(create_issue "$1" "$body" "$LEVEL,user-story,$2")
  set_type "$CURRENT" "$STORY_TYPE"
  add_to_project "$CURRENT" "$3" "$4"
  echo "● Story #$CURRENT [$3 · $4 · $ASSIGNEE] $1"
}

# sub "Title" "area-labels" ESTIMATE "Description"
sub() {
  local n body
  body="$4"$'\n\n'"Part of #$CURRENT"
  n=$(create_issue "$1" "$body" "$LEVEL,subtask,$2")
  set_type "$n" "$TASK_TYPE"
  add_to_project "$n" "$PRIO" "$3"
  link_sub "$CURRENT" "$n"
  echo "    ↳ #$n [$3 · $ASSIGNEE] $1"
}

# =============================================================================
# PHASE 1 – ESSENTIAL
# =============================================================================
phase "level:essential" "Phase 1 - Essential"

story "Project setup, repository standards and environment config" "devops,backend" P0 2 "$ASSIGNEE_EVA" <<'EOF'
**As a** developer **I want** a standard repository and configuration **so that** the whole team works consistently from day one.

### Acceptance criteria
- [ ] Repository contains README, .gitignore and a pull request template
- [ ] `main` is protected; work is done in feature branches and merged through PRs with at least 1 review
- [ ] Sensitive data lives only in `.env`; `.env.example` is committed and `.env` is ignored
- [ ] The app starts with a single documented command
- [ ] Basic logging (levels INFO/WARNING/ERROR) writes to console and file
EOF
sub "Create repo, branching strategy and PR template" "devops" 1 "Create the GitHub repo, protect main, define branch naming (feature/*, fix/*) and add .github/pull_request_template.md."
sub "Scaffold FastAPI project structure" "backend" 1 "Create folders: app/routers, app/models, app/schemas, app/services, app/core, tests. Add a health-check endpoint."
sub "Add environment variables (.env / .env.example)" "backend" 1 "Load DATABASE_URL, SECRET_KEY, etc. with pydantic-settings. Never commit real secrets."
sub "Configure basic logging" "backend" 1 "Central logging config with format, levels and rotating file handler. Log app start and each request."

story "Database design and ER diagram" "database" P0 3 "$ASSIGNEE_NAYELI" <<'EOF'
**As a** developer **I want** a well-designed relational schema **so that** all gym data is stored consistently.

### Acceptance criteria
- [ ] ER diagram includes users, membership_plans, memberships, classes, class_schedules, bookings, payments with PK/FK and cardinalities
- [ ] Diagram is exported to `/docs` and linked in the README
- [ ] SQLAlchemy models match the diagram, including relationships and constraints (unique email, NOT NULL, FKs)
- [ ] Tables are created through a migration or startup script on an empty database
- [ ] A seed script loads sample data (admin, trainers, members, plans, classes)
EOF
sub "Design the ER diagram" "database,docs" 2 "Draw the diagram (dbdiagram.io / draw.io), review it as a team and export PNG/PDF to /docs."
sub "Implement SQLAlchemy models and relationships" "database" 2 "Models for the 7 tables with FKs, enums (role, status) and created_at defaults."
sub "Set up DB session and migrations" "database" 2 "Configure engine/session dependency and Alembic with an initial migration."
sub "Create seed data script" "database" 1 "Script that inserts demo users, plans, classes and schedules for development and tests."

story "Users CRUD" "backend" P0 3 "$ASSIGNEE_PEDRO" <<'EOF'
**As an** admin **I want** to manage users (members, trainers, admins) **so that** I control who uses the gym system.

### Acceptance criteria
- [ ] `POST /users` creates a user with a hashed password and a valid role (admin/trainer/member)
- [ ] Duplicate email returns 409
- [ ] `GET /users` and `GET /users/{id}` return users; unknown id returns 404
- [ ] `PUT /users/{id}` updates and `DELETE /users/{id}` removes a user
- [ ] Password is never present in any response
EOF
sub "Define user Pydantic schemas" "backend" 1 "UserCreate, UserUpdate, UserRead with validation (email format, password length, role enum)."
sub "Implement /users CRUD endpoints" "backend" 2 "Router + service layer with the 5 CRUD operations."
sub "Implement password hashing utility" "auth,backend" 1 "Hash with bcrypt/passlib; add verify function."
sub "Unit tests for every users endpoint" "testing" 2 "Happy path + 404 + duplicate email + invalid role."

story "Membership plans CRUD" "backend" P1 2 "$ASSIGNEE_IVANNA" <<'EOF'
**As an** admin **I want** to define membership plans **so that** members can subscribe to them.

### Acceptance criteria
- [ ] `POST /membership-plans` requires name, price > 0 and duration_days > 0
- [ ] `GET` returns plans; unknown id returns 404
- [ ] `PUT` updates a plan; `DELETE` removes it (or soft-deactivates through `is_active`)
- [ ] Inactive plans cannot be assigned to new memberships
EOF
sub "Plan schemas and validations" "backend" 1 "Pydantic schemas with price and duration validators."
sub "Implement /membership-plans CRUD endpoints" "backend" 1 "Router + service for the 5 operations."
sub "Unit tests for every plan endpoint" "testing" 1 "Happy path, validation errors, 404."

story "Memberships: assign and manage subscriptions" "backend" P0 3 "$ASSIGNEE_ELENA" <<'EOF'
**As an** admin **I want** to assign a membership plan to a member **so that** they can book classes during the validity period.

### Acceptance criteria
- [ ] `POST /memberships` takes user_id, plan_id and start_date; end_date = start_date + plan.duration_days
- [ ] Status is derived correctly: active, expired or cancelled
- [ ] Non-existent user or plan returns 404; inactive plan is rejected
- [ ] `end_date` can never be before `start_date`
- [ ] CRUD operations available on `/memberships`
EOF
sub "Membership schemas and date validation" "backend" 1 "Schemas + validators for start/end dates."
sub "Implement /memberships CRUD endpoints" "backend" 2 "Router + service; compute end_date from the plan."
sub "Implement membership status logic" "backend" 2 "Helper that returns whether a membership is active on a given date; reused by bookings."
sub "Unit tests for every membership endpoint" "testing" 2 "Date calculation, expired status, invalid references."

story "Classes CRUD with trainer assignment" "backend" P1 3 "$ASSIGNEE_EVA" <<'EOF'
**As an** admin **I want** to create group classes and assign trainers **so that** members know what the gym offers.

### Acceptance criteria
- [ ] `POST /classes` requires name, capacity > 0 and trainer_id
- [ ] trainer_id must reference a user with role trainer, otherwise 400/422
- [ ] Full CRUD available; `is_active` allows deactivating a class
- [ ] Members cannot create or edit classes (enforced when auth is implemented)
EOF
sub "Class schemas and validations" "backend" 1 "Capacity > 0, required fields."
sub "Implement /classes CRUD endpoints" "backend" 2 "Router + service."
sub "Validate trainer role on assignment" "backend" 1 "Reject users who are not trainers."
sub "Unit tests for every class endpoint" "testing" 2 "CRUD, invalid trainer, invalid capacity."

story "Class schedules CRUD" "backend" P1 2 "$ASSIGNEE_NAYELI" <<'EOF'
**As an** admin **I want** to define when each class takes place **so that** members can book a specific time slot.

### Acceptance criteria
- [ ] `POST /class-schedules` requires class_id, day_of_week, start_time, end_time and room
- [ ] start_time must be before end_time
- [ ] Two schedules cannot overlap in the same room and day (409)
- [ ] Full CRUD available
EOF
sub "Schedule schemas and time validation" "backend" 1 "day_of_week enum, start < end."
sub "Implement /class-schedules CRUD endpoints" "backend" 1 "Router + service, including room overlap check."
sub "Unit tests for every schedule endpoint" "testing" 1 "CRUD, time validation, room overlap."

story "Bookings with business rules" "backend" P0 4 "$ASSIGNEE_PEDRO" <<'EOF'
**As a** member **I want** to book and cancel class slots **so that** I can reserve my place.

### Acceptance criteria
- [ ] A member can book only with an active membership on the booking date (otherwise 403/400)
- [ ] Booking is rejected when the class capacity is reached (409)
- [ ] A member cannot have two bookings in the same time slot (409)
- [ ] Cancelling sets status to `cancelled` and frees the spot
- [ ] CRUD available on `/bookings`; a member only sees their own bookings
EOF
sub "Implement /bookings CRUD endpoints" "backend" 2 "Router + service: create, list, get, cancel (status change), delete."
sub "Rule: booking requires an active membership" "backend" 2 "Reuse the membership status helper."
sub "Rule: capacity validation" "backend" 2 "Count confirmed bookings for the schedule and date before creating."
sub "Rule: no overlapping bookings for the same user" "backend" 2 "Compare day/time of the user's confirmed bookings."
sub "Unit tests for each booking rule" "testing" 3 "One test per rule plus the happy path and cancel."

story "Basic exception handling" "backend" P1 2 "$ASSIGNEE_IVANNA" <<'EOF'
**As a** client developer **I want** consistent error responses **so that** I can handle failures predictably.

### Acceptance criteria
- [ ] Global handlers for validation errors, HTTP exceptions and unexpected exceptions
- [ ] All errors return the same JSON structure (`detail`, `code`)
- [ ] Unexpected errors are logged and never leak stack traces to the client
EOF
sub "Implement global exception handlers" "backend" 1 "Register handlers in the app factory."
sub "Create custom domain exceptions" "backend" 1 "NotFound, Conflict, BusinessRuleViolation, etc."
sub "Log errors with context" "backend" 1 "Log method, path and error at WARNING/ERROR level."

story "Test infrastructure" "testing" P0 3 "$ASSIGNEE_ELENA" <<'EOF'
**As a** developer **I want** a reliable test setup **so that** every module can be tested in isolation.

### Acceptance criteria
- [ ] pytest uses a separate test database (SQLite in-memory or dedicated PostgreSQL)
- [ ] Shared fixtures exist for client, DB session and sample data
- [ ] The whole suite runs with a single command
- [ ] A coverage report is generated
EOF
sub "Configure pytest and test database" "testing" 2 "pytest.ini, dependency override for get_db, DB reset per test."
sub "Create shared fixtures and factories" "testing" 2 "Fixtures for admin/trainer/member, plan, class, schedule."
sub "Add coverage reporting" "testing" 1 "pytest-cov with a minimum threshold."

story "Markdown documentation" "docs" P1 2 "$ASSIGNEE_ELENA" <<'EOF'
**As a** new team member or evaluator **I want** clear documentation **so that** I can install, run and understand the project quickly.

### Acceptance criteria
- [ ] README explains the business case, stack, installation, environment variables, running and testing
- [ ] ER diagram and endpoint overview are included
- [ ] Contribution guide documents branches, commits and PR flow
EOF
sub "Write README" "docs" 2 "Description, stack, setup steps, env vars, run and test commands."
sub "Document endpoints and business rules in /docs" "docs" 2 "Markdown table of endpoints and the 5 business rules."

story "Kanban board and SCRUM process" "scrum" P1 2 "$ASSIGNEE_EVA" <<'EOF'
**As a** team **I want** to run the project with SCRUM and a Kanban board **so that** work is visible and well coordinated.

### Acceptance criteria
- [ ] Board has Backlog, Ready, In progress, In review and Done columns
- [ ] Every story has acceptance criteria, priority and estimate
- [ ] Sprint planning, daily notes and sprint review are documented
- [ ] A retrospective document is delivered at the end
EOF
sub "Configure board views and fields" "scrum" 1 "Board and table views, grouped by milestone; Priority and Estimate fields."
sub "Keep a log of dailies, planning and review" "scrum" 1 "Short markdown file or wiki page updated by the Scrum Master."
sub "Write the retrospective document" "scrum,docs" 2 "What went well / to improve / actions, plus lessons learned."

# =============================================================================
# PHASE 2 – MEDIUM
# =============================================================================
phase "level:medium" "Phase 2 - Medium"

story "Interactive API documentation (Swagger)" "docs,backend" P1 2 "$ASSIGNEE_NAYELI" <<'EOF'
**As an** API consumer **I want** interactive documentation **so that** I can explore and try the endpoints.

### Acceptance criteria
- [ ] Swagger UI is available at `/docs`
- [ ] Endpoints are grouped by tags and each has summary and description
- [ ] Request and response examples are defined for the main schemas
EOF
sub "Add tags, summaries and descriptions" "docs" 1 "Annotate every router and endpoint."
sub "Add response models and examples" "docs" 2 "response_model, status codes and schema examples."

story "Advanced error handling with proper HTTP codes" "backend" P1 2 "$ASSIGNEE_IVANNA" <<'EOF'
**As an** API consumer **I want** accurate HTTP status codes **so that** I understand what went wrong.

### Acceptance criteria
- [ ] 400, 401, 403, 404, 409 and 422 are used consistently across all modules
- [ ] An error catalogue is documented
- [ ] Tests assert status code and body for each error scenario
EOF
sub "Define error-to-status-code mapping" "backend,docs" 1 "Table of business errors and their codes."
sub "Apply the mapping across all modules" "backend" 2 "Refactor raised exceptions to use the domain errors."
sub "Tests for error scenarios" "testing" 2 "One test per error type per module."

story "Filtering and pagination on GET endpoints" "backend" P1 3 "$ASSIGNEE_PEDRO" <<'EOF'
**As an** API consumer **I want** to filter and paginate lists **so that** responses stay fast and relevant.

### Acceptance criteria
- [ ] List endpoints accept `page` and `size` (defaults and maximum defined)
- [ ] Responses include `total`, `page`, `size` and `items`
- [ ] Filters: users by role, memberships by status, classes by trainer/is_active, bookings by status/date
- [ ] Invalid parameters return 422
EOF
sub "Reusable pagination dependency and response model" "backend" 2 "Generic Page[T] schema and query helper."
sub "Implement filters per resource" "backend" 2 "Query params and SQL filters for each list endpoint."
sub "Tests for filtering and pagination" "testing" 2 "Boundaries, empty pages, invalid params."

story "Relationship endpoints" "backend" P2 2 "$ASSIGNEE_ELENA" <<'EOF'
**As an** API consumer **I want** nested resource endpoints **so that** I can query related data directly.

### Acceptance criteria
- [ ] `GET /classes/{id}/schedules`
- [ ] `GET /users/{id}/memberships`
- [ ] `GET /users/{id}/bookings`
- [ ] `GET /class-schedules/{id}/bookings`
- [ ] Unknown parent id returns 404
EOF
sub "Implement the four relationship endpoints" "backend" 2 "Reuse services and pagination."
sub "Tests for relationship endpoints" "testing" 1 "Happy path and 404 for each."

story "Payments CRUD" "backend,database" P2 2 "$ASSIGNEE_NAYELI" <<'EOF'
**As an** admin **I want** to register payments linked to memberships **so that** I can track revenue.

### Acceptance criteria
- [ ] `POST /payments` requires user_id, membership_id and amount > 0
- [ ] Status is pending, paid or failed
- [ ] CRUD available; list can be filtered by status and user
EOF
sub "Payment schemas and validation" "backend" 1 "Amount and status validation."
sub "Implement /payments CRUD endpoints" "backend" 1 "Router + service."
sub "Unit tests for every payment endpoint" "testing" 1 "CRUD and validation errors."

story "CSV export" "backend" P2 2 "$ASSIGNEE_NAYELI" <<'EOF'
**As an** admin **I want** to export data to CSV **so that** I can analyse it in a spreadsheet.

### Acceptance criteria
- [ ] `GET /export/members.csv` and `GET /export/bookings.csv` return valid CSV files
- [ ] Correct headers, UTF-8 encoding and `Content-Disposition` filename
- [ ] Existing filters can be applied to the export
EOF
sub "Export members to CSV" "backend" 1 "StreamingResponse with csv writer."
sub "Export bookings to CSV" "backend" 1 "Same approach, with date/status filters."
sub "Tests for CSV exports" "testing" 1 "Headers, rows count, content type."

story "Integration tests" "testing" P1 3 "$ASSIGNEE_IVANNA" <<'EOF'
**As a** team **I want** end-to-end tests **so that** the modules are proven to work together.

### Acceptance criteria
- [ ] Flow tested: create plan → assign membership → create class and schedule → book → cancel
- [ ] Capacity-full and overlapping-booking scenarios are tested end to end
- [ ] Relationships and cascading behavior in the DB are verified
EOF
sub "Integration test: full booking flow" "testing" 2 "Chain of API calls on the real app with test DB."
sub "Integration test: capacity and overlap scenarios" "testing" 2 "Multiple members competing for the last spot."
sub "Integration test: relationships and deletions" "testing" 1 "What happens when deleting users, classes or plans with dependents."

# =============================================================================
# PHASE 3 – ADVANCED
# =============================================================================
phase "level:advanced" "Phase 3 - Advanced"

story "JWT authentication" "auth,backend" P0 3 "$ASSIGNEE_EVA" <<'EOF'
**As a** user **I want** to register and log in **so that** I get a token to access the API securely.

### Acceptance criteria
- [ ] `POST /auth/register` creates a member account
- [ ] `POST /auth/login` returns an access token with expiration
- [ ] Wrong credentials return 401; expired or invalid tokens return 401
- [ ] SECRET_KEY and token lifetime come from environment variables
EOF
sub "Implement register and login endpoints" "auth" 2 "Reuse the password hashing utility."
sub "JWT creation and validation utilities" "auth" 2 "python-jose or PyJWT, expiry, signature check."
sub "get_current_user dependency" "auth" 1 "Decode token, load user, raise 401 on failure."
sub "Tests for authentication" "testing" 2 "Register, login, bad password, expired and tampered token."

story "Roles and permissions (RBAC)" "auth,backend" P0 4 "$ASSIGNEE_NAYELI" <<'EOF'
**As an** admin **I want** access control by role **so that** each user only does what they are allowed to.

### Acceptance criteria
- [ ] Admin can access everything
- [ ] Trainer can manage only their own classes and see their bookings
- [ ] Member can access only their own memberships and bookings; cannot create classes or plans
- [ ] Forbidden actions return 403; missing token returns 401
- [ ] Swagger shows the authorize button and protected routes
EOF
sub "Create role-based guard dependencies" "auth" 2 "require_roles(...) dependency."
sub "Protect all routers" "auth,backend" 3 "Apply guards to every endpoint following the permission matrix."
sub "Ownership checks (trainer and member scopes)" "auth" 2 "Verify resource belongs to the current user."
sub "Permission matrix tests" "testing" 3 "Role x endpoint tests for allowed and forbidden cases."

story "Response caching" "performance,backend" P2 3 "$ASSIGNEE_PEDRO" <<'EOF'
**As an** API consumer **I want** faster responses on frequently read data **so that** the API scales better.

### Acceptance criteria
- [ ] GET lists of membership plans and classes are cached with a configurable TTL
- [ ] Cache is invalidated on create, update and delete
- [ ] Response includes a header indicating cache hit or miss
EOF
sub "Choose and configure cache backend" "performance,devops" 2 "In-memory TTL cache or Redis; configuration through env vars."
sub "Cache read-heavy endpoints" "performance" 2 "Apply to plans and classes lists."
sub "Cache invalidation on writes" "performance" 2 "Clear related keys on POST/PUT/DELETE."
sub "Tests for cache behavior" "testing" 1 "Hit, miss and invalidation."

story "WebSockets for real-time class availability" "realtime,backend" P2 4 "$ASSIGNEE_ELENA" <<'EOF'
**As a** member **I want** to see remaining spots update live **so that** I know when a class fills up.

### Acceptance criteria
- [ ] `WS /ws/schedules/{id}` sends the number of free spots on connect
- [ ] Every booking or cancellation broadcasts the new availability to connected clients
- [ ] Connection requires a valid JWT
- [ ] Disconnections are handled without errors
EOF
sub "Implement WebSocket connection manager" "realtime" 2 "Track connections per schedule."
sub "Broadcast on booking and cancellation" "realtime,backend" 2 "Hook into the bookings service."
sub "Authenticate WebSocket connections" "realtime,auth" 2 "Token via query param or first message."
sub "Tests for WebSocket flow" "testing" 2 "Connect, receive update, disconnect."

# =============================================================================
# PHASE 4 – EXPERT
# =============================================================================
phase "level:expert" "Phase 4 - Expert"

story "Dockerize the application" "devops" P1 3 "$ASSIGNEE_IVANNA" <<'EOF'
**As a** developer **I want** the app containerized **so that** it runs identically in any environment.

### Acceptance criteria
- [ ] Dockerfile builds a working image (multi-stage, non-root user)
- [ ] `docker compose up` starts API and PostgreSQL together
- [ ] Configuration comes from environment variables; a healthcheck is defined
- [ ] README documents the Docker workflow
EOF
sub "Write Dockerfile" "devops" 2 "Multi-stage build with minimal runtime image."
sub "Create docker-compose with PostgreSQL" "devops,database" 2 "Volumes, networks, env file and depends_on healthcheck."
sub "Document Docker usage" "docs" 1 "Build, run, logs and teardown commands."

story "Continuous integration with GitHub Actions" "devops" P1 2 "$ASSIGNEE_EVA" <<'EOF'
**As a** team **I want** automated checks on every PR **so that** broken code never reaches main.

### Acceptance criteria
- [ ] Workflow runs lint and the full test suite on each pull request
- [ ] Merging is blocked when checks fail
- [ ] Status badge is shown in the README
EOF
sub "Create test workflow" "devops,testing" 2 "Set up Python, install deps, run pytest with coverage."
sub "Add linting step" "devops" 1 "ruff or flake8 + formatting check."
sub "Enable required status checks on main" "devops" 1 "Branch protection rule using the workflow."

story "Cloud deployment" "devops" P2 4 "$ASSIGNEE_PEDRO" <<'EOF'
**As a** client **I want** the API publicly available **so that** I can use it in production.

### Acceptance criteria
- [ ] API is reachable at a public HTTPS URL
- [ ] Managed PostgreSQL database is used; secrets are configured in the platform
- [ ] Swagger is accessible in the deployed environment
- [ ] Deployment steps are documented
EOF
sub "Choose cloud provider and plan" "devops" 1 "Compare Render / Railway / AWS / GCP for free tier and simplicity."
sub "Provision managed database" "devops,database" 2 "Create DB, get connection string, run migrations."
sub "Deploy the container and configure secrets" "devops" 3 "Environment variables, health checks, HTTPS."
sub "Smoke test and document deployment" "docs,testing" 1 "Test main endpoints on the live URL."

story "External service integration (payments)" "backend" P2 4 "$ASSIGNEE_IVANNA" <<'EOF'
**As a** member **I want** to pay for my membership online **so that** it activates automatically.

### Acceptance criteria
- [ ] Checkout session is created through Stripe in test mode
- [ ] Webhook updates payment status and activates the membership
- [ ] API keys are stored in environment variables
- [ ] External calls are mocked in tests
EOF
sub "Set up Stripe test account and keys" "backend,devops" 1 "Add keys to env configuration."
sub "Create checkout endpoint" "backend" 3 "Create a session linked to membership and payment."
sub "Implement webhook for payment confirmation" "backend" 3 "Verify signature, update payment and membership."
sub "Tests with mocked Stripe" "testing" 2 "Success and failure cases."

story "Basic web user interface" "frontend" P2 4 "$ASSIGNEE_ELENA" <<'EOF'
**As a** member **I want** a simple web app **so that** I can use the gym services without calling the API manually.

### Acceptance criteria
- [ ] Login and register screens using the JWT endpoints
- [ ] Class and schedule list with remaining spots
- [ ] Book and cancel from the UI; "my bookings" and "my membership" views
- [ ] Responsive layout; API errors are shown to the user
EOF
sub "Scaffold React app and API client" "frontend" 1 "Vite + React, axios instance with token interceptor."
sub "Auth screens and protected routes" "frontend,auth" 2 "Login, register, token storage, route guards."
sub "Classes list and booking flow" "frontend" 3 "List schedules, book, cancel, handle errors."
sub "My membership and my bookings views" "frontend" 2 "Read-only views with status badges."

echo
echo "✅ Backlog created. Open your project and group by Milestone."
