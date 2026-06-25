# MOVEMENT DATA RULES — Gettysburg Staff Ride Simulator
**Canonical spec. Any agent (or human) editing unit/movement data MUST follow every rule. Hand this file to every movement subagent verbatim. Violating these has produced real bugs (oscillation, orphaned guns, units that never move, name mismatches).**

This is a USAWC academic tool: **historical accuracy is non-negotiable** — a wrong movement distorts the events and the student's learning. Source of record: the CMH "Gettysburg Staff Ride Briefing Book" at `research/guide/guidebook.txt`. Anything beyond it must be well-documented and flagged.

---

## A. HOW THE ENGINE MOVES A UNIT (read first — most bugs come from misunderstanding this)
1. Placed units: `U(side, ech, name, sub, x, y, "doing text")` in `content.js` step `units:[]`; plus `artillery:[]` markers in `battle_dayN.js` (rendered as static unit symbols — SEE RULE D).
2. Movement: arrows. `content.js` → `A(side, [fromx,fromy], [tox,toy], "label", dashed, "narration", FATE)`. `battle_dayN.js` → object `{side, from, to, lbl, narr, fate}`.
3. **An arrow animates the placed unit whose NAME matches the LEADING word(s) of the arrow's label** (case-insensitive; exact match, then prefix match). `unitMoveName()` strips everything after the first `→`, `(`, `—`, or `/`. So label `"Early arrives from York"` → token "Early" → moves the placed unit named **Early**.
4. A label that does NOT start with a placed unit's name draws a **faceless token** (an arrow with a generic symbol) — it moves no real counter. Use this on purpose for non-unit flow arrows.
5. Arrows are **cumulative and persistent**: a unit stays where its last arrow left it. Step arrows (`content.js`) play FIRST, then the matching `battle_dayN.js` scene's arrows, in order.

## B. NAMING (the #1 source of silent failure)
- To MOVE a placed unit, the arrow label **must start with that unit's exact placed `name`** (e.g., placed `"Weed"` → label `"Weed reinforces the crest"`). Check the `name` in the step's `units:[]` before writing the label.
- To NOT move a placed unit (just show a flow arrow), make sure the label does NOT start with any placed unit's name — lead with a brigade commander, a phrase, or a different word.
- Long/punctuated names break prefix matching. If a counter must move, give the placed unit a SHORT clean `name` (e.g., `"Wainwright"`, not `"Wainwright's I Corps Arty — Seminary"`) and start the arrow with it.
- Never rely on a label that "mentions" a unit later — only the LEADING word(s) match.

## C. NO OSCILLATION (the "Early ran forward and back" bug)
- **NEVER let two or more arrows (in EITHER file, for the same stand) start with the same unit name but end at different destinations.** That counter gets yanked back and forth.
- Each unit gets **ONE coherent trajectory per stand**: either a single arrow, OR several arrows in chronological order where each continues FORWARD from the previous (monotonic), PLUS at most ONE final retrograde (the last arrow for that unit, dashed).
- If history has a unit advance in stages, make the stages monotonic (each `to` further along the axis). If you need to show other troops' pressure, label those arrows with OTHER names (brigade commanders) so they don't grab the same counter.

## D. NO ORPHANS — EVERY UNIT'S FATE MUST RESOLVE (the "orphaned cannons" bug)
- Every placed unit AND every `artillery:[]` marker that is on the field at a stand must have its **end-state shown** by the time the stand's action completes: advanced / held / withdrew / retrograded / captured / destroyed.
- **`artillery:[]` markers are STATIC — no arrow moves them.** So either (a) place the battery at its END position (where it ends the action), or (b) promote it to a placed `U(...)` unit with a SHORT name and give it a withdrawal/displacement arrow. NEVER leave a forward battery sitting at its start position while the line it supported withdraws — that reads as captured/abandoned when it wasn't.
- When a formation withdraws/consolidates, its supporting guns go WITH it unless they were actually lost (then mark them — Rule E).

