# Filed Issues — 2026-05-02 (post-spec-baseline run #4)

Branch: fix/e2e-runner-and-tap-targets
Tester: Flint (iOS QA)

## Newly filed by this run

| # | Title | Labels | Severity |
|---|---|---|---|
| 56 | CheckButton size 36pt violates 44x44 a11y minimum and DesignSpec 2.4 (40x40) | qa-flint, testing, ios, p1 | P1 |
| 57 | Today screen has inline 'Add Habit' footer button instead of header FAB '+' (DesignSpec 3.2 drift) | qa-flint, testing, ui, p1 | P1 |
| 58 | Maestro CLI not installed on test host — entire E2E suite cannot run | qa-flint, testing, devops, p0 | P0 |
| 59 | Race in markComplete: hasCompletionToday + insertCompletion is not atomic; no DB UNIQUE on (habit_id, completed_date) | qa-flint, testing, data, p2 | P2 |

## Pre-existing open qa-flint issues (not refiled)

| # | Title | Status |
|---|---|---|
| 53 | Maestro flows reference non-existent 'Save Habit' / 'Save Changes' tap targets | Believed addressed in this branch's flow updates; cannot verify until #58 unblocks |
| 54 | e2e/run_all.sh hardcodes Android device — iOS test runs cannot use it | Believed addressed in this branch's run_all.sh rewrite (auto-detects booted iOS sim or first adb device); cannot verify until #58 unblocks |

## Dedupe verification
\`gh issue list --label qa-flint --state open --json number,title\` was run before filing. Numbers 53 and 54 were the only pre-existing open issues. None of #56–#59 duplicate them.
