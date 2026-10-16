"""Review a pull request with a free Gemini model and post it as one PR comment.

See specs/416-ai-pr-review.md. Standard library only. Any failure prints a warning and exits 0:
the AI review must never break CI, and the human review stays mandatory.

Environment: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, AI_REVIEW_API_KEY (a Gemini API key,
stored as a repository secret), and optionally AI_REVIEW_MODEL.
Pass --dry-run to print the review instead of commenting.
"""

import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.github.com"
# Gemini's OpenAI-compatible endpoint
MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
# Alias that follows the current Flash model; AI_REVIEW_MODEL can pin another one
DEFAULT_MODEL = "gemini-flash-latest"
MARKER = "<!-- ai-review -->"
# Keeps each request small enough for the free tier's per-minute token limit.
MAX_DIFF_CHARS = 60_000
SKIPPED_FILES = ("package-lock.json", "frontend/src/types/schema.d.ts")

INSTRUCTIONS = """You review pull requests of Athletica, a gym app: FastAPI backend in backend/,
React + Vite + TypeScript frontend in frontend/. Project rules:
- Backend layers: the router receives and responds, the service holds the business rules, the
  repository reads and writes, the model defines the table. Services never query the users table
  directly; they go through app/repositories/user_repository.py.
- DRY and SOLID; no logic duplicated across layers.
- Security: passwords hashed with Argon2, JWT validated with its type, no secrets or .env in the
  code, every endpoint checks the role it needs.
- Every behaviour change comes with tests; tests are never skipped or deleted.
- Frontend: only src/api talks HTTP; design tokens from src/styles/theme.css, no hex colours.
- Code, names and comments in English; documentation in Spanish.

Review only the diff. Write in English, in Markdown, at most about 300 words:
1. A one-line summary of what the PR does.
2. Problems, most serious first, each with the file and why it matters. Say "None found" if so.
3. Optional suggestions.
Do not praise, do not repeat the diff, and do not invent code that is not in it."""


def warn(message: str) -> None:
    print(f"::warning title=AI review skipped::{message}")


def request(
    url: str,
    token: str,
    *,
    method: str = "GET",
    body: dict | None = None,
    accept: str = "application/vnd.github+json",
) -> bytes:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": accept,
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()


def keep_relevant(diff: str) -> str:
    """Drop the sections of generated files, which are long and say nothing to a reviewer."""
    sections = diff.split("\ndiff --git ")
    kept = [section for section in sections if not _is_generated(section)]
    return "\ndiff --git ".join(kept)


def _is_generated(section: str) -> bool:
    path = section.partition("\n")[0].rpartition(" b/")[2]
    return any(path == name or path.endswith(f"/{name}") for name in SKIPPED_FILES)


def truncate(diff: str) -> tuple[str, bool]:
    if len(diff) <= MAX_DIFF_CHARS:
        return diff, False
    return diff[:MAX_DIFF_CHARS], True


def review(diff: str, api_key: str, model: str) -> str:
    answer = request(
        MODEL_URL,
        api_key,
        method="POST",
        body={
            "model": model,
            "temperature": 0.2,
            "max_tokens": 1000,
            "messages": [
                {"role": "system", "content": INSTRUCTIONS},
                {"role": "user", "content": f"```diff\n{diff}\n```"},
            ],
        },
        accept="application/json",
    )
    try:
        return json.loads(answer)["choices"][0]["message"]["content"].strip()
    except (ValueError, KeyError, IndexError) as error:
        raise RuntimeError(f"unexpected answer from the model: {answer[:300]!r}") from error


def comment_body(text: str, model: str, truncated: bool) -> str:
    note = (
        f"\n\n> The diff was longer than {MAX_DIFF_CHARS:,} characters: only the first part was "
        "reviewed."
        if truncated
        else ""
    )
    return (
        f"{MARKER}\n## AI review\n\n{text}{note}\n\n---\n"
        f"*Automatic review by `{model}` (Gemini). It does not approve or block this PR: "
        "a human review is still required.*"
    )


def upsert_comment(repo: str, number: str, token: str, body: str) -> None:
    """Edit our previous comment if there is one, so each PR keeps a single AI review."""
    comments = json.loads(
        request(f"{API}/repos/{repo}/issues/{number}/comments?per_page=100", token)
    )
    ours = next((c for c in comments if MARKER in (c.get("body") or "")), None)
    if ours:
        request(ours["url"], token, method="PATCH", body={"body": body})
    else:
        request(
            f"{API}/repos/{repo}/issues/{number}/comments",
            token,
            method="POST",
            body={"body": body},
        )


def main() -> None:
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    number = os.environ.get("PR_NUMBER", "")
    api_key = os.environ.get("AI_REVIEW_API_KEY", "")
    model = os.environ.get("AI_REVIEW_MODEL") or DEFAULT_MODEL
    dry_run = "--dry-run" in sys.argv
    if not (token and repo and number):
        warn("GITHUB_TOKEN, GITHUB_REPOSITORY and PR_NUMBER are required")
        return
    if not api_key:
        warn("the AI_REVIEW_API_KEY repository secret is not set")
        return
    try:
        raw = request(
            f"{API}/repos/{repo}/pulls/{number}", token, accept="application/vnd.github.diff"
        ).decode("utf-8", "replace")
        diff, truncated = truncate(keep_relevant(raw))
        if not diff.strip():
            print("Nothing to review.")
            return
        body = comment_body(review(diff, api_key, model), model, truncated)
        if dry_run:
            print(body)
        else:
            upsert_comment(repo, number, token, body)
            print("AI review posted.")
    except urllib.error.HTTPError as error:
        warn(f"HTTP {error.code} from {error.url}: {error.read()[:300]!r}")
    except Exception as error:  # noqa: BLE001 - any failure must leave CI green
        warn(f"{type(error).__name__}: {error}")


if __name__ == "__main__":
    main()
