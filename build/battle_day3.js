window.GB = window.GB || {};
GB.battleDetail = GB.battleDetail || {};

Object.assign(GB.battleDetail, {

  // ─────────────────────────────────────────────────────────────────
  // STEP: Culp's Hill Recaptured
  //   Dawn, 3 July 1863. Johnson's Confederate division (reinforced
  //   overnight) holds Union entrenchments at the foot of Culp's Hill.
  //   Slocum orders XII Corps to open with massed artillery at 4:30 a.m.,
  //   then drives Johnson back in seven hours of brutal fighting.
  // ─────────────────────────────────────────────────────────────────
  "Culp's Hill Recaptured": {

    arrows: [
      {
        side: "union",
        from: [576, 408],
        to:   [618, 406],
        lbl:  "Slocum — recover Culp's Hill",
        narr: "During the night Slocum regrouped his XII Corps and prepared to recover his former position around Culp's Hill, opening at dawn against Johnson's lodgment."
      },
      {
        side: "union",
        from: [576, 400],
        to:   [610, 394],
        lbl:  "XII Corps — recover former works",
        narr: "Slocum's XII Corps drives to reoccupy its former entrenchments around Culp's Hill, sealing the Union right flank."
      },
      {
        side: "confederate",
        from: [628, 402],
        to:   [598, 408],
        lbl:  "Johnson — renewed assault on the lower works",
        narr: "Johnson, heavily reinforced overnight, attacks first at dawn, driving against the lower entrenchments at the foot of Culp's Hill, but his assaults fail against the entrenched Union line on the wooded hill."
      },
      {
        side: "union",
        from: [570, 412],
        to:   [596, 414],
        lbl:  "XII Corps — recapture lower works",
        narr: "The XII Corps reclaims the lower entrenchments Johnson had seized at the foot of Culp's Hill the previous evening."
      },
      {
        side: "confederate",
        from: [598, 408],
        to:   [628, 402],
        lbl:  "Johnson — driven back by 11 a.m.",
        dashed: true,
        fate: "broken",
        narr: "By 11:00 a.m., 3 July, Johnson has been driven back to his original position; Culp's Hill is firmly in Union hands."
      },
      {
        side: "union",
        from: [580, 424],
        to:   [598, 432],
        lbl:  "Culp's Hill — right-flank anchor",
        narr: "With Culp's Hill recovered, the rugged wooded mass at the base of the fishhook again anchors the right of the Union line."
      }
    ],

    artillery: [
      {
        side: "union",
        name: "Muhlenberg's XII Corps Btry (4th US F, 5th US K)",
        x: 564,
        y: 410
      },
      {
        side: "union",
        name: "Stevens's 5th ME Btry — Cemetery Hill",
        x: 532,
        y: 374
      },
      {
        side: "confederate",
        name: "Johnson's divisional artillery — Rock Creek",
        x: 648,
        y: 414
      }
    ],

    keyterrain: [
      {
        name:  "Culp's Hill — upper crest",
        x:     588,
        y:     396,
        note:  "Dominant wooded height; Greene's New York brigade holds entrenched line. Key terrain anchoring the Union right."
      },
      {
        name:  "Pardee Field",
        x:     612,
        y:     420,
        note:  "Open saddle on the south slope of Culp's Hill where Steuart charges and is repulsed with heavy loss."
      },
      {
        name:  "Spangler's Spring",
        x:     600,
        y:     434,
        note:  "Spring at base of Culp's Hill; XII Corps right-flank anchor and water source. Contested overnight."
      },
      {
        name:  "Rock Creek",
        x:     648,
        y:     420,
        note:  "Stream at the eastern foot of Culp's Hill; Johnson's troops rally here after repulse."
      },
      {
        name:  "Union Breastworks (lower)",
        x:     598,
        y:     416,
        note:  "Log-and-earth works abandoned by XII Corps during Day 2 night maneuver; briefly held by Confederates, recaptured by 11 a.m. 3 July."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // STEP: The Great Cannonade
  //   ~1:00–3:00 p.m., 3 July 1863. Longstreet masses ~159 guns
  //   along Seminary Ridge in the greatest artillery bombardment of
  //   the Civil War. Hunt deliberately slows Union counter-battery
  //   fire after ~90 minutes to conserve ammunition for the infantry
  //   assault. Confederates misread the silence as silenced guns.
  // ─────────────────────────────────────────────────────────────────
  "The Great Cannonade": {

    arrows: [
      {
        side: "confederate",
        from: [402, 462],
        to:   [500, 470],
        lbl:  "Confederate gun line opens",
        narr: "At 1:00 p.m. the Confederate guns open; Longstreet has 159 guns massed opposite the Union center for the bombardment that precedes the assault."
      },
      {
        side: "confederate",
        from: [390, 430],
        to:   [498, 450],
        lbl:  "Massed guns target the center",
        narr: "The massed Confederate batteries opposite the Union center concentrate their fire on Cemetery Hill and the II Corps line on Cemetery Ridge."
      },
      {
        side: "union",
        from: [510, 470],
        to:   [420, 462],
        lbl:  "Union guns answer — then cease fire",
        narr: "Union artillery answers until about 2:00 p.m., when their firing is stopped to conserve ammunition; the Confederate gunners conclude they have silenced the Union cannon."
      },
      {
        side: "union",
        from: [530, 372],
        to:   [420, 444],
        lbl:  "Cemetery Hill batteries reply",
        narr: "The Union batteries on Cemetery Hill take part in the counter-battery duel before the order comes to cease fire and save ammunition."
      },
      {
        side: "confederate",
        from: [390, 500],
        to:   [498, 490],
        lbl:  "Southern guns extend the line",
        narr: "The southern Confederate batteries near the Peach Orchard extend the gun line, adding weight to the bombardment of the Union center."
      },
      {
        side: "union",
        from: [512, 500],
        to:   [430, 482],
        lbl:  "Reserve guns conserve ammunition",
        narr: "Union artillery firing is stopped at about 2:00 p.m. to conserve ammunition for the infantry assault the cannonade is meant to precede."
      },
      {
        side: "confederate",
        from: [404, 468],
        to:   [502, 456],
        lbl:  "Gunners urge Pickett to advance",
        narr: "Their own ammunition being almost exhausted, the Confederate artillerymen urge Pickett to advance while they still can support him."
      }
    ],

    artillery: [
      {
        side: "confederate",
        name: "Alexander's I Corps Btln (Dearing, Cabell, Eshleman, Huger, Henry) — Seminary Ridge north",
        x: 400,
        y: 456
      },
      {
        side: "confederate",
        name: "Alexander's I Corps Btln — Seminary Ridge center",
        x: 396,
        y: 472
      },
      {
        side: "confederate",
        name: "Cabell/Henry Btln — Seminary Ridge south / Peach Orchard area",
        x: 392,
        y: 496
      },
      {
        side: "confederate",
        name: "Pegram/McIntosh Btlns (III Corps) — Seminary Ridge north",
        x: 390,
        y: 436
      },
      {
        side: "union",
        name: "Hazard — II Corps Arty Bde (Woodruff, Arnold, Cushing, Brown, Rorty)",
        x: 506,
        y: 464
      },
      {
        side: "union",
        name: "McGilvery — Arty Reserve line (Bigelow, Phillips, Hart, Thompson)",
        x: 512,
        y: 496
      },
      {
        side: "union",
        name: "Osborn — XI Corps Arty (Cemetery Hill)",
        x: 530,
        y: 374
      },
      {
        side: "union",
        name: "Wainwright — I Corps Arty (Cemetery Hill north)",
        x: 524,
        y: 368
      }
    ],

    keyterrain: [
      {
        name:  "Seminary Ridge — Confederate gun line",
        x:     396,
        y:     462,
        note:  "~1 mile of Confederate artillery massed along the crest of Seminary Ridge — ~159 guns in the largest bombardment of the Civil War."
      },
      {
        name:  "Cemetery Ridge — Union gun line",
        x:     506,
        y:     470,
        note:  "Union II Corps and Artillery Reserve batteries on the reverse slope. Hunt controls counter-battery response and deliberately ceases fire at ~2:00 p.m."
      },
      {
        name:  "Cemetery Hill",
        x:     530,
        y:     374,
        note:  "Dominant height at the northern anchor of the Union line. Osborn's XI Corps artillery fires obliquely into the Confederate gun line from the north."
      },
      {
        name:  "Emmitsburg Road",
        x:     452,
        y:     480,
        note:  "The road running diagonally between Seminary and Cemetery Ridges — a key alignment feature and fence-obstacle for Pickett's approaching infantry."
      },
      {
        name:  "The Angle / Copse of Trees",
        x:     502,
        y:     470,
        note:  "The aiming point of the Confederate bombardment and the objective of Pickett's Charge — a distinctive clump of trees on Cemetery Ridge, visible for miles."
      },
      {
        name:  "Peach Orchard",
        x:     428,
        y:     520,
        note:  "Elevated ground at the Emmitsburg Road salient; Confederate artillery crowded in here for enfilading fire on Day 2; used as southern gun-line anchor on Day 3."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // STEP: Pickett's Charge — the High-Water Mark
  //   ~3:00 p.m., 3 July 1863. ~15,000 Confederates step off
  //   Seminary Ridge in the assault Lee ordered on the Union center.
  //   Three divisions (Pickett, Pettigrew, Trimble) advance ~1 mile
  //   across open fields under converging artillery and musketry.
  //   Armistead momentarily breaks through the Angle — the high-water
  //   mark of the Confederacy — before the breakthrough collapses.
  // ─────────────────────────────────────────────────────────────────
  "Pickett's Charge — the High-Water Mark": {

    arrows: [
      // ── Pickett's Division (south / right): advance, then recoil ──
      {
        side: "confederate",
        from: [408, 486],
        to:   [500, 472],
        lbl:  "Pickett — drives toward the center",
        narr: "Confederate infantry pours from the woods along Seminary Ridge; Pickett's division advances on the right of the assault across the open fields toward the Union center, converging artillery tearing gaps in the ranks as the men close up and come on gallantly."
      },
      {
        side: "confederate",
        from: [500, 472],
        to:   [410, 488],
        lbl:  "Pickett — division wrecked, recoils",
        dashed: true,
        fate: "wrecked",
        narr: "For a moment the central mass storms into the first Union line at the wall — Armistead leads a few hundred men over the stones, his hat on his sword, and falls mortally wounded among Cushing's guns at the high-water mark. Then the Federals close in: Garnett is killed, Kemper wounded, Armistead mortally hit, and Pickett's wrecked division recoils across the field it crossed."
      },
      // ── Pettigrew's Division (Heth's, north / left): advance, recoil ──
      {
        side: "confederate",
        from: [392, 446],
        to:   [494, 461],
        lbl:  "Pettigrew — advances on the left",
        narr: "Pettigrew's division (Heth's) advances on the left of the assault, its right guiding on Pickett's men toward the Union center as the ranks close up under converging artillery and musketry from Cemetery Hill and Cemetery Ridge."
      },
      {
        side: "confederate",
        from: [494, 461],
        to:   [398, 446],
        lbl:  "Pettigrew — broken short of the wall",
        dashed: true,
        fate: "wrecked",
        narr: "Broken short of the wall by converging fire and flanked on the left, Pettigrew's division falls back across the open fields, leaving its dead and wounded strewn before the Union line."
      },
      // ── Trimble's Division (Pender's, second line): advance, recoil ──
      {
        side: "confederate",
        from: [386, 430],
        to:   [488, 454],
        lbl:  "Trimble — supports in the second line",
        narr: "Trimble's division (Pender's) follows in the second line on the left, advancing in support of Pettigrew into the converging fire; Trimble himself is wounded in the advance."
      },
      {
        side: "confederate",
        from: [488, 454],
        to:   [388, 432],
        lbl:  "Trimble — broken up, falls back",
        dashed: true,
        fate: "broken",
        narr: "Trimble's supporting line is broken up by the converging fire and the retreating men and dissolves before reaching the wall, the survivors streaming back toward Seminary Ridge."
      },
      // ── Union defenders ──────────────────────────────────────────
      {
        side: "union",
        from: [502, 470],
        to:   [502, 470],
        lbl:  "Federals hold the wall",
        narr: "The Union infantry at the wall holds against the central mass that stormed into the first line, then the Federals close in on the penetration."
      },
      {
        side: "union",
        from: [508, 484],
        to:   [506, 470],
        lbl:  "Federals close in from the south",
        narr: "Union infantry comes forward from the south against the flank of the assault, helping to close in on the central penetration."
      },
      {
        side: "union",
        from: [510, 458],
        to:   [506, 470],
        lbl:  "Federals close in from the north",
        narr: "Union infantry presses in from the north as the Federals close on the penetration, and the attack of Pickett's men collapses."
      },
      // ── Flank fire ───────────────────────────────────────────────
      {
        side: "union",
        from: [492, 506],
        to:   [440, 490],
        lbl:  "Union infantry takes the flank",
        narr: "Union infantry comes forward against the flank of Pickett's right, raking the advancing mass from the side as it converges on the wall."
      },
      // ── Converging artillery ─────────────────────────────────────
      {
        side: "union",
        from: [530, 374],
        to:   [450, 460],
        lbl:  "Cemetery Hill guns — converging fire",
        narr: "The Union guns on Cemetery Hill join the converging artillery fire that tears gaps in the Confederate ranks as they advance across the open fields."
      },
      {
        side: "union",
        from: [514, 494],
        to:   [440, 476],
        lbl:  "Reserve guns rake the south flank",
        narr: "The Union reserve batteries on the southern part of the ridge add their fire against the flank of Pickett's right as the assault closes on the line."
      },
      // ── East Cavalry Field ───────────────────────────────────────
      {
        side: "confederate",
        from: [660, 380],
        to:   [700, 374],
        lbl:  "Stuart strikes the Union rear",
        narr: "Stuart, with all the army's cavalry, rides east to strike the Union rear in coordination with Longstreet's assault on the Federal center."
      },
      {
        side: "union",
        from: [700, 374],
        to:   [668, 380],
        lbl:  "Gregg drives Stuart back",
        narr: "Behind the main fight, Brig. Gen. David M. Gregg intercepts Stuart and drives him back, foiling the blow against the Union rear."
      }
    ],

    artillery: [
      // Union — defending
      {
        side: "union",
        name: "Cushing — Battery A, 4th US (at the Angle)",
        x: 502,
        y: 468
      },
      {
        side: "union",
        name: "Arnold — Battery A, 1st RI (center Cemetery Ridge)",
        x: 506,
        y: 476
      },
      {
        side: "union",
        name: "Woodruff — Battery I, 1st US (north of Copse)",
        x: 506,
        y: 462
      },
      {
        side: "union",
        name: "Rorty — Battery B, 1st NY (south of Angle)",
        x: 506,
        y: 482
      },
      {
        side: "union",
        name: "McGilvery reserve line — Thompson, Hart, Phillips, Bigelow",
        x: 512,
        y: 498
      },
      {
        side: "union",
        name: "Osborn / Wainwright — Cemetery Hill enfilade batteries",
        x: 530,
        y: 372
      },
      // Confederate — advance
      {
        side: "confederate",
        name: "Alexander — advances 9 guns to Emmitsburg Road (Eshleman's Btn)",
        x: 446,
        y: 478
      }
    ],

    keyterrain: [
      {
        name:  "The Angle — High-Water Mark",
        x:     502,
        y:     470,
        note:  "The stone-wall corner where Armistead and ~200 Confederates breach the Union line. Deepest penetration; Armistead falls at Cushing's guns. 'High-Water Mark of the Confederacy.'"
      },
      {
        name:  "Copse of Trees",
        x:     504,
        y:     474,
        note:  "Small grove of trees on Cemetery Ridge that served as the aiming point for the Confederate assault. Visible to the attacking infantry across the open fields."
      },
      {
        name:  "Seminary Ridge — assault start line",
        x:     400,
        y:     470,
        note:  "Confederate infantry steps off from the tree line on Seminary Ridge, ~1 mile west of the Angle. The open fields between offer no cover."
      },
      {
        name:  "Emmitsburg Road / fence line",
        x:     450,
        y:     476,
        note:  "Post-and-rail fences on both sides of the Emmitsburg Road — a major obstacle midway across the field that disrupts Confederate formation and channels them into killing zones."
      },
      {
        name:  "Cemetery Ridge — Union main line",
        x:     506,
        y:     478,
        note:  "Low crest of Cemetery Ridge occupied by Gibbon's II Corps division. Webb, Hall, and Harrow hold ~600 yards of front. Stone wall provides cover for defenders."
      },
      {
        name:  "Cemetery Hill",
        x:     530,
        y:     374,
        note:  "Northern anchor of Union line; Osborn's massed artillery delivers enfilade fire down the length of Pettigrew's line throughout the assault."
      },
      {
        name:  "Stannard's position (VT Bde)",
        x:     492,
        y:     506,
        note:  "Brig. Gen. Stannard's Vermont brigade, held south of the II Corps line; they wheel north-oblique to deliver the flank fire that collapses Kemper and helps seal the Angle."
      },
      {
        name:  "East Cavalry Field",
        x:     680,
        y:     376,
        note:  "~3 miles east of Gettysburg; Stuart's four cavalry brigades clash with Gregg and Custer. Confederate flanking threat foiled concurrent with Pickett's repulse."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // STEP: The Line Holds
  //   Post-assault, ~3:30–5:00 p.m., 3 July 1863. Pickett's,
  //   Pettigrew's, and Trimble's survivors stagger back to Seminary
  //   Ridge. Lee rallies the remnants and braces for a counterattack
  //   that Meade never launches. The Army of Northern Virginia has
  //   shot its bolt.
  // ─────────────────────────────────────────────────────────────────
  "The Line Holds": {

    arrows: [
      {
        side: "confederate",
        from: [500, 474],
        to:   [400, 480],
        lbl:  "ANV survivors retreat to Seminary Ridge",
        narr: "The attack collapses: some quit, more ran, and many died, the fugitives straggling back to Seminary Ridge under the Union guns."
      },
      {
        side: "confederate",
        from: [496, 466],
        to:   [396, 462],
        lbl:  "Pettigrew/Trimble remnants withdraw",
        narr: "The remnants of Pettigrew's and Trimble's divisions stagger back across the open fields, still mercilessly hammered by the Union guns."
      },
      {
        side: "union",
        from: [506, 470],
        to:   [506, 470],
        lbl:  "Hancock (wounded) urges counterattack",
        narr: "Hancock, wounded in Pickett's final assault, urges an immediate counterattack by the V and VI Corps — the VI Corps fresh, having hardly fired a shot."
      },
      {
        side: "union",
        from: [506, 472],
        to:   [480, 468],
        lbl:  "II Corps holds and consolidates the wall",
        narr: "The Federals close in and consolidate the line along the wall; the center has held and the assault is broken."
      },
      {
        side: "confederate",
        from: [390, 470],
        to:   [390, 490],
        lbl:  "Lee rallies remnants — braces for counterattack",
        narr: "'It's all my fault,' Lee tells the throng of fugitives; aided by Longstreet, he hastily rallies them to meet the counterattack he expects, but which never comes."
      },
      {
        side: "union",
        from: [560, 420],
        to:   [570, 420],
        lbl:  "XII Corps — Culp's Hill secured all day",
        narr: "With Johnson driven back by 11:00 a.m., Slocum's XII Corps holds Culp's Hill and the Union right for the rest of the day."
      },
      {
        side: "union",
        from: [700, 374],
        to:   [690, 374],
        lbl:  "Stuart repulsed — Union rear secure",
        narr: "Gregg has driven Stuart back, so no Confederate force reaches the Union rear; Lee's coordinated plan has failed on the center and the flanks alike."
      }
    ],

    artillery: [
      {
        side: "union",
        name: "McGilvery — fires on retreating Confederates",
        x: 512,
        y: 496
      },
      {
        side: "union",
        name: "Hazard / II Corps Btry — consolidates ammunition",
        x: 506,
        y: 466
      },
      {
        side: "union",
        name: "Cemetery Hill — long-range fire on Seminary Ridge",
        x: 530,
        y: 374
      },
      {
        side: "confederate",
        name: "Alexander — rallies depleted gun line on Seminary Ridge",
        x: 398,
        y: 462
      }
    ],

    keyterrain: [
      {
        name:  "The Angle — held",
        x:     502,
        y:     470,
        note:  "The stone-wall angle where the breakthrough was sealed. Webb's men hold the position; Armistead's body lies at the gun line. Union line never broken."
      },
      {
        name:  "Seminary Ridge — Lee's rally point",
        x:     396,
        y:     468,
        note:  "Lee meets the survivors here, reasserting control and bracing for the counterattack he knows is coming — that never arrives. The Army of Northern Virginia is intact but spent."
      },
      {
        name:  "Cemetery Ridge — intact Union line",
        x:     506,
        y:     476,
        note:  "The Union fishhook from Cemetery Hill through Cemetery Ridge and south to the Round Tops is unbroken. Meade's defensive victory is complete."
      },
      {
        name:  "Cemetery Hill",
        x:     530,
        y:     374,
        note:  "Northern anchor secure throughout. Union artillery platform that delivered decisive enfilade fire during the charge."
      },
      {
        name:  "Culp's Hill",
        x:     588,
        y:     396,
        note:  "Held by XII Corps since 11 a.m. Lee's attempt to unhinge the Union right and left simultaneously on 3 July has failed on both flanks and the center."
      }
    ]
  }

});
