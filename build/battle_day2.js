window.GB=window.GB||{}; GB.battleDetail=GB.battleDetail||{};
Object.assign(GB.battleDetail,{

  /* ============================================================
     STEP 1 — Lee's Plan vs. Longstreet's Counsel
     Context: early morning 2 July; armies are in position.
     Lee's HQ: Virginia Memorial area ≈ x:392, y:470
     Longstreet's corps staging: Warfield Ridge ≈ x:392, y:560
     ============================================================ */
  "Lee's Plan vs. Longstreet's Counsel":{
    arrows:[
      {side:"conf", from:[392,560], to:[430,520], lbl:"Longstreet's axis", narr:"Lee's plan for 2 July is for Longstreet to get around the Federal left — which Lee mistakenly thinks is along the Emmitsburg Road — and attack north."},
      {side:"conf", from:[392,470], to:[470,470], lbl:"Anderson supports", narr:"Anderson's division is then to join the assault on Longstreet's left, extending the attack against the Union center on Cemetery Ridge."},
      {side:"conf", from:[560,300], to:[572,390], lbl:"Ewell attacks right", narr:"Ewell is to attack the Union right when he hears Longstreet's guns, the supporting jaw of Lee's intended double envelopment."},
      {side:"conf", from:[350,560], to:[420,560], lbl:"Countermarch", narr:"Disgruntled, Longstreet advances over strange ground, trying to avoid detection by the Federal signal station on Little Round Top."},
      {side:"union", from:[500,470], to:[500,410], lbl:"II Corps holds the center", narr:"Hancock's II Corps holds Cemetery Ridge in the center of the Union fishhook as Meade shifts forces to meet the attack on the left."},
      {side:"union", from:[514,600], to:[514,580], lbl:"Round Tops unoccupied", narr:"One of three flaws in the Federal position: the Round Tops are not occupied, held only by a small signal detail."},
      {side:"conf", from:[392,470], to:[430,500], lbl:"Lee's attack order", narr:"Lee had wanted an early attack, but it is 11:00 a.m. before his orders are issued, directing Longstreet onto the Federal left."}
    ],
    artillery:[
      {side:"conf", name:"Alexander's Arty Bn (Col. Alexander)", x:390, y:500},
      {side:"conf", name:"Henry's Bn (Hood's arty)", x:385, y:555},
      {side:"conf", name:"Cabell's Bn (McLaws' arty)", x:388, y:520},
      {side:"union", name:"McGilvery's Reserve Arty Line", x:490, y:490},
      {side:"union", name:"Hunt's Arty Reserve (Cemetery Ridge)", x:500, y:450}
    ],
    keyterrain:[
      {name:"Seminary Ridge (Conf main line)", x:392, y:480, note:"ANV axis of departure, north–south"},
      {name:"Warfield Ridge (Longstreet staging)", x:385, y:560, note:"Southernmost Confederate infantry position"},
      {name:"Emmitsburg Road", x:430, y:510, note:"Lee's assumed Union left-flank anchor"},
      {name:"Little Round Top (signal station)", x:514, y:600, note:"Key terrain — unoccupied, commands the field"},
      {name:"Cemetery Ridge (Union line)", x:500, y:470, note:"Hancock's II Corps holds the center"},
      {name:"Virginia Memorial (Lee's HQ area)", x:392, y:472, note:"Lee observes and directs from Seminary Ridge"}
    ]
  },

  /* ============================================================
     STEP 2 — Sickles Advances to the Peach Orchard
     ~3:00–5:30 p.m. — Longstreet's en-echelon assault
     Hood attacks first (south), then McLaws, then Anderson
     ============================================================ */
  "Sickles Advances to the Peach Orchard":{
    arrows:[
      /* Sickles' unauthorized advance */
      {side:"union", from:[500,470], to:[428,520], lbl:"Sickles advances", narr:"Sickles moves his corps forward from the ground just north of the Round Tops without permission; the new salient, apex at the Peach Orchard, is too extensive for one corps."},

      /* Hood's division — rightmost echelon, attacks first ~4:00 p.m. — single vector */
      {side:"conf", from:[388,580], to:[472,610], lbl:"Hood→Devil's Den", narr:"At 4:00 p.m. Longstreet attacks; Hood's division rapidly smashes Sickles' left flank and overruns the Devil's Den, then goes clawing up the west side of Little Round Top — the key to the Federal position, from whose crest artillery could fire straight down the Union line."},

      /* McLaws' division — second echelon, attacks ~4:30 p.m. */
      {side:"conf", from:[386,514], to:[452,550], lbl:"Kershaw→Wheatfield", narr:"Longstreet's attack rolls north against Sickles' center, which holds longer than the left as the fighting surges through the Wheatfield."},
      {side:"conf", from:[384,522], to:[428,524], lbl:"Barksdale→Peach Orchard", narr:"Longstreet's brigades break through the Peach Orchard salient, which the Confederate artillery had taken under fire from two directions."},
      {side:"conf", from:[386,530], to:[445,544], lbl:"Semmes→Wheatfield", narr:"The piecemeal but savage Confederate assault presses the Wheatfield, forcing Sickles' line to give ground brigade by brigade."},
      {side:"conf", from:[387,505], to:[440,518], lbl:"Wofford→breakthrough", narr:"Longstreet's fresh brigades drive through the Peach Orchard gap and sweep toward Cemetery Ridge before being checked, Sickles' center and right eventually driven back."},

      /* Anderson's division of Hill's corps — third echelon */
      {side:"conf", from:[392,468], to:[490,476], lbl:"Anderson — one brigade breaks through", narr:"Anderson's division joins the assault; one of its brigades momentarily breaks through the Federal center, but is immediately expelled."},
      {side:"conf", from:[392,456], to:[480,460], lbl:"Anderson — poorly coordinated", narr:"Anderson's advance is poorly coordinated, and the rest of his division fails to exploit the brief penetration of the Union center."},

      /* Union response / Caldwell's counterattack into Wheatfield */
      {side:"union", from:[504,460], to:[455,548], lbl:"II Corps → Wheatfield", narr:"Hancock feeds reserves into the Wheatfield to shore up Sickles' collapsing line and contest the field with Longstreet's brigades. These roughly 19 acres change hands about six times, earning the name the 'Bloody Wheatfield.'"},
      {side:"union", from:[492,506], to:[490,530], lbl:"Center sealed", narr:"With a gap torn in the center, Hancock hurls the 1st Minnesota — about 262 men — at an advancing Confederate brigade to buy minutes for reserves; the regiment takes roughly 82 per cent casualties, among the war's highest, but the penetration is sealed."},
      {side:"union", from:[510,590], to:[475,570], lbl:"V Corps counterattacks", narr:"Meade has ordered Sykes' V Corps to support the left flank; its counterattack from the Round Tops checks Longstreet's spent brigades and secures the southern flank."},

      /* Signature Day-2 artillery actions */
      {side:"union", from:[424,520], to:[452,500], lbl:"Bigelow — prolonge to Trostle", narr:"As the Peach Orchard line collapses about 6:00 p.m., Bigelow's 9th Massachusetts Battery retires firing by prolonge — recoil dragging the guns rearward — back toward the Trostle farm to buy McGilvery time to form a new line; overrun there, it loses four of its six guns in the desperate stand.", fate:"overrun"},
      {side:"union", from:[472,602], to:[478,608], lbl:"Smith — Devil's Den guns", narr:"Smith's 4th New York Battery, posted on Houck's Ridge above the Devil's Den, is overwhelmed by Benning's and Robertson's brigades about 5:00 p.m.; three of its guns are overrun and captured among the boulders.", fate:"overrun"}
    ],
    artillery:[
      {side:"conf", name:"Alexander's Bn — Peach Orchard ridge", x:415, y:516},
      {side:"conf", name:"Cabell's Bn (McLaws) — Emmitsburg Rd", x:400, y:524},
      {side:"conf", name:"Henry's Bn (Hood) — Warfield Ridge", x:388, y:558},
      {side:"union", name:"Bigelow's 9th Mass Btry — Trostle Farm", x:447, y:530},
      {side:"union", name:"Phillips's 5th Mass Btry — Wheatfield Rd", x:452, y:524},
      {side:"union", name:"Thompson's PA Btry — Peach Orchard", x:430, y:518},
      {side:"union", name:"Clark's NJ Btry — Emmitsburg Rd salient", x:422, y:520},
      {side:"union", name:"McGilvery's Reserve line — Cemetery Ridge", x:490, y:492},
      {side:"union", name:"Hazard's II Corps Btry — Cemetery Ridge", x:500, y:460}
    ],
    keyterrain:[
      {name:"The Peach Orchard", x:426, y:520, note:"Sickles' exposed apex; shelled from two sides"},
      {name:"The Wheatfield", x:455, y:552, note:"Changes hands six times in 90 minutes"},
      {name:"Rose Woods", x:438, y:546, note:"Kershaw and Semmes drive through to Wheatfield"},
      {name:"Devil's Den / Houck's Ridge", x:472, y:614, note:"Law and Robertson seize boulder field"},
      {name:"Plum Run / Valley of Death", x:490, y:576, note:"Broken ground between Devil's Den and LRT"},
      {name:"Trostle Farm", x:448, y:528, note:"Bigelow's guns fight desperate delaying action"},
      {name:"Emmitsburg Road", x:418, y:504, note:"Sickles' right anchors here; Barksdale smashes it"},
      {name:"Cemetery Ridge (Union fallback)", x:498, y:470, note:"Line that must hold after III Corps collapses"},
      {name:"Big Round Top", x:524, y:660, note:"Wooded mass; Law's men ascend but lack guns"},
      {name:"Little Round Top (south face)", x:510, y:616, note:"Hood's men reach the base — Warren intervenes"}
    ]
  },

  /* ============================================================
     STEP 3 — Little Round Top — Warren's Eye, Chamberlain's Charge
     ~4:00–6:30 p.m.
     ============================================================ */
  "Little Round Top — Warren's Eye, Chamberlain's Charge":{
    arrows:[
      /* Warren's intervention */
      {side:"union", from:[514,590], to:[514,600], lbl:"Warren diverts V Corps", narr:"Warren, the army's chief engineer, climbs Little Round Top, finds it held only by a small signal detail, and on his own responsibility orders two V Corps brigades and a battery onto its summit."},

      /* Vincent's brigade races up */
      {side:"union", from:[508,620], to:[510,600], lbl:"Vincent's bde rushes up", narr:"Colonel Vincent, whose brigade includes the 20th Maine, immediately volunteers to defend the hill and gets his regiments into position a few yards ahead of Hood's men."},

      /* 15th Alabama attacks */
      {side:"conf", from:[474,640], to:[516,618], lbl:"15th Ala — six charges", narr:"Colonel Oates' 15th and 47th Alabama, tired and thirsty after marching all night and day, charge the 20th Maine at least six times, working to turn Chamberlain's exposed left flank."},
      {side:"conf", from:[460,622], to:[506,600], lbl:"Oates presses the left", narr:"A crossfire demolishes the center of Chamberlain's line as the Alabamians press to overlap his refused left flank along the boulders."},

      /* Robertson/Hood up the west face — single consolidated vector */
      {side:"conf", from:[428,604], to:[500,600], lbl:"Hood — up the west face", narr:"Hood's division, having overrun the Devil's Den, goes clawing up the cleared west side of Little Round Top against Vincent's regiments — the key to the Federal position, from whose crest artillery could fire straight down the Union line."},

      /* O'Rorke/Weed and Hazlett reinforce the crest */
      {side:"union", from:[510,570], to:[520,592], lbl:"Weed's brigade — crest", narr:"Warren's second V Corps brigade, Weed's — with O'Rorke's 140th New York at its head — reaches the crest a few yards ahead of Hood's men and drives them off in furious hand-to-hand fighting."},
      {side:"union", from:[514,575], to:[521,593], lbl:"Hazlett's battery — the summit", narr:"Hazlett's Battery D, 5th US, is manhandled by hand up to the summit and opens on the Confederate brigades below, securing the key terrain that controls the Union left."},

      /* Chamberlain's bayonet charge */
      {side:"union", from:[522,622], to:[490,638], lbl:"Chamberlain — bayonet", narr:"Out of ammunition after the sixth charge, Chamberlain fixes bayonets and charges downhill like a great swinging door — left flank first, right hinged on the 83d Pennsylvania — and the stunned Alabamians fall back to the 4th and 5th Texas."},

      /* Crawford's counterattack from the hill */
      {side:"union", from:[514,600], to:[460,558], lbl:"V Corps seals the flank", narr:"With the summit held, the V Corps counterattacks into the broken ground below, driving Longstreet's exhausted brigades back and sealing the southern Union flank."}
    ],
    artillery:[
      {side:"union", name:"Smith's 4th NY Btry — Devil's Den (lost)", x:472, y:614},
      {side:"conf", name:"Reilly's Rowan (NC) Btry — Warfield Ridge", x:390, y:562},
      {side:"union", name:"McGilvery's consolidated line", x:488, y:494}
    ],
    keyterrain:[
      {name:"Little Round Top — summit", x:514, y:596, note:"Controls entire Union left; must be held"},
      {name:"Little Round Top — south slope", x:516, y:620, note:"Chamberlain's 20th Maine fights here"},
      {name:"Little Round Top — west face", x:500, y:606, note:"Vincent's right regiments hold the boulders"},
      {name:"Big Round Top", x:524, y:660, note:"15th Ala descends from here for the assault"},
      {name:"Devil's Den / Houck's Ridge", x:472, y:614, note:"Law and Robertson seize; enfilades LRT base"},
      {name:"Plum Run / Valley of Death", x:490, y:578, note:"Broken ground; Confederates caught in crossfire"},
      {name:"Signal station (LRT crest)", x:513, y:591, note:"Warren's observation point — saves the flank"},
      {name:"Rose Woods / Wheatfield approach", x:440, y:550, note:"Crawford's reserve avenue of approach"}
    ]
  },

  /* ============================================================
     STEP 4 — Culp's Hill & East Cemetery Hill
     Evening attacks ~7:00–9:30 p.m.
     ============================================================ */
  "Culp's Hill & East Cemetery Hill":{
    arrows:[
      /* Johnson's assault on Culp's Hill */
      {side:"conf", from:[640,400], to:[590,416], lbl:"Johnson seizes the lower works", narr:"It is almost dark when Ewell's infantry attacks; Johnson occupies some empty entrenchments at the foot of Culp's Hill, but cannot carry the hill itself."},
      {side:"conf", from:[636,390], to:[576,404], lbl:"Steuart presses the wooded hill", narr:"Steuart's brigade presses up the rugged, wooded mass of Culp's Hill in the gathering dark but cannot dislodge the Union defenders above."},
      {side:"conf", from:[630,408], to:[580,416], lbl:"Jones at the upper works", narr:"Jones' brigade attacks the upper works but the entrenched Union line holds, and the hill itself is not carried."},
      {side:"union", from:[572,408], to:[580,420], lbl:"XII Corps holds the upper hill", narr:"The entrenched XII Corps line holds the upper hill against Johnson's attack in the dark, so that he gains only the empty works at its foot."},

      /* Early's assault on East Cemetery Hill — one assault, then driven off */
      {side:"conf", from:[560,330], to:[530,362], lbl:"Early — East Cemetery Hill", narr:"Attacking the eastern side of Cemetery Hill in the dusk, two of Early's brigades — Hays' Louisiana 'Tigers' and Avery's North Carolinians — fight their way up the steep slope and reach the crest among the Federal guns."},
      {side:"union", from:[530,372], to:[528,360], lbl:"Cemetery Hill driven clear", narr:"The Union defenders of Cemetery Hill close in with the bayonet to retake the batteries; unsupported, Early's brigades cannot hold what they have won."},
      {side:"conf", from:[530,362], to:[558,332], lbl:"Early driven off the crest", dashed:true, narr:"Their lodgement unsupported, Early's brigades are thrown back down the eastern slope into the dark — only their dead stay on the crest.", fate:"broken"},
      {side:"conf", from:[520,300], to:[528,354], lbl:"Ewell's guns silenced", narr:"Ewell's artillery opened at the sound of Longstreet's guns, but Union batteries soon silenced it, leaving Early's evening attack unsupported."},

      /* Anderson's late contribution on center */
      {side:"conf", from:[392,468], to:[488,474], lbl:"Center penetration expelled", narr:"The lone brigade of Anderson's that momentarily broke through the Federal center is expelled, and the Cemetery Ridge line holds."},

      /* Union interior line shuttling */
      {side:"union", from:[500,450], to:[572,408], lbl:"Meade's interior lines hold", narr:"Meade's compact fishhook lets him shift reserves to each threatened point in turn; that night his corps commanders vote to stay and fight."}
    ],
    artillery:[
      {side:"union", name:"Osborn's XI Corps Btry — Cemetery Hill", x:526, y:370},
      {side:"union", name:"Wiedrich's NY Btry I — East Cemetery Hill", x:532, y:362},
      {side:"union", name:"Stevens' 5th Maine Btry — Culp's Hill base", x:568, y:412},
      {side:"conf", name:"Ewell's Corps Arty — town & Benner's Hill", x:540, y:302},
      {side:"conf", name:"Jones' (Arty Bn) — Benner's Hill enfilade", x:580, y:318},
      {side:"union", name:"Taft's 5th NY Btry — Cemetery Hill west", x:520, y:376}
    ],
    keyterrain:[
      {name:"Culp's Hill — upper works (Greene holds)", x:572, y:408, note:"Entrenched; Greene's thin line stops Johnson"},
      {name:"Culp's Hill — lower works (Johnson seizes)", x:590, y:424, note:"Vacated by XII Corps; occupied by Steuart/Jones"},
      {name:"East Cemetery Hill", x:530, y:362, note:"Hays and Avery briefly crest — driven back"},
      {name:"Cemetery Hill — guns", x:524, y:370, note:"XI Corps artillery the Confederates must silence"},
      {name:"Baltimore Pike", x:576, y:398, note:"Steuart within striking distance of the Pike — the army's lifeline threatened, not cut"},
      {name:"Rock Creek", x:632, y:408, note:"Johnson crosses to attack; obstacle in retreat"},
      {name:"Benner's Hill (Conf arty)", x:582, y:316, note:"Ewell's guns silenced before infantry attacks"},
      {name:"Cemetery Ridge — center", x:498, y:468, note:"Wright briefly penetrates; Carroll expels him"},
      {name:"Power's Hill (Meade's HQ)", x:540, y:390, note:"Meade directs reserve shuttling from here"}
    ]
  }

});
