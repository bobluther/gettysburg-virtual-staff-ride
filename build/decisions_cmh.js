/* decisions_cmh.js
 * Decision-forcing cases for the Gettysburg Staff Ride Simulator
 * Audience: U.S. Army War College students (senior officers)
 * Source: CMH Gettysburg Staff Ride Briefing Book (public domain)
 */

window.GB = window.GB || {};
GB.decisionsCMH = {

  buford: {
    watchFor: "The lesson: recognizing key terrain — and deciding to defend it — can shape an entire campaign.",
    commander: "Brig. Gen. John Buford",
    frame: "Disciplined initiative and the operational value of key terrain. A cavalry brigade commander, with no order to do so, reads the ground and decides to fight for it. Watch how one subordinate's judgment sets the terms of a three-day battle — and consider where the line runs between initiative and indiscipline.",
    debrief: "This is a case in mission command and operational framing. Buford grasped that Gettysburg's road net and ridgelines were key terrain whose loss would force the Army of the Potomac to fight on ground of Lee's choosing. Lacking an order, he inferred Meade's intent — concentrate and fight on advantageous ground — and acted to set the conditions for it, trading his brigade's space for the time the army needed. The operational lesson: decisive ground is decided by its consequences for the campaign, not its tactical features; and a subordinate will assume that risk only where intent is clear and trust is real. His audacity worked because it served a coherent operational design — absent that, it is a fragment thrown away.",
    discuss: [
      "How do you build the shared understanding and trust that lets a subordinate assume risk in your name?",
      "Where does initiative without orders become indiscipline — what distinguishes Buford from a subordinate who simply exceeds his authority?",
      "Transfer to your command: under a higher commander's vague intent, you read a developing situation as decisive and act before orders arrive — committing forces and shaping the fight your boss will inherit. What conditions in your formation's climate would have to be true for that to be disciplined initiative rather than freelancing, and have you actually built them?"
    ],
    side: "union",
    time: "1 July 1863 · ~10 a.m.",
    scene: {
      title: "McPherson's Ridge · dawn–mid-morning, 1 July",
      see:   "One brigade is deployed, dismounted, along McPherson's Ridge; Heth's division, followed by Pender's, has left Cashtown and at about 8:00 a.m. has struck your outposts. Your troopers are badly outnumbered, but the position is good.",
      know:  "Riding through Gettysburg, you examined the terrain and road net and concluded this was key terrain. Your troopers fight dismounted, and their breech-loading carbines give them the firepower of several times their number of muzzle-loading infantry. You reported the situation to Meade and Reynolds; your second brigade is across the Carlisle Road, awaiting Ewell.",
      hidden: "Whether your infantry support arrives in time. Reynolds is marching hard toward the guns — and, not yet aware of Meade's order to fall back to Big Pipe Creek, he is a fighter who will judge Gettysburg worth a battle — but the full weight of Hill's and Ewell's corps is converging on the town behind what you can see."
    },
    situation: "One of Buford's two cavalry brigades — Gamble's, dismounted on McPherson's Ridge — faces Heth's division, followed by Pender's, advancing from Cashtown to 'get those shoes'; his second brigade (Devin's) is north of town watching for Ewell. He has examined the terrain and road net and concluded Gettysburg is key terrain. Reynolds' I Corps is strung out on the road behind, but not yet on the field.",
    options: [
      { label: "Fight the delay on the ridges",        verdict: "sound", result: "Your dismounted line and its carbines hold the ridges against Heth's leading brigades — the troopers buy time at a mounting cost in men, with no certainty Reynolds reaches you before Hill's full weight does." },
      { label: "Withdraw south toward the infantry",   verdict: "wrong", result: "Your brigade falls back intact toward the approaching infantry, unbloodied — but the ridges, road net, and the high ground south of town are left open as Heth's and Pender's divisions come on." },
      { label: "Screen forward; mass on Cemetery Hill", verdict: "risky", result: "You give up the western ridges without a fight but stand your troopers on the dominant heights south of town — where the infantry will want to be — and trade the delay forward for an early grip on the ground that matters most." }
    ],
    historicalIdx: 0,
    whatHappened: "For almost two hours this single brigade and one battery of artillery stopped Heth's advance. By 10:30 a.m. Reynolds was on the field; Wadsworth's division relieved Buford's brigade and met Heth's attack with a counterattack that wrecked his two leading brigades. Reynolds was killed by a sharpshooter.",
    lesson: "Buford read the ground and recognized Gettysburg as key terrain — the ridges and road net worth a battle. On his own judgment, with no order to do so, he chose to defend it, trading space for time: his dismounted troopers' breech-loading carbines bought the hours that let Reynolds' infantry seize the commanding heights south of town. A subordinate who correctly identifies key terrain and acts decisively can shape the entire campaign.",
    question: "When does a subordinate's situational judgment obligate action the higher commander hasn't authorized?"
  },

  ewell: {
    watchFor: "Watch: how the cost of declining to act mounts as the window closes.",
    commander: "Lt. Gen. Richard S. Ewell",
    frame: "The discretionary order and the burden of latitude. A newly elevated corps commander, his troops battered, faces emplaced guns on a height that rises before him, the dark gathering, Johnson's division not yet up, and no cavalry to verify a report of a Federal column on his flank — under an order to take the hill 'if practicable.' Watch what aggressive action requires when commander's intent is left to inference, and ask how much explicitness a culture owes its subordinates.",
    debrief: "This is a case in commander's intent and the architecture of discretion. Lee's command style — habituated to a Jackson who needed only the object, not the order — left the means and the resolve to a subordinate who, freshly elevated, did not yet know how far his latitude ran. 'If practicable' transfers the decision; the question the case poses is whether it also transferred the purpose and the acceptable risk, or whether a cautious commander would read the phrase as permission to decline. The operational consequence was strategic: a hill not taken by dusk became a fortress by dawn, and Lee's fleeting numerical edge bled away as both armies massed. Yet weigh the case for Ewell before grading him: his troops had fought all day and were disordered by their own victory, the artillery on the crest was real, Johnson was not yet up, and a report of a Federal column on his flank — false, but unverifiable without the cavalry he did not have — argued for prudence. The tension worth pressing: latitude granted without explicit intent can become abdication rather than delegation, and the price, if it does, is paid in the closing window.",
    discuss: [
      "When you delegate with latitude, how do you make the purpose and acceptable risk explicit enough that a cautious subordinate still acts aggressively?",
      "What does it cost an organization when subordinates are unsure how much authority they actually hold — and how do you diagnose that culture before it fails you?",
      "Transfer to your command: recall the last 'when practicable' or 'be prepared to' task you issued — or received — across components or a coalition partner. Did your intent statement actually transfer the purpose and the acceptable risk, or did it leave a cautious subordinate room to decline the hard thing and still be technically compliant? Rewrite that order now so it would compel action under uncertainty."
    ],
    side: "confederate",
    time: "1 July 1863 · ~4:30–7:00 p.m.",
    scene: {
      title: "Gettysburg town · late afternoon, 1 July",
      see:   "Both Union corps have suffered losses of over 50 per cent and withdrawn through Gettysburg, but most of their artillery has fought its way clear. South of the town, Cemetery Hill rises abruptly some eighty feet — and soon bristles with guns.",
      know:  "Lee, eager to destroy the withdrawing Union forces, has ordered you to take Cemetery Hill 'if practicable.' You are studying the battered condition of your troops and the emplaced artillery on the hill above you. Johnson's division has not yet arrived.",
      hidden: "A report that a Federal column is advancing down the York Pike is false. You need cavalry badly: Jenkins' whereabouts are obscure and Stuart is at Carlisle. Hancock has grasped the importance of Culp's Hill and sent the Iron Brigade to occupy it."
    },
    situation: "Ewell's II Corps has driven two Union corps through Gettysburg. Cemetery Hill rises abruptly some eighty feet above the town and soon bristles with guns. Lee, eager to destroy the withdrawing forces, has ordered Ewell to take it 'if practicable' (the CMH book's words, 'if possible') — but Ewell has no cavalry to verify a false report of a Federal column on the York Pike.",
    options: [
      { label: "Assault Cemetery Hill at twilight",         verdict: "risky", result: "You throw tired, victorious divisions up the slope while the Federals are still disordered — riding the momentum of a day already won, against guns that are massing on the crest and a light that is failing fast." },
      { label: "Hold and await Lee's guidance",             verdict: "wrong", result: "Your battered troops rest, Johnson's division closes up, and you keep the option to attack in strength at first light — while overnight the Federals dig in and their corps come up on the heights before you." },
      { label: "Seize Culp's Hill with Johnson's division", verdict: "sound", result: "You send fresh troops at the wooded height on your right rather than the guns to your front — the hill that commands the Baltimore Pike behind the Federal line — not knowing whether you reach it before they do." }
    ],
    historicalIdx: 1,
    whatHappened: "Ewell studied the battered condition of his troops, the emplaced artillery, and the false York Pike report, and did not consider it 'possible' to take the hill. Johnson arrived at 7:30 p.m., but by then it was almost dark; despite the mutters of his staff and Lee's gentle hints, Ewell still would not risk an attack.",
    lesson: "Ewell 'still would not risk an attack' — but by morning Cemetery Hill was a fortress and Lee's numerical superiority had grown slimmer. Choosing not to act is still a choice, and its cost is paid in the closing window.",
    question: "How should commanders frame discretionary orders so subordinates are empowered without being abandoned?"
  },

  meade: {
    watchFor: "Watch: when a cautious commander accepts the ground his bolder subordinates chose.",
    commander: "Maj. Gen. George G. Meade",
    frame: "The decision to accept battle, and shared judgment under strategic stakes. A deliberate commander arrives to find his subordinates have already committed the army on ground he did not choose, while Washington and Baltimore sit behind him. Watch how he weighs the operational advantage of the position against the political-strategic cost of being wrong — and consider what it takes for a cautious mind to ratify a bold hand.",
    debrief: "This is a case in accepting battle and the moral courage to endorse a subordinate's commitment. Meade's own design was the Pipe Creek line; instead he chose to fight on a position his bolder subordinates had seized — Buford held it, Reynolds fed in the corps, Hancock organized it — because the fish-hook line offered interior lines, the ability to shift and mass faster than Lee could across his exterior arc. He accepted that operational advantage under the heaviest political-strategic stakes a Union commander could carry: a defeat here uncovered the capital. The council of war after Day 2 was not weakness but disciplined shared judgment — a commander surfacing the collective assessment before committing the army to stay. The enduring principle: the decision to give battle belongs to the senior commander even when others force the time and place, and the strength to own a choice you did not originate is itself a form of command.",
    discuss: [
      "How do interior lines and the ability to mass change the calculus of accepting battle — and where does that logic transfer to a strategic leader's own contests for position?",
      "When subordinates have committed you to ground you did not choose, what distinguishes ratifying their judgment from being captured by it?",
      "Transfer to your command: a subordinate commander or a coalition partner presents you with a fait accompli — they have already committed forces and shaped a fight you did not direct, possibly against your stated plan. As the senior who owns the outcome, how do you decide between ratifying their initiative and reversing it, knowing your endorsement makes their choice yours — and that reversing it under fire carries its own cost?"
    ],
    side: "union",
    time: "1–2 July 1863 · midnight",
    scene: {
      title: "Army of the Potomac HQ · midnight, 1–2 July",
      see:   "You arrive at midnight, both armies massing around Gettysburg. Cemetery Hill and Cemetery Ridge bristle with guns; Steinwehr has turned the cemetery into a strong point, and Hancock and Howard have rapidly organized the position. Both your forward corps lost over 50 per cent, but most of their artillery fought its way clear.",
      know:  "You assumed command days ago, and your plan was to defend at Big Pipe Creek. Reynolds, who did not know of that decision, committed the I Corps here. Hancock, sent forward to take command, grasped the importance of Culp's Hill and put the Iron Brigade on it.",
      hidden: "Lee's numerical superiority is growing slimmer as your corps close in overnight. Lee has become enmeshed in a trap of his own making — half concentrated, his cavalry lost — but you cannot yet see how completely."
    },
    situation: "Both armies are massing around Gettysburg at midnight. Meade's plan was to defend at Big Pipe Creek, but Reynolds — not knowing of that decision — committed the I Corps here, and Hancock has organized a strong position. Meade must decide whether to fight on ground his subordinates chose.",
    options: [
      { label: "Stand and fight at Gettysburg",                  verdict: "sound", result: "You commit the army to ground your subordinates seized and Hancock has organized — accepting a fight you did not plan, with Washington and Baltimore behind you, on a position whose strength you must take partly on their judgment." },
      { label: "Withdraw to Pipe Creek",                         verdict: "wrong", result: "You pull back to the line your engineers prepared and you chose — closer to your base, covering the capital — leaving behind the heights already bristling with guns and the day's costly partial success." },
      { label: "Hold temporarily; keep Pipe Creek option open",  verdict: "risky", result: "You neither fully commit nor withdraw, keeping both plans alive for one more night — while both armies mass and the moment for a clean, deliberate move toward either passes." }
    ],
    historicalIdx: 0,
    whatHappened: "Meade had arrived at midnight and somewhat regretfully decided to fight there. Both armies massed; Lee's numerical superiority grew slimmer. After Day 2 he called a council of war — should the army stay and fight, or retire? — and his corps commanders voted to stay.",
    lesson: "Meade decided 'somewhat regretfully' to fight on ground his subordinates had chosen — Buford held it, Reynolds committed the corps, Hancock organized the line — before he arrived. A cautious commander had the judgment to accept the decision his bolder subordinates had already made.",
    question: "Meade's subordinates effectively made a theater-level choice before he arrived. When is that disciplined initiative, and when is it freelancing?"
  },

  sickles: {
    watchFor: "Watch: when local tactical advantage tempts a commander off the operational mission.",
    commander: "Maj. Gen. Daniel E. Sickles",
    frame: "The limits of subordinate initiative — the deliberate counterpoint to Buford. A corps commander sees higher ground to his front, believes it dominates his assigned line, and — with his flank uncovered and the Round Tops behind him apparently empty — weighs whether to advance and take it on his own authority. Watch the same impulse that made Buford right work on Sickles, and ask what separates initiative that serves the design from initiative that breaks it.",
    debrief: "This is the dark mirror of disciplined initiative — or so the conventional verdict runs. Buford's unordered act set conditions for his commander's intent; Sickles' unordered act severed his corps from the line it existed to anchor, on the local logic that the Peach Orchard was better ground. It was, tactically, higher ground that dominated his assigned position, and that is the pull of the case: take it and you deny it to the enemy's guns; leave it and Longstreet's artillery may fire down on you from it. The cost was a salient open to fire from two directions, too extensive for one corps, uncovering the Round Tops that proved the true key. Press the case for Sickles, too: his forward, unexpected line met Longstreet's assault out where the army did not expect contact, absorbed and disordered it, and bought the time Hancock used to seal the breakthrough behind him — a result Sickles' defenders have argued served the army in spite of itself. The tension worth holding open: a subordinate's freedom of action that compromises the coherence of the whole risks becoming indiscipline rather than audacity, and the test — whether the initiative served the higher design — is one we apply far more cleanly after the outcome than before it.",
    discuss: [
      "Buford and Sickles both acted without orders; one is studied as initiative, the other as its failure. What is the test that separates them, and how do you apply it before the outcome is known?",
      "How do you preserve room for subordinate initiative while protecting the integrity of the larger design — and how does civil-military or organizational friction complicate that for the strategic leader?",
      "Transfer to your command: a JIIM or coalition partner — sound local logic, real seam to their front, but not under your direct command — advances beyond its assigned mandate and uncovers a flank you were counting on. By the time you see it, withdrawing them would expose more than letting it stand. How do you handle a partner who exceeds the mandate, and how do you build the relationship beforehand so their initiative serves your design instead of unhinging it?"
    ],
    side: "union",
    time: "2 July 1863 · ~2:00–3:00 p.m.",
    scene: {
      title: "Southern Cemetery Ridge · early afternoon, 2 July",
      see:   "Your corps holds the ground just north of the Round Tops, at the southern end of the Union line. To your front the Peach Orchard and the Emmitsburg Road sit on higher ground that appears to dominate your assigned position.",
      know:  "Lee mistakenly believes the Federal left runs along the Emmitsburg Road; Longstreet is to get around it and attack north. Pleasonton has ordered Buford from this flank back to Westminster and forgotten to replace him, so your left has no cavalry screen.",
      hidden: "The Round Tops behind your left appear empty — Little Round Top holds only a small signal detail, and from its crest artillery could fire straight down the Union line. Pleasonton has pulled Buford from this flank and not replaced him, so nothing screens your left."
    },
    situation: "Sickles' III Corps holds the ground just north of the Round Tops. The Peach Orchard to his front is higher ground with better fields of fire, and his left has lost its cavalry screen. The Round Tops behind him appear to stand empty. He must decide whether to hold the assigned line or advance to the high ground ahead.",
    options: [
      { label: "Advance to the Peach Orchard line",          verdict: "wrong", result: "You occupy the higher, commanding ground to your front before the enemy can — denying him the rise that would have dominated your assigned line — and stretch your corps to hold it, with your flanks and the Round Tops now to your rear." },
      { label: "Hold Cemetery Ridge as ordered",             verdict: "sound", result: "You stay tied into the army on lower ground, your line short and mutually supporting, the Round Tops behind your left — and you cede the higher ground at the Orchard to whoever takes it first." },
      { label: "Request Meade in person before moving",      verdict: "risky", result: "You hold position and send for the army commander to see the ground himself — putting the decision where it belongs, against the clock, as Longstreet's guns are already coming into battery to your front." }
    ],
    historicalIdx: 0,
    whatHappened: "Sickles moved his corps forward without permission from Meade. Hearing the artillery, Meade rode to the left and expressed displeasure at the new position with its apex at the Peach Orchard, but it was too late to withdraw. Hood's division smashed Sickles' left flank, overran Devil's Den, and went clawing up Little Round Top — the key to the Federal position.",
    lesson: "Sickles' new position was on higher ground, but its salient shape let Confederate artillery fire on it from two directions, and it was too extensive for his one corps. Local tactical advantage is not the operational mission: anchor the Union left.",
    question: "Warren saved the battle by acting without orders — exactly as Sickles did. What distinguishes decisive initiative from disastrous freelancing?"
  },

  lee: {
    watchFor: "Watch: when combativeness and sunk cost override a commander's judgment.",
    commander: "General Robert E. Lee",
    frame: "Culmination and the limits of the offensive. An army at the end of its reach — living off the country, communications exposed, its best maneuver argued by its most trusted subordinate — and a commander who chooses to attack the enemy's strength one more time. Watch the pull of sunk cost and combativeness against cold judgment, and ask what it costs a leader to recognize that the moment for the decisive blow has already passed.",
    debrief: "This is a case in culmination and the ownership of failure. Lee's army had reached the limit of its operational reach: living off the country it would soon strip bare, its communications highly vulnerable, its cavalry only just returned — structural factors that argued the offensive had culminated and that Longstreet's maneuver against the Federal left, not a frontal assault on prepared strength, was the prudent course. The West Point Atlas of American Wars renders the verdict memorably — that 'a blind combativeness gripped Lee,' the sunk cost of two days' fighting and the conviction of an army that had never failed him overriding the evidence that the decisive battle was already lost. But the Atlas author's phrase is an interpretation, not a settled fact, and the case for Lee deserves a hearing: a flank march across Meade's front without secure cavalry, deep in hostile country with his supplies dwindling, carried real risk of its own, and Lee believed — not without reason — that Meade had thinned his center to feed the flanks, offering a fleeting chance at the decisive result the whole invasion was meant to win. The arithmetic of a mile of open ground into massed artillery on interior lines is plainer to us than it was through the smoke of the third morning. The enduring lesson is also in the aftermath: 'It's all my fault' — the commander absorbing the failure wholly into himself, which is the precondition for an army's cohesion in retreat. The question for the strategic leader: how do you recognize culmination before combativeness spends the force you cannot replace — and own the result without reservation when it comes?",
    discuss: [
      "How does a commander recognize culmination — the point where audacity becomes the squandering of irreplaceable force — while still inside the fight and gripped by the will to win?",
      "Lee's persistent subordinate was right, and Lee's public ownership of the failure held the army together. What do these two facts together teach about dissent, accountability, and the strategic leader's relationship to those who advise and those who follow?",
      "Transfer to your command: name a current campaign, program, or operation where you suspect you are past the culminating point but two years of sunk investment, political capital, and a force that has 'never failed you' are pulling you to press on. What indicators across your domains and components would tell you so honestly — and have you built a staff and a climate where the Longstreet in the room will say it to your face, and you will hear it?"
    ],
    side: "confederate",
    time: "3 July 1863 · before dawn",
    scene: {
      title: "Seminary Ridge · pre-dawn, 3 July",
      see:   "The Union line on Cemetery Hill and Cemetery Ridge has held two days of attack. On your left, Johnson — heavily reinforced overnight — will renew his assault on Culp's Hill at dawn, but cannot break the entrenched Federal right. Seminary Ridge and Cemetery Ridge run parallel, about a mile apart, across open fields.",
      know:  "Pickett's division and Stuart's cavalry are your last uncommitted forces. You cannot delay and maneuver: your army is living off the country and would soon strip it bare, your communications are highly vulnerable, and the enemy is before you. Longstreet can mass 159 guns opposite the Union center.",
      hidden: "When the Union artillery stops firing it will be to conserve ammunition, not because it is silenced — though your gunners will conclude they have silenced it and urge Pickett forward. The VI Corps is fresh, having hardly fired a shot."
    },
    situation: "Lee's last uncommitted forces are Pickett's division and Stuart's cavalry. He cannot delay and maneuver — his army is living off the country and his communications are vulnerable. Longstreet urges the Confederates envelop the Federal left, get across Meade's communications, and force him to attack. But 'a blind combativeness gripped Lee.'",
    options: [
      { label: "Mass assault on the Union center",         verdict: "wrong", result: "You concentrate 159 guns and Pickett's fresh division against the point you believe Meade thinned to save his flanks — one massed blow at the center by the army that has never failed you, while the enemy is still before you and your supplies will not wait." },
      { label: "Execute Longstreet's flanking maneuver",  verdict: "sound", result: "You disengage and slip around the Federal left toward Meade's communications to make him attack you on ground of your choosing — surrendering the initiative and marching across his front, your cavalry only just returned, your army eating up the country it stands on." },
      { label: "Disengage and withdraw to Virginia",      verdict: "risky", result: "You break off with the army intact and recross the Potomac — conceding the field and the decisive battle you invaded to win, and carrying that result home to a Confederacy that staked much on this campaign." }
    ],
    historicalIdx: 0,
    whatHappened: "Lee ordered the assault on the center; Stuart, with all the cavalry, was to strike the Union rear. The barrage did not silence the Union guns. For a moment Pickett's men stormed into the first Union line, then the Federals closed in and the attack collapsed. Lee took the blame — 'It's all my fault' — and that night, in a driving rain, the army began its retreat.",
    lesson: "The West Point Atlas of American Wars gives the unsparing reading — that 'a blind combativeness gripped Lee,' and that he sacrificed the pick of his infantry in a foredoomed attempt to win a battle already lost. Hold it as an indictment to be tested, not a closed verdict: Lee, believing Meade had stripped his center and unwilling to surrender the initiative a flank march would cost, gambled the army's offensive spirit on one more blow. The hard question is recognizing culmination from inside the fight — before sunk cost spends the force you cannot replace.",
    question: "Longstreet disagreed persistently and was right. How should a subordinate handle sustained disagreement with a commander whose judgment they respect but believe is wrong?"
  }

};
