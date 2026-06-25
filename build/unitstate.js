/* unitstate.js — battle-state overrides for unit cards, keyed by "standId|Unit Name".
 * Lets a unit's strength / commander / status reflect THIS point in the fight (commanders
 * fall and are replaced; strength bleeds down) rather than a single static figure.
 * Merged over GB.unitInfo by openUnitCard when that stand is active. */
window.GB = window.GB || {};
GB.unitState = Object.assign(GB.unitState || {}, {

  // ---- Little Round Top, ~4:30 p.m., 2 July — the marquee fight ----
  "lrt|20th Maine": {
    commander: "Col. Joshua L. Chamberlain",
    strength: "~386 engaged — held the extreme left of the entire army and lost roughly a third (~130) breaking Col. Oates' repeated assaults",
    note: "Out of ammunition, wheeled downhill with the bayonet and broke the final assault."
  },
  "lrt|83rd PA": {
    commander: "Col. Strong Vincent — mortally wounded on this crest",
    strength: "~295 engaged",
    note: "Vincent fell rallying the brigade he had rushed up on his own responsibility; command passed to Col. James C. Rice."
  },
  "lrt|44th NY": {
    commander: "Col. James C. Rice — assumed Vincent's brigade when Vincent fell",
    strength: "~391 engaged"
  },
  "lrt|15th Ala": {
    commander: "Col. William C. Oates",
    strength: "~500 — tired and thirsty after marching all night and most of the day",
    note: "Charged the 20th Maine's line at least six times before falling back to the 4th and 5th Texas."
  },

});
