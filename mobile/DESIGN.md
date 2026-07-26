# Study Stakes — design reference

Source of truth: the Claude Design project "App design mockup comparison"
(https://claude.ai/design/p/f545e2cd-96ea-4a98-b2c0-4fc7605bbd88?file=Study+Stakes.dc.html).
This file is the distilled, buildable summary. **Option 2a (+ turn 3's reward loops) is the end goal.**
Malachi writes all code; this doc is spec, not implementation.

## Confirmed token mapping (the mockup uses design.ts values verbatim)

- `colors.bg` `#0D0F14` — every screen background
- `colors.card` `#1A1D26` — every card/surface; the stake bottom-sheet uses `#161922` (slightly lighter than bg, darker than card — add a `sheet` token when we build sheets)
- `colors.accent` `#5C6CFF` — primary buttons, active tab, progress, "next deadline" highlight border, STAKED badges
- `colors.success` `#2ED573` — kept money, completed rows, streak
- `colors.danger` `#FF4757` — money at risk, failed rows, charges. **Guardrail: red is never used for celebration/spectacle — red means real money lost, only that.**
- `colors.textMuted` `#8B90A0` — every secondary line, micro-labels, inactive tabs
- **Missing token to add: `colors.border` = `rgba(255,255,255,.06)`** — the 1px hairline on every card. (Cards read as "edged", not "shadowed".)

## Typography rules

- Headlines: 25–27px, weight 700, tight letter-spacing (−0.5px), often two lines ("Two things due\nbefore midnight.")
- Section headers: NOT big text — tiny uppercase micro-labels: 12px/600, letter-spacing ~.6px, `textMuted` ("TODAY", "MODULES · TERM 1", "LEDGER")
- Money and timers: bold, `font-variant-numeric: tabular-nums`, big when hero (40–44px), colored by meaning (red at-risk / green kept)
- Body/meta: 12–13.5px regular, `textMuted`

## Card anatomy (the recurring pattern everything uses)

`colors.card` background · 1px `colors.border` · radius 14–18 · padding 14–18.
Task/commitment row card (the CommitmentRow spec):
- **3px vertical status rail** on the left edge (rounded, full height): accent = active, success = done, danger = failed
- Title 14.5px/600; meta line below in `textMuted` 12px ("Quantum Mechanics II · 50 min")
- Money right-aligned, 13px/600, colored by status (red stake at risk, green "£5 ✓" kept, red "−£10" charged)
- Completed rows: whole card `opacity: .55`, title strikethrough, meta line goes green ("Checked in 09:12 · 26 min tracked")
- Failed rows: border tint `rgba(255,71,87,.3)`, rail + money red
- Status badges elsewhere are pills (radius 999): tinted bg at ~14% alpha of the status color + colored text, uppercase ("STAKED £15", "KEPT £10", "NO STAKE")

## Screen structure (2a — the target information architecture)

4 tabs: **Today / Plan / Money / Me**, in a floating pill tab bar; above it a full-width accent CTA "Start focus session · £15 riding" with a soft accent glow.
- **Today**: date micro-label + big headline ("Two things due before midnight."), hero "Next deadline" card (accent-tinted border, task title, module, giant countdown "3h 48m", stake red at right, thin progress bar of tracked minutes), two stat tiles (£ at risk / day streak), then today's task rows
- **Plan**: week strip (7 day-tiles, active day accent, dot showing day outcome), module cards (name, "4 tasks · 2 staked · £23.00 live", per-module progress bar segments), dashed "+ New module" ghost card
- **Module workspace**: back link, module title + code, two stat tiles (live stakes / sheets kept), task cards with stake badges, "Put money on it" ghost button on unstaked tasks, dashed "+ New task"
- **Money**: hero card (CURRENTLY AT RISK, £47.00 huge, segmented bar, "next resolves in 3h 48m"), three term stat tiles (kept/lost/kept-rate), ledger list (task, date · reason, ±£ colored), card-on-file row
- **Me**: profile card, streak/tracked tiles, settings list (default verification, default stake, reminders, term dates, payment method), red-text Log out
- **Focus session**: full-screen, ring timer (SVG circle, accent stroke, "of 50:00 tracked"), warning card "Leave the app and this session voids. £15.00 charged if you do.", primary Pause/Resume, secondary "Check in with photo →"
- **Check-in success**: green check circle, "Checked in.", receipt card (stake released / tracked / streak / AI verdict), back CTA
- **Failure screen**: red ! circle, "Deadline missed.", charge receipt card (charged £, card, reason `deadline_missed`, tracked, ledger ref), consolation copy ("the charge doesn't cancel the work"), accent "Re-stake this task" CTA, tiny "Dispute a charge"
- **Stake creation = bottom sheet** (not a full screen): drag handle, preset stake chips £5/10/20/50, verify chips Timer/Photo/Both, deadline + required-minutes rows, "The server referees this…" copy, "Put £X on it" CTA. (Note: required minutes per commitment — backend B1 exists for this.)

## Edge states (2d)

- Empty Plan: dashed + icon, "No modules yet", pitch copy, accent CTA "Add your first module"
- Loading: skeleton blocks (white-alpha rounded rects in card shells) + "Checking with the server…" footer
- Onboarding step 3: "Four tasks planned. Which ones need teeth?" — stake-optional picker, "Start the week · £31 committed"

## Reward loops (turn 3 — build LAST, after the core screens)

- **Anticipation beat**: photo verdict gets a ~2.5s "referee is checking…" suspense screen, never an instant result
- **Count-up**: kept money ticks up from £0; earned feels earned
- **Celebration sized to rarity**: daily check-in = sub-second flame bounce; only milestones (day 14) get the full-screen moment
- **Goal gradient**: copy counts down to milestones ("one session between you and day 14"); progress bar shimmers near completion
- **Milestone reward is functional**: day-14 chest pays a streak shield, not just confetti
- **Ambient login**: live stakes drift behind the login form
- Guardrail repeated: celebration is green/amber only.

## Build order implication (maps onto the existing ladder)

Rung 3 (now): CommitmentRow per the card anatomy above → FlatList + pull-to-refresh.
Then: screens go dark (`colors.bg`, kill ParallaxScrollView headers), micro-label section headers, stat tiles.
Then: tab restructure (Today/Plan/Money/Me), stake bottom sheet, focus ring screen.
Turn-3 dopamine pass last — it decorates outcomes that must exist first.
