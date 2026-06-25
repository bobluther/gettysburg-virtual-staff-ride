# Guidebook source map — CMH Gettysburg Staff Ride Briefing Book

**The file `guidebook.txt` (in this folder) is the SOLE SOURCE OF TRUTH.** It is the public-domain
U.S. Army Center of Military History "Gettysburg Staff Ride Briefing Book," extracted with layout.
Line numbers below are approximate (pdftotext) — grep to confirm.

## Section → line ranges in guidebook.txt
- **Foreword / purpose of a staff ride** — lines ~11–53. NOTE: lines 12–21 are the Benét
  "John Brown's Body" poem excerpt — **COPYRIGHTED, do NOT reproduce**. Everything else is gov PD.
- **"THE GETTYSBURG CAMPAIGN" (the core narrative, pp.1–14)** — lines ~98–1000. This is the
  load-bearing text: Lee's move north, Brandy Station, Stuart's ride, Hooker→Meade, Buford at
  Gettysburg, Day 1 (Reynolds, the fishhook), Day 2 (Longstreet's attack, Sickles' salient, LRT,
  Wheatfield, Devil's Den, Culp's/Cemetery Hill), Day 3 (cannonade, Pickett's Charge, the Angle),
  retreat & casualties. Terrain description ("Oak Hill… Seminary Ridge… McPherson's Ridge…") ~485+.
- **Order of Battle — Army of the Potomac (Union)** — lines ~1001–1482 (strengths, brigade/regiment
  makeup, commanders).
- **Order of Battle — Army of Northern Virginia (Confederate)** — lines ~1483–1830.
- **Casualties** — ~1831. **Organization** ~1876. **Logistics** ~1987. **Small Arms** ~2124.
  **Artillery** ~2215. **Tactics** ~2445. **Weather** ~2566.
- **Selected Biographical Sketches** (Union then Confederate leaders) — start ~2656 through ~3700.
  Each leader's sketch is a paragraph or two — verbatim source for Personalities.
- **"Chamberlain and the 20th Maine at Little Round Top"** (the detailed LRT feature, pp.73–86) —
  roughly lines ~3800–4500. Rich verbatim source for the Little Round Top stand.
- **Selected reports and cables** (official messages, p.87+) — end of file. Primary-source quotes.

## Rules for every rewrite
1. **Pull verbatim where you can.** Prefer the guidebook's own sentences/phrases. Light trimming
   for caption length is fine; do not invent facts, numbers, or quotes not in the guidebook.
2. **Do not reproduce the Benét poem** (lines 12–21).
3. **Voice/audience:** a USAWC senior officer studying operational art. Concise — most of this text
   renders as a one- or two-sentence caption band over the map. Tight, declarative, no purple prose.
4. **Preserve all JS structure.** Change only the narration STRING VALUES named in your task.
   Never change keys, ids, coordinates, side flags, counts, array lengths, or add/remove entries.
5. Verify your file parses: `node --check <file>` must pass before you finish.
