window.GB = window.GB || {};
GB.battleDetail = GB.battleDetail || {};

Object.assign(GB.battleDetail, {

  "Buford's Stand West of Town": {
    arrows: [
      {
        side: "conf",
        from: [160, 320],
        to:   [250, 314],
        lbl:  "Heth advances east",
        narr: "Heth's division, followed by Pender's, leaves Cashtown at 5:00 a.m. on 1 July to 'get those shoes,' certain all the Federal infantry is still far to the south."
      },
      {
        side: "conf",
        from: [160, 290],
        to:   [250, 286],
        lbl:  "Heth's left advances north of the pike",
        narr: "Heth's left-flank brigade advances north of the Chambersburg Pike, against the Federal cavalry confronting the division on McPherson's Ridge."
      },
      {
        side: "conf",
        from: [165, 340],
        to:   [200, 330],
        lbl:  "Pender follows in reserve",
        narr: "Pender's division follows Heth's down the Cashtown road, available to renew the attack once Heth's leading brigades are spent."
      },
      {
        side: "union",
        from: [346, 362],
        to:   [310, 340],
        lbl:  "Gamble — McPherson Ridge",
        narr: "Gamble's brigade fights dismounted along McPherson's Ridge; though badly outnumbered, the troopers' breech-loading carbines give them the firepower of several times their number of infantry."
      },
      {
        side: "union",
        from: [372, 300],
        to:   [340, 280],
        lbl:  "Devin — Carlisle Rd screen",
        narr: "Buford's other brigade is deployed across the Carlisle Road, considerably north of Gettysburg, awaiting Ewell."
      },
      {
        side: "confcav",
        from: [250, 314],
        to:   [310, 320],
        lbl:  "Heth probes, stalls",
        narr: "For almost two hours this single brigade and one battery of artillery stop Heth's advance, until by 10:30 a.m. Reynolds is on the field."
      },
      {
        side: "union",
        from: [346, 362],
        to:   [400, 370],
        lbl:  "Gamble falls back — Seminary",
        narr: "Buford's line is pushed back to Seminary Ridge as the pressure mounts, his troopers delaying until Wadsworth's infantry can relieve them."
      },
      {
        side: "union",
        from: [420, 330],
        to:   [380, 310],
        lbl:  "Reynolds gallops to the front",
        narr: "Reynolds, a fighter who judges Gettysburg a good place for a battle, brings up his I Corps and orders Howard's XI Corps forward — and is killed by a sharpshooter."
      },
      {
        side: "union",
        from: [330, 340],
        to:   [400, 372],
        lbl:  "Calef — displaces rearward",
        dashed: true,
        narr: "Calef's Battery (2nd US Artillery), Buford's lone gun support, fights from McPherson's Ridge through the morning, then displaces its sections rearward toward Seminary Ridge about 10:00–10:30 a.m. as Heth's pressure mounts — withdrawn intact, not lost, until Wadsworth's infantry can relieve the cavalry."
      }
    ],
    artillery: [
      {
        side: "union",
        name: "Calef's Btry (2nd US Art.)",
        x: 330,
        y: 340
      },
      {
        side: "conf",
        name: "Pegram's Bn — Herr Ridge",
        x: 195,
        y: 318
      },
      {
        side: "conf",
        name: "McIntosh's Bn — Cashtown Pike",
        x: 210,
        y: 330
      }
    ],
    keyterrain: [
      {
        name: "McPherson Ridge",
        x:   305,
        y:   330,
        note: "First defensible ground west of town"
      },
      {
        name: "Herbst Woods",
        x:   295,
        y:   348,
        note: "Dense woodlot anchoring Buford's left"
      },
      {
        name: "Herr Ridge",
        x:   195,
        y:   325,
        note: "Confederate gun line; Heth's staging area"
      },
      {
        name: "Chambersburg Pike",
        x:   245,
        y:   310,
        note: "Main axis of Heth's advance east"
      },
      {
        name: "Seminary Ridge",
        x:   410,
        y:   345,
        note: "Last ridge before town; fall-back line"
      },
      {
        name: "Oak Hill",
        x:   395,
        y:   248,
        note: "Commanding height dominating both ridges"
      },
      {
        name: "Gettysburg — road hub",
        x:   500,
        y:   355,
        note: "Ten roads converge; strategic necessity"
      }
    ]
  },

  "Reynolds Falls; the Iron Brigade Holds": {
    arrows: [
      {
        side: "union",
        from: [420, 360],
        to:   [346, 346],
        lbl:  "Iron Brigade to Herbst Woods",
        narr: "Around 11:00 a.m. Wadsworth's division relieves Buford's brigade on Seminary Ridge, meeting Heth's attack with a furious counterattack which wrecks his two leading brigades."
      },
      {
        side: "union",
        from: [420, 340],
        to:   [360, 328],
        lbl:  "Cutler — north of the pike",
        narr: "Wadsworth's brigade north of the Chambersburg Pike meets Heth's attack to stabilize the right of the I Corps line."
      },
      {
        side: "conf",
        from: [250, 332],
        to:   [346, 346],
        lbl:  "Confederate push into Herbst Woods",
        narr: "Heth's southern leading brigade presses into the woods on McPherson's Ridge and is wrecked by the Iron Brigade's furious counterattack; its commander is captured — the first of Lee's generals taken in the war."
      },
      {
        side: "conf",
        from: [248, 302],
        to:   [340, 290],
        lbl:  "Confederate drive north of the pike",
        narr: "Heth's northern leading brigade drives forward north of the pike before Cutler's regiments trap much of it in the unfinished railroad cut and force its surrender."
      },
      {
        side: "union",
        from: [360, 328],
        to:   [335, 295],
        lbl:  "Cutler wheels north to the railroad cut",
        narr: "Cutler's regiments — the 6th Wisconsin and 95th New York among them — wheel north and countercharge into the unfinished railroad cut, trapping the Confederate brigade there and completing the wreck of Heth's two leading brigades."
      },
      {
        side: "conf",
        from: [270, 332],
        to:   [230, 332],
        lbl:  "Heth's brigades wrecked",
        narr: "Heth's two leading brigades, badly wrecked, fall back; there is a lull as Heth waits for Pender to come up."
      },
      {
        side: "conf",
        from: [198, 330],
        to:   [270, 340],
        lbl:  "Pender's Div moves up",
        narr: "After the lull, Pender's fresh division comes up behind Heth's wrecked brigades as A. P. Hill prepares to renew the attack from the west."
      },
      {
        side: "union",
        from: [378, 392],
        to:   [390, 370],
        lbl:  "Buford — left flank screen",
        narr: "Buford's cavalry covers the left of the I Corps line as Doubleday organizes a defense along McPherson's and Seminary Ridges."
      },
      {
        side: "conf",
        from: [390, 248],
        to:   [430, 278],
        lbl:  "Rodes descends Oak Hill",
        narr: "The arrival of Ewell's leading division under Rodes, with artillery on Oak Hill enfilading both Union corps, forces Howard to form line directly north of the town."
      },
      {
        side: "union",
        from: [420, 390],
        to:   [440, 320],
        lbl:  "Robinson's Div — right flank",
        narr: "Robinson's I Corps division extends the Union right toward Oak Hill to meet Rodes' deployment north of the town."
      }
    ],
    artillery: [
      {
        side: "union",
        name: "Hall's 2nd Maine Btry",
        x:   350,
        y:   308
      },
      {
        side: "union",
        name: "Stevens' 5th Maine Btry",
        x:   415,
        y:   355
      },
      {
        side: "union",
        name: "Calef's Btry (2nd US) — falls back",
        x:   380,
        y:   335
      },
      {
        side: "conf",
        name: "Pegram's Bn — McPherson Ridge (adv.)",
        x:   260,
        y:   318
      },
      {
        side: "conf",
        name: "Carter's Bn — Oak Hill",
        x:   398,
        y:   252
      },
      {
        side: "conf",
        name: "McIntosh's Bn — Chambersburg Pike",
        x:   230,
        y:   325
      }
    ],
    keyterrain: [
      {
        name: "McPherson Ridge",
        x:   305,
        y:   330,
        note: "Hard-won; lost to Heth's second push"
      },
      {
        name: "Herbst Woods",
        x:   295,
        y:   350,
        note: "Iron Brigade's stand; Archer captured here"
      },
      {
        name: "Railroad Cut",
        x:   355,
        y:   295,
        note: "Davis' trap; enfiladed by 6th Wisconsin"
      },
      {
        name: "Seminary Ridge",
        x:   415,
        y:   345,
        note: "I Corps final line before town"
      },
      {
        name: "Oak Hill",
        x:   395,
        y:   248,
        note: "Rodes threatens both corps' flanks from here"
      },
      {
        name: "Gettysburg Lutheran Seminary",
        x:   430,
        y:   348,
        note: "Cupola used as observation post"
      },
      {
        name: "Chambersburg Pike",
        x:   290,
        y:   315,
        note: "Axis of main Confederate assault"
      }
    ]
  },

  "The Line Collapses — Rally on Cemetery Hill": {
    arrows: [
      {
        side: "conf",
        from: [395, 248],
        to:   [445, 282],
        lbl:  "Rodes' first attack off Oak Hill",
        narr: "Around 2:00 p.m. Rodes attacks south off Oak Hill, but the XI Corps and Robinson's I Corps division — anxious to avenge Chancellorsville — smash his first assault; Iverson's North Carolina brigade is shattered in line, its dead left in a row that still marks 'Iverson's Pits.'"
      },
      {
        side: "conf",
        from: [395, 248],
        to:   [470, 290],
        lbl:  "Rodes renews the attack as numbers tell",
        narr: "Confederate strength builds up too fast to hold. With Carter's guns on Oak Hill enfilading both corps and Hill renewing his attack from the west, Rodes renews his assault and weight of numbers begins driving the Union line off the ridges north of town."
      },
      {
        side: "conf",
        from: [620, 232],
        to:   [528, 285],
        lbl:  "Early arrives from York onto Barlow's Knoll",
        narr: "About 3:00 p.m. Early's division, having marched from York by way of Heidlersburg, arrives on the field from the northeast and drives southwest onto Barlow's Knoll, rolling up the exposed and unsupported right of the XI Corps; on this flank the Union line gives way more and more rapidly as Early's attack gathers momentum."
      },
      {
        side: "union",
        from: [540, 300],
        to:   [500, 370],
        lbl:  "XI Corps — retreat through town",
        narr: "The XI Corps becomes disorganized during its retreat through Gettysburg, losing a considerable number of prisoners."
      },
      {
        side: "conf",
        from: [300, 360],
        to:   [420, 370],
        lbl:  "Hill renews attack from the west",
        narr: "A. P. Hill renews his attack from the west with Pender's fresh division, cracking the I Corps line and forcing Doubleday's men back through town."
      },
      {
        side: "union",
        from: [470, 398],
        to:   [500, 380],
        lbl:  "I Corps — fighting withdrawal",
        narr: "The I Corps withdraws in relatively good order, covered on its left by Buford."
      },
      {
        side: "union",
        from: [500, 380],
        to:   [520, 374],
        lbl:  "Rally — Cemetery Hill",
        narr: "Howard rallies the remnants of the XI Corps on Cemetery Hill, where Steinwehr has turned the cemetery into a strong point; Cemetery Hill and Ridge soon bristle with guns."
      }
    ],
    artillery: [
      {
        side: "union",
        name: "Wainwright's I Corps Arty — fought clear to Cemetery Hill",
        x:   512,
        y:   382
      },
      {
        side: "union",
        name: "Osborn's XI Corps Arty — Cemetery Hill",
        x:   518,
        y:   368
      },
      {
        side: "union",
        name: "Stevens' 5th Maine — Stevens' Knoll (Cemetery–Culp's saddle)",
        x:   540,
        y:   392
      },
      {
        side: "conf",
        name: "Carter's Bn — Oak Hill (enfilade fire)",
        x:   398,
        y:   252
      },
      {
        side: "conf",
        name: "Jones' Bn — Early's arty (York Pike)",
        x:   590,
        y:   258
      },
      {
        side: "conf",
        name: "Pegram's Bn — Seminary Ridge (adv.)",
        x:   415,
        y:   355
      }
    ],
    keyterrain: [
      {
        name: "Oak Hill",
        x:   395,
        y:   248,
        note: "Confederate artillery enfilades both Union corps"
      },
      {
        name: "Barlow's Knoll",
        x:   526,
        y:   262,
        note: "XI Corps right; exposed salient, Gordon's target"
      },
      {
        name: "Railroad Cut",
        x:   355,
        y:   295,
        note: "Scene of Davis' repulse; now I Corps flank anchor"
      },
      {
        name: "Seminary Ridge",
        x:   425,
        y:   355,
        note: "I Corps' last stand before the retreat"
      },
      {
        name: "Gettysburg — streets",
        x:   495,
        y:   355,
        note: "Deadly gauntlet; hundreds captured in alleys"
      },
      {
        name: "Cemetery Hill",
        x:   520,
        y:   374,
        note: "Anchor of Union rally; Steinwehr's guns bristle"
      },
      {
        name: "Culp's Hill",
        x:   572,
        y:   405,
        note: "Critical right flank; must be held at nightfall"
      },
      {
        name: "York Pike",
        x:   600,
        y:   262,
        note: "Early's axis of advance from the northeast"
      }
    ]
  }

});