## E. FATE (capture / destruction / rout) — show the OUTCOME, not just an advance
- `fate` values: `"captured"`, `"destroyed"`, `"wrecked"`, `"annihilated"`, `"shattered"`, `"overrun"`, `"broken"`, `"routed"`. The counter fades and gets a marker (red ✗ for destroyed-class; "⚑ captured" / "broken" tag).
- Put `fate` on the unit's FINAL arrow. A unit destroyed/captured IN PLACE gets a SHORT arrow starting with its name, ending at/near its own position, carrying the fate (so it doesn't wander — it just gets marked).
- Units historically captured/destroyed/overrun/routed MUST carry a fate; advancing-only is a distortion (e.g., Archer/Davis captured, Iverson destroyed, Bigelow/Smith overrun).

## F. WITHDRAWAL / RETROGRADE / SEQUENCING
- Withdrawal arrow: `dashed = true`, label starts with the unit's name, `to` = its rally/withdrawal point.
- **Order matters.** Because step arrows play before battle_dayN and arrows are cumulative: a unit must WITHDRAW *before* an enemy advances onto its ground, or they will occupy the same spot. Sequence retreats and the enemy advance that caused them accordingly.
- Opposing (adversarial) units must not be authored at identical/near-identical coordinates. (The engine auto-nudges enemies apart, but don't rely on it — keep contact legible by design.)

## G. COORDINATES, DE-BUNCHING, ALIGNMENT
- All coords are schematic (passed through `TC()`); they must line up with the field. Reuse the named anchors in `GB.iconSpots` / `GB.terrain` and existing unit positions for consistency.
- When several units converge (a rally point), spread their destinations by ~12–25 schematic units so counters don't stack illegibly.

## H. ACCURACY & TEXT
- Ground every movement and every `narr`/`do`/`what` in the CMH guidebook. Supplement with well-documented history only where the guidebook is silent, and FLAG it. Never invent quotes or figures. Keep the corrections that prior passes made (e.g., 159 guns, ~15,000 in the charge, correct timings) — do not regress them.

## I. CROSS-FILE OWNERSHIP (so two agents don't fight)
- `content.js` owns the STEP-level summary arrows and the placed `units[]`. `battle_dayN.js` owns the DETAILED staged movement and `artillery[]`.
- For any unit, its movement must be coherent across BOTH files combined (they concatenate). If `battle_dayN` provides the detailed movement, the `content.js` step must NOT also push the same unit to a conflicting spot — remove or relabel the duplicate.

## K. ADVERSARIES MUST BOTH BE VISIBLE (never one behind the other)
- When opposing units are in contact, BOTH counters must be fully visible, side by side — never stacked or overlapping so one is hidden. The engine auto-separates opposing counters to a clear gap (~one counter-width), but do NOT author opposing units (or a unit and an enemy battery) at identical/near-identical coordinates and do not rely solely on the auto-separation. If two enemies fight on the same ground, place them offset.

## L. EVERY UNIT/MARKER MUST RESOLVE TO ITS CARD (tap → info)
- A unit's `name` (and ESPECIALLY each `artillery:[]` marker's `name`) must connect to `GB.unitInfo` so tapping it shows strength/commander/history — exact key `"side|Name"` or, via forgiving match, a key whose name is the LEADING surname of the marker (e.g. marker "Bigelow's 9th Mass Btry — Trostle Farm" resolves to key `"union|Bigelow"`). Long descriptive names with no matching `unitInfo` entry produce an empty card — add a short-surname `unitInfo` entry for every battery/unit you place. Note: the SAME long-name trap breaks MOVEMENT (Rule B) — a withdrawal arrow `"Calef's section displaces rearward"` will NOT match a marker named `"Calef's Btry (2nd US Art.)"`; lead the arrow with the bare surname + a separator ("Calef — displaces rearward").
- Do NOT create two placed units with the SAME name on one stand (e.g. two "II Corps") — it breaks both arrow matching and card lookup; disambiguate by commander ("Ewell's II Corps").

## J. MANDATORY VERIFICATION BEFORE DONE
1. `node --check` on every file edited.
2. For each stand touched, mentally trace EACH placed unit and EACH artillery marker through the full concatenated arrow sequence — confirm: (a) it moves if it should, (b) its trajectory is monotonic + ≤1 reversal, (c) its fate is shown, (d) it isn't left orphaned, (e) no enemy ends stacked on it.
3. The maintainer runs a headless oscillation detector (each unit ≤1 direction reversal) and a fate-render check. Your edits must pass it.
