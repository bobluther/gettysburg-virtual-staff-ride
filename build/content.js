/* =====================================================================
   GETTYSBURG STAFF RIDE SIMULATOR — CONTENT DATA
   All historical content, map geometry, personalities, decisions.
   Coordinate system: SVG viewBox 1000 x 800, NORTH = up.
===================================================================== */
const GB = {};

/* Real contour base map (LOC / Cope survey) + affine anchors mapping the
   schematic coordinate space (below) onto the base image's pixel space.
   Each anchor: [oldX,oldY] (schematic) -> [newX,newY] (base px, 1400x1960). */
GB.fieldBase = {key:"field_base", w:1500, h:2500};
GB.fieldAnchors = [
  {o:[505,328], n:[895,600],  name:"town"},
  {o:[522,374], n:[875,985],  name:"cemetery hill"},
  {o:[576,408], n:[1015,1010],name:"culps hill"},
  {o:[500,460], n:[770,1600], name:"cem ridge mid"},
  {o:[514,600], n:[612,2175], name:"little round top"},
  {o:[524,662], n:[588,2330], name:"big round top"},
  {o:[392,460], n:[470,1300], name:"seminary ridge"},
  {o:[330,300], n:[430,360],  name:"mcpherson ridge"},
  {o:[423,520], n:[525,1775], name:"peach orchard"},
  {o:[446,250], n:[760,150],  name:"oak hill"},
];

/* ---------------------------------------------------------------
   1. BATTLEFIELD MAP GEOMETRY (the "fishhook")
--------------------------------------------------------------- */
GB.terrain = {
  // elevation/ridge spines (drawn as thick soft strokes) + hills (blobs)
  ridges: [
    {name:"Cemetery Ridge", pts:[[520,392],[508,448],[500,506],[506,566]], elev:2, w:30},
    {name:"Seminary Ridge",  pts:[[404,330],[398,410],[392,490],[388,560]], elev:2, w:26},
    {name:"McPherson Ridge", pts:[[330,296],[338,346],[346,392]], elev:1, w:20},
    {name:"Herr Ridge",      pts:[[268,286],[276,330],[284,372]], elev:1, w:18},
    {name:"Oak Ridge",       pts:[[442,262],[430,300],[420,330]], elev:2, w:20},
  ],
  hills: [
    {name:"Cemetery Hill", x:522,y:374,r:26,elev:3},
    {name:"Culp's Hill",   x:576,y:408,r:30,elev:3,wooded:true},
    {name:"Little Round Top", x:514,y:600,r:20,elev:3},
    {name:"Big Round Top", x:524,y:662,r:28,elev:3,wooded:true},
    {name:"Oak Hill",      x:446,y:250,r:20,elev:3},
    {name:"Benner's Hill", x:648,y:352,r:16,elev:2},
    {name:"Barlow's Knoll",x:566,y:250,r:13,elev:2},
    {name:"Power's Hill",  x:556,y:520,r:14,elev:2},
  ],
  woods: [
    {name:"Herbst Woods", pts:[[300,316],[342,310],[352,348],[312,360]]},
    {name:"Culp's woods", pts:[[552,386],[604,394],[606,452],[548,448]]},
    {name:"Big Round Top woods", pts:[[498,636],[552,640],[552,694],[500,692]]},
    {name:"Rose Woods", pts:[[428,556],[470,548],[486,592],[438,600]]},
    {name:"Seminary woods", pts:[[378,352],[406,352],[402,556],[376,556]]},
    {name:"Spangler's woods", pts:[[388,470],[418,466],[420,512],[390,514]]},
  ],
  water: [
    {name:"Willoughby Run", pts:[[300,236],[312,300],[322,360],[336,430]]},
    {name:"Plum Run", pts:[[486,452],[480,510],[486,566],[498,628]]},
    {name:"Rock Creek", pts:[[636,276],[660,360],[676,448],[700,548]]},
  ],
  town: {name:"Gettysburg", pts:[[470,304],[548,300],[556,344],[544,360],[478,360],[466,332]]},
  roads: [
    {name:"Chambersburg Pike", lbl:"Chambersburg Pike", pts:[[472,320],[360,300],[230,272],[110,250]]},
    {name:"Carlisle Road", lbl:"Carlisle Rd", pts:[[506,302],[514,200],[522,72]]},
    {name:"Harrisburg Road", lbl:"Harrisburg Rd", pts:[[530,308],[612,210],[690,96]]},
    {name:"York Pike", lbl:"York Pike", pts:[[548,318],[680,306],[862,300]]},
    {name:"Hanover Road", lbl:"Hanover Rd", pts:[[550,338],[700,372],[884,402]]},
    {name:"Baltimore Pike", lbl:"Baltimore Pike", pts:[[534,352],[612,452],[700,560],[772,650]]},
    {name:"Taneytown Road", lbl:"Taneytown Rd", pts:[[508,356],[498,480],[484,600],[470,726]]},
    {name:"Emmitsburg Road", lbl:"Emmitsburg Rd", pts:[[482,350],[452,440],[424,520],[372,652]]},
  ],
  // KOCOA key-terrain call-outs (shown when terrain layer on)
  keyTerrain: [
    {x:522,y:374,t:"KEY TERRAIN"}, {x:576,y:408,t:"KEY TERRAIN"},
    {x:514,y:600,t:"KEY TERRAIN"},
  ],
  labels: [
    {t:"GETTYSBURG", x:508,y:332, big:true},
    {t:"Cemetery Hill", x:540,y:372},
    {t:"Culp's Hill", x:606,y:410},
    {t:"Cemetery Ridge", x:470,y:476},
    {t:"Little Round Top", x:430,y:602},
    {t:"Big Round Top", x:560,y:668},
    {t:"Seminary Ridge", x:332,y:452},
    {t:"McPherson Ridge", x:300,y:392, sm:true},
    {t:"Oak Hill", x:446,y:228, sm:true},
    {t:"Barlow's Knoll", x:566,y:230, sm:true},
    {t:"Peach Orchard", x:404,y:520, sm:true},
    {t:"Wheatfield", x:452,y:560, sm:true},
    {t:"Devil's Den", x:486,y:616, sm:true},
    {t:"Benner's Hill", x:662,y:344, sm:true},
    {t:"Willoughby Run", x:270,y:330, sm:true, water:true},
    {t:"Plum Run", x:452,y:560, sm:true, water:true, hideWithWheat:true},
    {t:"Rock Creek", x:712,y:470, sm:true, water:true},
  ],
};

/* The campaign (theater) map — REAL geography (lat/lon), shown in Module 0 */
GB.campaign = {
  bbox:{W:-78.55, E:-76.30, S:37.35, N:40.45},
  cities:[
    {t:"Gettysburg",    lon:-77.23, lat:39.83, fight:true, big:true},
    {t:"Chambersburg",  lon:-77.66, lat:39.94},
    {t:"Carlisle",      lon:-77.19, lat:40.20},
    {t:"Harrisburg",    lon:-76.88, lat:40.27, cap:true},
    {t:"York",          lon:-76.73, lat:39.96},
    {t:"Hanover",       lon:-76.98, lat:39.80},
    {t:"Hagerstown",    lon:-77.72, lat:39.64},
    {t:"Williamsport",  lon:-77.82, lat:39.60},
    {t:"Frederick",     lon:-77.41, lat:39.41},
    {t:"Westminster",   lon:-76.99, lat:39.58},
    {t:"Winchester",    lon:-78.16, lat:39.19},
    {t:"Harpers Ferry", lon:-77.74, lat:39.32},
    {t:"Washington",    lon:-77.04, lat:38.90, cap:true},
    {t:"Baltimore",     lon:-76.61, lat:39.29, cap:true},
    {t:"Fredericksburg",lon:-77.46, lat:38.30},
    {t:"Brandy Sta.",   lon:-77.89, lat:38.51, fight:true},
    {t:"Richmond",      lon:-77.43, lat:37.54, cap:true},
  ],
  rivers:[
    {name:"Potomac R.",     pts:[[-78.7,39.62],[-77.82,39.60],[-77.74,39.32],[-77.45,39.07],[-77.04,38.90],[-76.9,38.5],[-76.45,38.05]]},
    {name:"Susquehanna R.", pts:[[-76.88,40.27],[-76.52,40.03],[-76.27,39.82],[-76.09,39.55]]},
    {name:"Shenandoah R.",  pts:[[-78.40,38.7],[-78.16,39.0],[-77.95,39.12],[-77.74,39.32]]},
    {name:"James R.",       pts:[[-77.43,37.54],[-77.0,37.36],[-76.6,37.24]]},
  ],
  border:{pts:[[-78.55,39.720],[-76.30,39.720]], lbl:"PA"}, // Mason–Dixon line
  ridge:{pts:[[-78.95,37.9],[-78.4,38.6],[-78.0,39.1],[-77.7,39.5],[-77.5,39.85],[-77.35,40.1]]}, // Blue Ridge / South Mtn
  routes:[
    {side:"conf",   who:"lee",    lbl:"Lee — Army of N. Virginia",
     pts:[[-77.46,38.30],[-77.9,38.7],[-78.16,39.19],[-77.74,39.40],[-77.66,39.94],[-77.40,39.88],[-77.23,39.83]]},
    {side:"conf",   who:"ewell",  lbl:"Ewell's Corps", dashed:true,
     pts:[[-78.16,39.19],[-77.9,39.7],[-77.66,39.94],[-77.19,40.20],[-76.88,40.27],[-76.73,39.96],[-77.23,39.83]]},
    {side:"confcav",who:"stuart", lbl:"Stuart's Ride (out of contact)", dashed:true,
     pts:[[-77.89,38.51],[-77.2,38.75],[-76.85,39.05],[-76.61,39.29],[-76.99,39.58],[-76.73,39.96],[-77.23,39.83]]},
    {side:"union",  who:"meade",  lbl:"Meade — Army of the Potomac",
     pts:[[-77.46,38.30],[-77.42,38.95],[-77.41,39.41],[-77.10,39.58],[-77.23,39.83]]},
  ],
};

/* ---------------------------------------------------------------
   2. PERSONALITIES
--------------------------------------------------------------- */
GB.people = {
  // --- Confederate ---
  lee:{name:"Gen. Robert E. Lee", side:"conf", role:"Cmdr, Army of Northern Virginia",
    bio:"Fresh from victory at Chancellorsville, Lee carried the war North to relieve Virginia, feed his army, and pressure Northern morale. At Gettysburg he fought an army he could not see — Stuart was absent — and on Day 3 chose the assault on the center over Longstreet's counsel to maneuver."},
  longstreet:{name:"Lt. Gen. James Longstreet", side:"conf", role:"I Corps ('Old War Horse')",
    bio:"Lee's senior corps commander and advocate of the tactical defensive. He argued repeatedly to slip around the Union left toward Washington and force Meade to attack. Tasked with the Day 2 and Day 3 assaults he believed would fail, he executed them under protest."},
  ewell:{name:"Lt. Gen. Richard S. Ewell", side:"conf", role:"II Corps (Jackson's old corps)",
    bio:"New to corps command after losing a leg. On the evening of Day 1, ordered to take Cemetery Hill 'if practicable,' he judged it impracticable and did not press — the war's most debated discretionary order."},
  hill:{name:"Lt. Gen. A.P. Hill", side:"conf", role:"III Corps",
    bio:"His corps triggered the battle on July 1 advancing toward Gettysburg on a reconnaissance in force (famously, 'for shoes'), drawing both armies into a meeting engagement neither commander had planned."},
  stuart:{name:"Maj. Gen. J.E.B. Stuart", side:"conf", role:"Cavalry Division — the 'eyes' of the army",
    bio:"Granted discretion, he rode a wide raid around the Union army and lost contact with Lee for a week. His absence blinded Lee during the approach march — the campaign's central intelligence failure. Arrived only late on Day 2."},
  pickett:{name:"Maj. Gen. George Pickett", side:"conf", role:"Division, I Corps",
    bio:"His fresh division spearheaded the Day 3 assault on the Union center. 'Pickett's Charge' lost over half its men in under an hour and became the symbol of the Confederacy's high-water mark."},
  armistead:{name:"Brig. Gen. Lewis Armistead", side:"conf", role:"Brigade, Pickett's Division",
    bio:"Led his brigade hat-on-sword over the stone wall at 'The Angle,' the farthest point of the charge, and fell mortally wounded — the literal High-Water Mark of the Confederacy."},
  hood:{name:"Maj. Gen. John Bell Hood", side:"conf", role:"Division, I Corps",
    bio:"Opened the Day 2 assault on the Union left. Seeing the chance to swing around the Round Tops, he protested Longstreet's frontal orders, then was wounded early — his attack hit Devil's Den and Little Round Top instead."},
  early:{name:"Maj. Gen. Jubal Early", side:"conf", role:"Division, II Corps",
    bio:"Routed the Union XI Corps north of town on Day 1 and urged Ewell to seize Cemetery Hill. His evening attack on East Cemetery Hill nearly broke the Union line."},
  // --- Union ---
  meade:{name:"Maj. Gen. George G. Meade", side:"union", role:"Cmdr, Army of the Potomac",
    bio:"Took command just three days before the battle. He fed corps onto the strong fishhook ground, held a council of war to stay and fight, correctly predicted the Day 3 blow would fall on his center, and won — though Lincoln faulted his cautious pursuit."},
  reynolds:{name:"Maj. Gen. John F. Reynolds", side:"union", role:"I Corps / left wing",
    bio:"Rushed his corps forward to support Buford and committed the army to fighting at Gettysburg — then was killed in the first hour, an early decapitation of Union command on the field."},
  buford:{name:"Brig. Gen. John Buford", side:"union", role:"Cavalry Division",
    bio:"Recognized the value of the ground and fought a dismounted delaying action west of town on July 1, buying the hours that let the infantry seize the heights. A textbook economy-of-force, defend-to-gain-time mission."},
  hancock:{name:"Maj. Gen. Winfield S. Hancock", side:"union", role:"II Corps — 'Hancock the Superb'",
    bio:"Sent by Meade to take charge on Day 1, he steadied the broken line on Cemetery Hill and chose to hold. On Day 2 he plugged the center; on Day 3 he commanded the line that broke Pickett's Charge, and was wounded."},
  warren:{name:"Maj. Gen. Gouverneur K. Warren", side:"union", role:"Chief Engineer, AoP",
    bio:"Found Little Round Top undefended on Day 2 and, on his own initiative, diverted brigades to hold it minutes before Hood's men arrived — saving the Union left. The 'savior of Little Round Top.'"},
  chamberlain:{name:"Col. Joshua L. Chamberlain", side:"union", role:"20th Maine, V Corps",
    bio:"Held the extreme left of the Union line on Little Round Top. Out of ammunition and about to be flanked, he ordered a downhill bayonet charge that broke the Alabama assault — the textbook case of small-unit leadership and initiative."},
  sickles:{name:"Maj. Gen. Daniel Sickles", side:"union", role:"III Corps",
    bio:"Disliking his assigned low ground, he advanced his corps without orders to the Peach Orchard salient on Day 2 — wrecking the Union line's integrity and inviting the destruction of his corps, though absorbing Longstreet's blow. Lost a leg."},
  howard:{name:"Maj. Gen. Oliver O. Howard", side:"union", role:"XI Corps",
    bio:"Posted Steinwehr's reserve on Cemetery Hill — the foresight that gave the army its rally point — even as his corps was routed north of town on Day 1."},
  hunt:{name:"Brig. Gen. Henry J. Hunt", side:"union", role:"Chief of Artillery, AoP",
    bio:"Massed and husbanded Union guns, ordering them to cease fire during the Day 3 cannonade to lure the assault forward and conserve ammunition for the killing zone — a masterclass in artillery management."},
};

/* ---------------------------------------------------------------
   3. MODULES  (phase metadata for rail + learning tab)
--------------------------------------------------------------- */
GB.modules = [
  {id:"camp", label:"The March North", sub:"3–30 June 1863",
   objectives:[
     "Trace how Lee's strategic aim shaped the operational maneuver into Pennsylvania.",
     "Assess the consequence of Stuart's absence on Lee's situational understanding.",
     "Evaluate command turbulence: Hooker→Meade three days before contact."],
   theme:"Strategy & Operational Maneuver — ends, ways, means; the cavalry as the commander's eyes.",
   people:["lee","longstreet","ewell","hill","stuart","meade"],
   quotes:[{t:"…maneuver and fight in such a manner as to cover the capital, and also Baltimore, as far as circumstances will admit.", who:"Halleck's only instruction to Meade, 28 June"}],
   stand:"Stand: Eisenhower Farm overlook / the approach roads — orient on the road network that funneled both armies to this crossroads."},

  {id:"d1", label:"Day 1 — Meeting Engagement", sub:"1 July 1863",
   objectives:[
     "Explain how a meeting engagement develops from a movement to contact.",
     "Analyze Buford's delay as economy of force buying time and terrain.",
     "Judge Ewell's 'if practicable' order as a problem of mission command."],
   theme:"Meeting Engagement & Mission Command — initiative, intent, and discretionary orders.",
   people:["buford","reynolds","hill","early","ewell","howard","hancock"],
   quotes:[{t:"…to take Cemetery Hill 'if possible.'", who:"Lee's order to Ewell, evening of 1 July"}],
   stand:"Stand 1–3: McPherson Ridge, Oak Ridge, Barlow's Knoll, then Cemetery Hill."},

  {id:"d2", label:"Day 2 — The Flanks", sub:"2 July 1863",
   objectives:[
     "Compare Lee's offensive-defensive plan with Longstreet's maneuver alternative.",
     "Assess Sickles' advance to the Peach Orchard against commander's intent.",
     "Derive principles of leadership and initiative from Little Round Top."],
   theme:"The Offensive-Defensive & Initiative — synchronization, the human dimension, seizing key terrain.",
   people:["longstreet","hood","sickles","warren","chamberlain","hancock","meade"],
   quotes:[{t:"It is my opinion that no fifteen thousand men ever arrayed for battle can take that position.", who:"Longstreet to Lee, 3 July (From Manassas to Appomattox, 1896)"}],
   stand:"Stand 4–8: Warfield/Seminary Ridge, Peach Orchard, Wheatfield, Devil's Den, Little Round Top."},

  {id:"d3", label:"Day 3 — The Charge", sub:"3 July 1863",
   objectives:[
     "Weigh Lee's decision to assault the center against Longstreet's flank proposal.",
     "Explain culmination and the limits of the offensive.",
     "Connect the repulse to the campaign's strategic outcome."],
   theme:"Culmination & the Decisive Point — concentration, the cost of the sunk-cost trap.",
   people:["lee","longstreet","pickett","armistead","hancock","hunt"],
   quotes:[{t:"It's all my fault.", who:"Lee, to the fugitives streaming back to Seminary Ridge"}],
   stand:"Stand 9–11: Confederate line on Seminary Ridge, the field of Pickett's Charge, The Angle / High-Water Mark."},

  {id:"after", label:"Culmination & Aftermath", sub:"4 July – consequences",
   objectives:[
     "Assess Gettysburg coupled with Vicksburg as a strategic turning point.",
     "Critique Meade's pursuit and the limits of decisive victory.",
     "Translate the campaign's lessons to the contemporary operating environment."],
   theme:"Strategic Assessment — was it decisive? Tactical victory vs. strategic effect; the pursuit problem.",
   people:["lee","meade","longstreet"],
   quotes:[{t:"We had them within our grasp… and nothing I could say or do could make the army move.", who:"Lincoln, on the failure to destroy Lee's army"}],
   stand:"Stand: Soldiers' National Cemetery — the Gettysburg Address and the war's redefined purpose."},
];

/* ---------------------------------------------------------------
   4. STEPS  (the play-through; drives map + briefing)
   Each step: {m, time, title, text, units[], arrows[], hotspots[],
               decision{}, pause{}, layers[] }
--------------------------------------------------------------- */
function U(side,ech,name,sub,x,y,doStr){return {side,ech,name,sub,x,y,do:doStr};}
function A(side,from,to,lbl,dashed,narr,fate){return {side,from,to,lbl,dashed:!!dashed,narr,fate};}

GB.steps = [
  /* ====== MODULE 0 — CAMPAIGN (uses campaign map) ====== */
  {m:"camp", map:"campaign", time:"3–28 June 1863",
   title:"Lee Carries the War North",
   text:"After Chancellorsville, Lee reorganizes the Army of Northern Virginia into three infantry corps — Longstreet, Ewell, and A. P. Hill — and Stuart's oversized cavalry division. His reasoning is simple: defensive strategy would never win the war; therefore, invade the North. Hooker's position is too strong to attack, but the threat of invasion will force him to leave it, and Lee is confident of inflicting a decisive defeat that might end the war. The North also offers what his chronically short supply system cannot: the ample food and clothing of Maryland and Pennsylvania. He shifts the army quietly westward for an advance up the Shenandoah and Cumberland Valleys, holding the passes in the Blue Ridge and South Mountains to screen his advance and protect his supply line.",
   campaignShow:["lee","ewell"],
   pause:{title:"Before the Campaign — Frame the Problem", side:"both",
     sub:"Discuss before advancing",
     before:["What are Lee's strategic ENDS, and do his operational WAYS (a raid into Pennsylvania) match his MEANS?",
       "What strategic assumptions is Lee making about Northern morale and the political clock?",
       "How does the geography — the Blue Ridge / South Mountain screen and the road net — enable the maneuver?"]}},

  {m:"camp", map:"campaign", time:"9 June 1863",
   title:"Brandy Station — Cavalry Clash",
   text:"Pleasonton arrives early on 9 June, taking Stuart completely by surprise, and starts the biggest cavalry fight in American history — a confused affair with some 10,000 sabers on each side. Stuart slowly gets the upper hand as Confederate infantry appears, and Pleasonton withdraws, his mission accomplished. But the fight encourages Federal cavalrymen, and the thorough lashing Stuart takes from the Southern press for being surprised will sting his ego into a campaign of his own. Meanwhile Ewell clears the Valley, all but bagging Milroy at Winchester (12–15 June) and opening the door into Pennsylvania.",
   campaignShow:["lee","ewell","stuart"]},

  {m:"camp", map:"campaign", time:"25–28 June 1863",
   title:"Stuart Rides — and Lee Goes Blind",
   text:"On the 23rd Stuart receives orders so vague, and allowing such latitude, that he can interpret them to suit himself. Detaching Robertson and Jones to guard the Blue Ridge gaps, he takes his three favorite brigades and rides east — only to become entangled among Union columns and find the countryside stripped bare of forage. He cannot find a ford until late on the 27th. Lee, with no information on the Army of the Potomac, proceeds on the optimistic assumption it is still south of the Potomac. Late on the evening of the 28th, Longstreet's personal spy reaches Chambersburg from Washington: the Union army is around Frederick — and Meade is now in command. On the gallop, Lee's staff orders all units to concentrate at Cashtown.",
   campaignShow:["lee","ewell","stuart"],
   decision:{id:"d-stuart", commander:"Gen. Lee", side:"conf",
     title:"The Cavalry's Orders",
     situation:"Stuart proposes riding around the Union army to screen your right and gather supplies, rather than guarding the passes and reporting enemy movements. Your infantry is strung out across the mountains in enemy country.",
     options:[
       {ol:"Tie the cavalry tight to the army", od:"Keep Stuart screening the gaps and feeding you reports.",
        out:"You preserve your reconnaissance — but surrender the audacity that has defined your campaigns, and the discretion you've always granted trusted subordinates."},
       {ol:"Grant Stuart his discretionary ride (historical)", od:"Trust your cavalier to rejoin on the Susquehanna.",
        out:"Stuart loses contact for a week. You advance blind and stumble into a meeting engagement on ground you did not choose."},
       {ol:"Order a wide raid but keep two brigades", od:"Split the difference — a screen plus an exploit.",
        out:"A reasonable hedge — yet the brigades Lee actually retained (Jones, Robertson) were his least aggressive, and they failed to keep him informed."}],
     history:"Lee's orders were so vague and permissive that Stuart could interpret them to suit himself; he chose the bold ride and was gone until the evening of Day 2. Lee proceeded blindly, operating under the optimistic assumption the Army of the Potomac was still south of the river, and fought the most important battle of the war without his cavalry.",
     teach:"INTELLIGENCE & MISSION COMMAND. Discretionary orders demand a shared understanding of the commander's intent. When the priority (reconnaissance) is not made explicit and non-negotiable, a trusted subordinate may optimize for the wrong thing. The cavalry is the commander's eyes — blinding yourself forfeits the initiative."}},

  {m:"camp", map:"campaign", time:"28 June 1863",
   title:"Hooker Out, Meade In",
   text:"At about 3:00 a.m. on 28 June, a courier wakes Maj. Gen. George Gordon Meade and tells him he commands the Army of the Potomac — Hooker, piqued at a clash with Halleck, had asked to be relieved, and Lincoln hastily acquiesced. The responsibility is crushing: Meade knows little of the over-all situation, faces the champion who ruined McClellan, Pope, Burnside, and Hooker, and has Stuart loose somewhere in his rear. Halleck gives him no instructions except to 'maneuver and fight in such a manner as to cover the capital, and also Baltimore, as far as circumstances will admit.' His engineers reconnoiter a defensive position along Big Pipe Creek even as he orders Reynolds forward toward Gettysburg.",
   campaignShow:["lee","ewell","meade","stuart"],
   pause:{title:"Command Turbulence on the Eve of Battle", side:"both",
     sub:"Discuss before Day 1",
     before:["What are the risks and opportunities of changing army commanders 72 hours before a decisive battle?",
       "Meade must satisfy two masters — protect Washington AND defeat Lee. How do competing strategic guidance and a new commander's caution interact?",
       "Both armies are now converging on a road hub neither chose. How do road networks and logistics drive operational outcomes?"]}},

  /* ====== MODULE 1 — DAY 1 (battlefield map) ====== */
  {m:"d1", map:"field", time:"1 July · 0730–1000", title:"Buford's Stand West of Town",
   text:"Heth's division, followed by Pender's, leaves Cashtown at 5:00 a.m. and about 8:00 a.m. encounters Buford's outposts. One brigade is deployed dismounted along McPherson's Ridge; the other sits across the Carlisle Road, awaiting Ewell. Badly outnumbered but holding good ground, their breech-loading carbines give Buford the firepower of several times his number — a single brigade and one battery stop Heth's advance for almost two hours. Buford has examined the terrain and road net, recognized this as key terrain, and means to hold until the infantry can reach the commanding heights south of town.",
   layers:["base","terrain","roads","units"],
   units:[
     U("conf","bde","Archer","Heth's Div",252,314,"A leading brigade of Heth's division, pressing east of Cashtown against Buford's outpost line south of the pike."),
     U("conf","bde","Davis","Heth's Div",250,286,"Heth's other leading brigade, advancing north of the pike against Buford's dismounted troopers."),
     U("conf","div","Pender","arriving · rear",198,330,"Following Heth from Cashtown; Heth waits for Pender during the mid-morning lull."),
     U("union","cav","Gamble","Buford",346,362,"Deployed dismounted along McPherson's Ridge — one brigade and a battery stop Heth for almost two hours."),
     U("union","cav","Devin","Buford",372,300,"Posted across the Carlisle Road north of Gettysburg, awaiting Ewell and reporting his pressure from Heidlersburg."),
   ],
   arrows:[A("conf",[252,310],[332,338],"Archer (S of pike)",false,"Archer's brigade pushes east, south of the Chambersburg Pike, into Buford's dismounted cavalry on McPherson's Ridge."),A("conf",[250,290],[330,318],"Davis (N of pike)",false,"Davis advances north of the pike against Buford's troopers as Heth tries to force the ridges."),A("union",[486,430],[336,338],"Reynolds rides forward",false,"Maj. Gen. John Reynolds rides up the Emmitsburg Road ahead of his I Corps, throws the Iron Brigade into Herbst Woods — and within minutes is killed by a sharpshooter at the edge of the woods.")],
   emphasis:[{x:336,y:340,label:"✗ Maj. Gen. Reynolds fell here"}],
   hotspots:["harvest_of_death"],
   decision:{id:"d-buford", commander:"Brig. Gen. Buford", side:"union",
     title:"Defend the Ridges, or Fall Back?",
     situation:"You have ~2,900 troopers against a Confederate infantry division of 7,000+ with more behind it. South of town stand Cemetery Hill, Culp's Hill, and the ridges — ground worth an army. Reynolds' infantry is hours away.",
     options:[
       {ol:"Make a dismounted stand on the ridges (historical)", od:"Trade space for time to save the high ground.",
        out:"Your delay buys the hours Reynolds needs. The army inherits the fishhook — the decision that may win the battle."},
       {ol:"Screen and withdraw south", od:"Preserve the cavalry; cede the town.",
        out:"You keep your division intact but surrender the heights uncontested — Confederates may hold Cemetery Hill before the Union infantry arrives."},
       {ol:"Mount and counterattack", od:"Hit Heth before he deploys.",
        out:"Cavalry charging deployed infantry is a recipe for slaughter; you squander your one asset — the ability to delay from cover."}],
     history:"Buford fought dismounted from the ridges; badly outnumbered but on good ground, his breech-loading carbines and the terrain stopped Heth for almost two hours until Reynolds' I Corps reached the field. It is the model defensive delay.",
     teach:"ECONOMY OF FORCE, RECONNAISSANCE & TERRAIN. A delay is not a retreat — it is buying time and protecting decisive terrain with minimum force. Note what makes Buford the mirror image of Stuart: he not only FOUND the decisive ground (KOCOA), he fought for information and passed his understanding to Reynolds. Cavalry earns its keep twice — by seeing for the commander, and by buying him time to act on what it sees."}},

  {m:"d1", map:"field", time:"1 July · 1000–1100", title:"Reynolds Falls; the Iron Brigade Holds",
   text:"Around 11:00 a.m. Wadsworth's division relieves Buford on Seminary Ridge and meets Heth's attack with a furious counterattack that wrecks his two leading brigades. Its lead element is the black-hatted Iron Brigade, which overruns Archer's brigade in Herbst Woods and takes Archer himself prisoner — the first of Lee's generals captured in the war. North of the pike, Cutler's men trap and capture much of Davis's brigade in the unfinished railroad cut. Reynolds — who did not know of Meade's decision to defend at Pipe Creek, and judged Gettysburg a good place for a battle — is killed by a sharpshooter, and Doubleday takes command, organizing a line along McPherson's and Seminary Ridges. By his forward commitment, the Union has chosen to fight here rather than fall back.",
   layers:["base","terrain","roads","units"],
   units:[
     U("conf","bde","Archer","Heth",300,332,"One of Heth's two leading brigades, wrecked in Herbst Woods by the Iron Brigade's counterattack; Archer himself is captured — the first of Lee's generals taken in the war."),
     U("conf","bde","Davis","Heth",298,302,"Heth's other leading brigade; north of the pike much of it is trapped and captured in the unfinished railroad cut as Cutler's men close in."),
     U("union","bde","Meredith","Iron Bde",346,346,"The black-hatted Iron Brigade, Wadsworth's lead, relieves Buford and counterattacks into Herbst Woods, wrecking Archer's brigade and taking Archer prisoner."),
     U("union","bde","Cutler","I Corps",360,328,"Holding the line Doubleday organized along McPherson's and Seminary Ridges after Reynolds fell."),
     U("union","cav","Buford","Cav Div",378,392,"Handing the fight to the arriving infantry — his delaying mission accomplished."),
   ],
   arrows:[A("conf",[300,332],[342,344],"Archer→Herbst Woods",false,"The Iron Brigade overruns Archer's brigade in Herbst Woods and takes Archer himself prisoner — the first of Lee's generals captured in the war.","captured"),A("conf",[298,302],[340,322],"Davis→rail cut",false,"North of the pike, Cutler's men trap and capture much of Davis's brigade in the unfinished railroad cut.","captured"),A("union",[470,400],[400,360],"I Corps fwd"),A("union",[486,430],[336,336],"Reynolds rides forward",false,"Maj. Gen. John Reynolds rides ahead of his I Corps to bring it into action — and within minutes of reaching the field is killed by a sharpshooter at the edge of Herbst Woods.")],
   emphasis:[{x:334,y:334,label:"✗ Maj. Gen. Reynolds fell here"}]},

  {m:"d1", map:"field", time:"1 July · 1300–1600", title:"The Line Collapses — Rally on Cemetery Hill",
   text:"Ewell's corps arrives from the north. Rodes attacks from Oak Hill; A. P. Hill renews the assault from the west; Early arrives from York and outflanks the Union right, while Confederate artillery on Oak Hill enfilades both corps. Both Union corps — each losing over 50 per cent — give way and fall back through Gettysburg, the XI Corps disorganized and losing prisoners, the I Corps in good order covered by Buford. They rally on Cemetery Hill, where Steinwehr has turned the cemetery into a strong point. Shortly after 4:00 p.m. Hancock arrives under orders from Meade, grasps the importance of Culp's Hill, and holds the position.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("conf","bde","Iverson","Rodes",430,278,"Part of Rodes' division attacking off Oak Hill; the XI Corps, anxious to avenge Chancellorsville, smashed Rodes' first attack before weight of numbers told."),
     U("conf","bde","O'Neal","Rodes",456,272,"Attacking piecemeal off Oak Hill as Confederate strength built up too fast for the Union line to hold."),
     U("conf","bde","Gordon","Early",560,264,"Part of Early's flanking attack that rolls up the exposed Union right north of town."),
     U("conf","div","Early","II Corps",586,250,"Arriving from York, outflanks the Union right; his attack gathers the momentum that breaks the line."),
     U("conf","corps","Hill's III Corps","Hill",300,360,"A. P. Hill renews the attack from the west as Ewell closes from the north."),
     U("union","div","Schurz","XI Corps",540,300,"Formed in line north of the town against Rodes and Early, then driven back through the streets in disorder — losing many prisoners — to rally on Cemetery Hill."),
     U("union","arty","Dilger","XI Corps battery",548,286,"Dueled the Confederate guns north of town, then fired in retreat down the streets to cover the withdrawal — most of the Union artillery fought its way clear to Cemetery Hill."),
     U("union","div","Steinwehr","reserve",522,374,"The division Howard dropped on Cemetery Hill, where Steinwehr turns the cemetery into a strong point — the day's rally point."),
     U("union","corps","I Corps","Doubleday",470,398,"Withdraws in relatively good order from Seminary Ridge through the town, covered on its left by Buford, and re-forms on Cemetery Hill."),
   ],
   arrows:[A("conf",[430,278],[432,282],"Iverson shattered",false,"Iverson's brigade is shattered in line on Oak Ridge — the dead left in a row marking 'Iverson's Pits'.","destroyed"),
     A("union",[540,300],[538,372],"Schurz withdraws",true,"XI Corps, outflanked by Early, is driven back through the streets in disorder — losing many prisoners — and rallies on Cemetery Hill."),
     A("union",[548,286],[522,360],"Dilger withdraws",true,"Dilger's guns fire in retreat down the streets, then redeploy on Cemetery Hill — most of the artillery fights its way clear; it is not captured."),
     A("union",[470,398],[506,388],"I Corps withdraws",true,"I Corps falls back in relatively good order from Seminary Ridge, covered on its left by Buford, and forms on Cemetery Hill.")],
   hotspots:["cemetery_gatehouse","town_view"],
   decision:{id:"d-ewell", commander:"Lt. Gen. Ewell", side:"conf",
     title:"Cemetery Hill — 'If Possible'",
     situation:"It is early evening. The routed Union corps are streaming onto Cemetery Hill, but rallying on strong, rising ground bristling with guns. Lee, eager to destroy the withdrawing enemy, has ordered you to take the hill 'if practicable' — the CMH book's words, 'if possible.' Weigh against it the battered condition of your troops, the emplaced artillery on the hill above you, and a report — false — that a Federal column is advancing down the York Pike.",
     options:[
       {ol:"Press the attack at once", od:"Storm Cemetery Hill before the Union consolidates.",
        out:"A bold stroke that MIGHT seize the keystone of the fishhook — or break your disordered, tired divisions against fresh troops on high ground. History never ran this test."},
       {ol:"Judge it impracticable; consolidate (historical)", od:"Decline the assault, await Lee and the morning.",
        out:"The Union keeps Cemetery and Culp's Hill — the anchors of the position they will hold for two more days. Critics call it the lost opportunity of the battle."},
       {ol:"Take Culp's Hill instead", od:"Seize the unoccupied wooded height to the right.",
        out:"Culp's Hill commands the Baltimore Pike — the army's supply line — and its loss would have unhinged Cemetery Hill from the rear; unoccupied at dusk, it was arguably the real prize — but Johnson's division arrived late and the chance closed."}],
     history:"Ewell did not consider it 'possible,' and — despite the mutters of his staff and Lee's gentle hints — would not risk an attack even after Johnson's division arrived at 7:30 p.m. Told later that Culp's Hill was unoccupied, he ordered Johnson to seize it, but the patrols found the Iron Brigade already in possession. Whether the hill could have been taken is the battle's most enduring 'what-if.'",
     teach:"MISSION COMMAND & DISCRETIONARY ORDERS. 'If possible' delegates judgment but transfers risk to a subordinate who may lack the senior's intent and audacity. Effective mission command requires a clearly communicated intent and a subordinate empowered — and willing — to seize fleeting opportunity. The order's ambiguity, not Ewell alone, is on trial."}},

  {m:"d1", map:"field", time:"1 July · evening", title:"Meade's Choice — Stay or Fall Back?",
   text:"By nightfall the Union holds the high ground in a developing fishhook: Culp's Hill and Cemetery Hill anchoring the right, Cemetery Ridge running roughly a mile south toward the Round Tops — about four miles of line, Round Top to Culp's Hill. Meade, arriving at midnight, must decide whether to fight here or fall back to the Pipe Creek Line his engineers have prepared to the southeast.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("union","corps","XI/I","on the heights",522,378,"The bloodied I and XI Corps consolidate on Cemetery and Culp's Hills, forming the barb of the fishhook."),
     U("union","corps","II Corps","Hancock",506,450,"Sent forward by Meade to take charge, Hancock judges the ground holdable and organizes the line."),
     U("conf","corps","Ewell's II Corps","Ewell",520,250,"Holding the captured town; declines to press Cemetery Hill at dusk — the war's great 'if practicable' question."),
     U("conf","corps","Hill's III Corps","Hill",390,430,"Closing up on Seminary Ridge opposite the forming Union line."),
   ],
   decision:{id:"d-meade", commander:"Maj. Gen. Meade", side:"union",
     title:"Gettysburg or the Pipe Creek Line?",
     situation:"You took command three days ago. Two corps are bloodied but the army holds superb defensive ground. Your engineers have prepared a strong fallback — the Pipe Creek Line — closer to your supply base and covering Washington and Baltimore. The rest of your corps are marching through the night.",
     options:[
       {ol:"Stand and fight at Gettysburg (historical)", od:"Concentrate the army on the fishhook.",
        out:"You fight on interior lines and commanding ground of your choosing. The compact fishhook lets you shift reserves faster than Lee can shift around its exterior."},
       {ol:"Withdraw to Pipe Creek", od:"Fight the set-piece battle you designed.",
        out:"Tactically sound on paper — but you surrender the moral initiative and the finest defensive ground on the field, and risk being caught mid-withdrawal."}],
     history:"Meade arrived at midnight and somewhat regretfully decided to fight there, ratifying the choice in a council of war the next night when his corps commanders voted to stay. Interior lines gave him the POTENTIAL to mass faster than Lee on the exterior; it was his willingness to strip quiet sectors and feed reserves to each crisis on Day 2 that converted geometry into advantage.",
     teach:"INTERIOR LINES & DECISION UNDER UNCERTAINTY. The fishhook gave Meade shorter reinforcement distances than Lee's exterior line. A new commander chose to fight on ground his subordinates had seized — trusting the situation over his own prepared plan. Good positions are sometimes inherited; the art is recognizing and keeping them."},
   pause:{title:"End of Day 1 — Assess", side:"both", sub:"Post-action discussion",
     after:["Who 'won' Day 1 — and by what measure (ground, casualties, position, initiative)?",
       "Was Ewell's decision a failure of the man, or of the order? How would you have written Lee's order?",
       "How did three separate subordinate decisions (Buford, Reynolds, Howard's reserve, Hancock) shape the field more than either army commander?"]}},

  /* ====== MODULE 2 — DAY 2 ====== */
  {m:"d2", map:"field", time:"2 July · morning", title:"Lee's Plan vs. Longstreet's Counsel",
   text:"Both armies are now largely up. The Union holds the fishhook; Lee holds the exterior line on Seminary Ridge. Lee's plan: Longstreet is to get around the Federal left — which Lee mistakenly thinks lies along the Emmitsburg Road — and attack north, Anderson joining the assault, Ewell attacking when he hears Longstreet's guns. Longstreet, who must make the main attack, had strongly favored taking up a defensive position and letting Meade attack, and thought Lee had accepted his ideas. Lee overrules him; he wants an early attack, but the orders are not issued until 11:00 a.m.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("conf","corps","Longstreet's I Corps","Longstreet",392,470,"Ordered to make the main attack up the Emmitsburg Road against the Union left — which he made under protest."),
     U("conf","corps","Ewell's II Corps","Ewell",540,300,"To demonstrate against the Union right and convert it to a real attack 'if practicable.'"),
     U("union","corps","III Corps","Sickles",500,470,"Holding the assigned low ground at the south end of Cemetery Ridge — soon to advance off it without orders."),
     U("union","corps","II Corps","Hancock",506,430,"Anchoring the Union center on Cemetery Ridge."),
     U("union","corps","XII","Culp's Hill",560,400,"Entrenching the wooded hill that anchors the Union right and covers the Baltimore Pike."),
   ],
   decision:{id:"d-lee2", commander:"Gen. Lee", side:"conf",
     title:"Attack the Fishhook — or Maneuver Around It?",
     situation:"Meade holds commanding ground on interior lines. Your army is on the exterior. Stuart is still absent; your knowledge of the Union dispositions is thin. Longstreet urges a wide move around the Union left to interpose between Meade and Washington, forcing Meade to attack YOU.",
     options:[
       {ol:"Echelon attack on the Union left (historical)", od:"Strike the flank you believe is weakest, now.",
        out:"You retain the initiative and the morale of the offensive — but attack strong ground, blind, against an enemy who can reinforce on interior lines faster than you can exploit."},
       {ol:"Adopt Longstreet's maneuver", od:"Slip around the left, take strong ground, invite attack.",
        out:"Plays to your army's defensive strength and Meade's mandate to cover Washington — but cedes the initiative, risks a march across the enemy's front without cavalry, and your supply situation will not wait."},
       {ol:"Stand on the defensive in place", od:"Hold Seminary Ridge; let Meade come to you.",
        out:"Meade, content to hold the better ground, has no reason to attack — and your army cannot feed itself in place indefinitely in enemy country."}],
     history:"Lee chose the offensive. Longstreet, disgruntled, executed the assault he had argued against, advancing over strange ground while trying to avoid the Federal signal station on Little Round Top. The orders were late, the divisions and brigades went in piecemeal, and the frontal nature of the attack dogged it all day.",
     teach:"THE OFFENSIVE-DEFENSIVE, INITIATIVE & SYNCHRONIZATION. Lee valued moral initiative and his army's offensive spirit; Longstreet valued the tactical defensive's lethality (Fredericksburg in reverse). Both read the same map differently. And the plan demanded what the army could not deliver: an attack in echelon needs precise timing, yet Lee's was delayed by Longstreet's countermarch, fed in piecemeal, and never linked to Ewell's distant assault. A plan dependent on synchronization the staff cannot achieve culminates before it starts — the Army's classic case study in synchronization failure across exterior lines."}},

  {m:"d2", map:"field", time:"2 July · ~1500", title:"Sickles Advances to the Peach Orchard",
   text:"Without permission from Meade, Sickles moves III Corps forward off the ground just north of the Round Tops to higher ground at the Peach Orchard. The new position is higher, but its salient shape lets Confederate artillery take it under fire from two directions, and it is too extensive for one corps — leaving the Round Tops unoccupied behind him. Meade rides over, expresses displeasure, but Confederate infantry is already advancing and it is too late to withdraw.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("conf","bde","Kershaw","McLaws",388,504,"Driving into the Wheatfield and Rose Woods against the angle of Sickles' salient."),
     U("conf","bde","Barksdale","McLaws",384,514,"His Mississippians smash through the Peach Orchard in one of the day's fiercest charges; Barksdale is killed."),
     U("conf","div","Hood","I Corps",392,560,"Wheeling his division right toward Devil's Den and the Round Tops."),
     U("union","bde","Graham","Orchard salient",428,520,"Holding the exposed angle at the Peach Orchard until it is overrun; Graham is wounded and captured."),
     U("union","div","Birney","III Corps",452,548,"Trying to hold Sickles' over-extended salient as it collapses under Longstreet's assault."),
     U("union","corps","II Corps","Hancock",506,440,"Feeding brigades down from Cemetery Ridge to plug the gaps as the left caves in."),
   ],
   arrows:[A("union",[500,470],[428,520],"Sickles advances",true),A("conf",[384,514],[424,520],"Barksdale"),A("conf",[392,560],[466,566],"Hood→Devil's Den"),
     A("union",[428,520],[430,522],"Graham overrun",false,"Graham holds the exposed angle of the salient until it is overrun; he is wounded and captured as the Peach Orchard line gives way.","captured"),
     A("union",[452,548],[508,452],"Birney falls back",true,"With the salient collapsing, Birney's III Corps line is driven back to Cemetery Ridge, where Hancock's reserves seal the breakthrough.")],
   decision:{id:"d-sickles", commander:"Maj. Gen. Sickles", side:"union",
     title:"Hold the Ridge, or Take the High Ground Forward?",
     situation:"Your assigned position on lower southern Cemetery Ridge is dominated by higher ground to your front at the Peach Orchard. You have no explicit orders refining your line, and you fear being shelled from the high ground ahead.",
     options:[
       {ol:"Hold the assigned line on Cemetery Ridge", od:"Stay tied into the army; keep Little Round Top covered.",
        out:"You preserve the integrity and interior lines of the fishhook — the army fights as one connected position."},
       {ol:"Advance to the Peach Orchard (historical)", od:"Seize the higher ground to your front.",
        out:"You create a vulnerable salient with both flanks in the air, leave Little Round Top open, and invite the destruction of your corps — though your sacrifice absorbs and disorders Longstreet's attack."}],
     history:"Sickles moved his corps forward without permission from Meade. Its salient shape let Confederate artillery take it under fire from two directions, and it was too extensive for one corps; his center and right held a while but were eventually driven back. Yet the unexpected forward line absorbed and disordered Longstreet's piecemeal attack, buying time for reserves to save the position behind him.",
     teach:"COMMANDER'S INTENT & DISCIPLINE. A subordinate who substitutes his own scheme for the higher plan endangers the whole — even when local terrain logic seems sound. Integrity of the line (mutual support, interior lines) outweighs local advantage. Yet note the paradox: the blunder partially absorbed the blow. The test of initiative is not whether it worked, but whether it served the higher commander's intent — Sickles' did not; Warren's, an hour later and a mile away, did. War rewards no clean morals, but doctrine still distinguishes the two."}},

  {m:"d2", map:"field", time:"2 July · ~1600", title:"Little Round Top — Warren's Eye, Chamberlain's Charge",
   text:"Hood's division smashes Sickles' left, overruns Devil's Den, and goes clawing up the west side of Little Round Top — the key to the Federal position, from whose crest artillery could fire straight down the Union line. Reaching the hill, chief engineer G.K. Warren finds it held only by a small signal detail and, on his own responsibility, orders two V Corps brigades and a battery onto the summit. They get there a few yards ahead of Hood's men and drive them off in furious hand-to-hand fighting. On the extreme left, Chamberlain's 20th Maine, out of ammunition, breaks the assault with a downhill bayonet charge.",
   layers:["base","terrain","units","labels"],
   units:[
     U("conf","reg","15th Ala","Oates",474,640,"Climbing the boulder-strewn slope and working around the Union left flank — broken by the 20th Maine's downhill bayonet charge."),
     U("conf","bde","Robertson","Texas Bde",450,612,"Driving toward the Round Tops and Devil's Den, anchoring Hood's assault on the Union left."),
     U("conf","bde","Benning","Ga Bde",456,634,"Pressing the attack into Devil's Den at the foot of Little Round Top."),
     U("conf","div","Hood","I Corps",428,604,"Launching the Day-2 assault on the Union left; wounded early near the Round Tops, his attack veers into the rocks."),
     U("union","reg","20th Maine","Chamberlain",512,656,"Holding the extreme left of the entire army; out of ammunition, charges downhill with the bayonet to break the assault."),
     U("union","reg","83rd PA","Vincent",500,628,"Holding the line beside the 20th Maine on Vincent's brigade front."),
     U("union","reg","44th NY","Vincent",490,600,"Defending the western face of Little Round Top with Vincent's brigade."),
     U("union","bde","Vincent","V Corps",538,590,"Rushed his brigade to the undefended hill minutes ahead of Hood; mortally wounded holding it."),
     U("union","arty","Hazlett","Btry D, 5th US",572,584,"Manhandled his guns up to the rocky summit to anchor the position; killed beside them."),
     U("union","bde","Weed","V Corps",566,616,"Reinforcing the crest of Little Round Top; killed on the hill."),
   ],
   arrows:[A("conf",[474,640],[514,617],"15th Ala flanking",false,"The 15th Alabama climbs the boulder-strewn slope, working to turn the Union left flank."),A("union",[522,622],[486,637],"20th Maine bayonet charge",false,"Out of ammunition, the 20th Maine wheels downhill with the bayonet and breaks the assault."),A("conf",[450,612],[500,604],"Robertson / Devil's Den",false,"Hood's Texans, Robertson's brigade, drive through Devil's Den toward the foot of Little Round Top."),
     A("union",[540,612],[526,603],"Weed reinforces the crest",false,"Weed's brigade rushes up to reinforce the crest of Little Round Top; Weed is killed on the hill."),
     A("union",[538,604],[521,593],"Hazlett to the summit",false,"Hazlett's battery is manhandled up to the rocky summit to anchor the position; Hazlett is killed beside his guns.")],
   hotspots:["little_round_top","rebel_sharpshooter"],
   decision:{id:"d-chamberlain", commander:"Col. Chamberlain", side:"union",
     title:"Out of Ammunition on the Flank",
     situation:"You hold the extreme left of the Union army on Little Round Top. The 15th Alabama has charged five times. Your ammunition is gone, a third of your men are down, and another assault is forming to turn your flank — beyond which lies the army's undefended rear.",
     options:[
       {ol:"Order the bayonet charge (historical)", od:"Sweep downhill before they re-form.",
        out:"The shock of a downhill bayonet charge breaks the exhausted Alabamians and captures hundreds — the flank holds. Audacity at the decisive point."},
       {ol:"Withdraw to re-supply", od:"Pull back over the crest to refit.",
        out:"Yielding the crest uncovers the army's flank; the Confederates take the hill that enfilades the entire Union line."},
       {ol:"Hold and fight with what you have", od:"Stand and receive the next charge.",
        out:"With empty rifles against a fresh assault on your open flank, a static defense likely collapses."}],
     history:"Chamberlain ordered 'Bayonet!' and a wheeling downhill charge that shattered the assault and saved the flank — a Medal of Honor action and the textbook case of small-unit initiative.",
     teach:"INITIATIVE AT THE DECISIVE POINT & THE HUMAN DIMENSION. Three leaders — Warren (foresight), Vincent (rapid commitment), Chamberlain (audacity) — each acted on their own initiative inside the senior commander's intent. Decisive results often turn on junior leaders empowered to act faster than orders can reach them."},
   pause:{title:"After Little Round Top — Leadership", side:"both", sub:"Post-action discussion",
     after:["Warren, Vincent, and Chamberlain all acted without waiting for orders. What conditions of command climate make that initiative possible?",
       "Contrast Sickles' unauthorized advance with Warren's unauthorized diversion of troops. Why do we praise one and damn the other?",
       "How does the human dimension — fatigue, fear, will — show up across this day more than the maps suggest?"]}},

  {m:"d2", map:"field", time:"2 July · evening", title:"Culp's Hill & East Cemetery Hill",
   text:"It is almost dark when Ewell's infantry finally attacks. Johnson occupies some empty entrenchments at the foot of Culp's Hill but cannot carry the hill itself; two of Early's brigades get to the top of East Cemetery Hill — only their dead stay there. The fishhook bends but holds. Meade's interior lines let him shuttle reserves from quiet sectors to each crisis in turn.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("conf","div","Johnson","II Corps",620,400,"Seizing part of the lightly held Culp's Hill works in the evening, after most of the XII Corps shifted to the left."),
     U("conf","div","Early","II Corps",560,330,"His brigades crest East Cemetery Hill in the twilight before being thrown back from the guns."),
     U("union","div","Greene","XII Corps",572,408,"With one brigade and good entrenchments, holds Culp's Hill against far heavier numbers."),
     U("union","corps","XI Corps","E. Cem. Hill",530,372,"Rallying with reinforcements to repulse Early's twilight assault on the batteries."),
   ],
   arrows:[]}, /* Johnson & Early movement owned by battle_day2.js (single coherent trajectories) */

  /* ====== MODULE 3 — DAY 3 ====== */
  {m:"d3", map:"field", time:"3 July · dawn–1100", title:"Culp's Hill Recaptured",
   text:"Slocum regroups the XII Corps to recover his former position around Culp's Hill. Johnson, heavily reinforced, attacks first — but by 11:00 a.m. is driven back to his original position. With both flanks now firmly held and only Pickett's division and Stuart's cavalry uncommitted, a blind combativeness grips Lee: he will penetrate the Federal center while Stuart strikes the rear, convinced Meade has weakened it to feed the flanks.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("union","corps","XII Corps","Slocum",576,408,"Regrouping to recover the former position around Culp's Hill — by 11:00 a.m. Johnson is driven back to where he started."),
     U("conf","div","Johnson","II Corps",628,402,"Renewing the assault on Culp's Hill but unable to hold the gains against the returned XII Corps."),
     U("conf","corps","Longstreet's I Corps","Longstreet",392,470,"Massing the divisions and the guns for the assault Lee will order against the Union center."),
     U("union","corps","II Corps","Hancock — center",506,450,"Holding the Union center on Cemetery Ridge — the ground the afternoon's charge will aim at."),
   ],
   arrows:[A("union",[576,408],[612,402],"XII retakes hill")]},

  {m:"d3", map:"field", time:"3 July · 1300", title:"The Great Cannonade",
   text:"At 1:00 p.m. Longstreet's 159 massed guns open opposite the Union center. Union artillery answers until about 2:00 p.m., when its firing is stopped to conserve ammunition — and the Confederate gunners conclude they have silenced the Union cannon. Their own ammunition nearly exhausted, they urge Pickett to advance while they can still support him.",
   layers:["base","terrain","units","labels"],
   units:[
     U("conf","arty","Alexander","I Corps guns (159 massed)",404,468,"Directing the great bombardment meant to soften the Union center; with ammunition nearly spent, he gives Pickett the word to advance."),
     U("union","arty","Hunt","Arty Reserve",506,452,"Union guns answer, then stop firing about 2:00 p.m. to conserve ammunition — leading the Confederate gunners to conclude the line is silenced."),
     U("union","corps","II Corps","Gibbon/Hancock",506,470,"Hugging the ground behind the wall as the shells scream overhead — most of them overshooting the line."),
   ]},

  {m:"d3", map:"field", time:"3 July · 1500", title:"Pickett's Charge — the High-Water Mark",
   text:"Approximately 15,000 infantry — Pickett, with Heth's and Pender's divisions — pour from the woods along Seminary Ridge to penetrate the Federal center. Converging Union artillery fire tears gaps in their ranks, but they close up and come on gallantly; Union infantry comes forward against their flanks. For a moment the central mass storms into the first Union line. Then the Federals close in, and the attack collapses: 'some quit, more ran, and many died.' It is the Confederacy's high-water mark.",
   layers:["base","terrain","units","labels"],
   units:[
     U("conf","bde","Garnett","Pickett",404,486,"Advancing on foot at the head of his brigade across the open field; killed near the stone wall."),
     U("conf","bde","Kemper","Pickett",410,500,"Pressing the right of Pickett's line under flanking fire from the Vermonters; severely wounded."),
     U("conf","bde","Armistead","Pickett",396,492,"Leading the deepest penetration — hat on his sword — over the wall at the Angle; mortally wounded among the guns."),
     U("conf","div","Pettigrew","Heth's Div",392,446,"Leading Heth's division on the left of the assault toward the copse of trees."),
     U("conf","bde","Fry","Archer's Bde",402,452,"Guiding on Pickett's left as the assault's center of direction."),
     U("conf","bde","Trimble","Pender's Div",386,430,"Bringing Pender's division forward in support of Pettigrew; wounded in the advance."),
     U("union","bde","Webb","Phila Bde — Angle",502,470,"Holding the Angle with the Philadelphia Brigade at the very point of contact."),
     U("union","bde","Hall","II Corps",506,484,"Shifting his brigade to meet the breakthrough at the copse of trees."),
     U("union","bde","Harrow","II Corps",508,458,"Feeding regiments into the fight along the wall north of the Angle."),
     U("union","reg","Stannard","VT Bde",492,506,"Swinging his Vermont brigade out to fire into the charge's exposed right flank."),
     U("union","arty","Hunt","massed guns",514,492,"Massing the Union guns; held fire through the cannonade, then tore the assault apart at close range."),
   ],
   arrows:[A("conf",[392,446],[494,461],"Pettigrew–Trimble",false,"Pettigrew and Trimble advance on the left into converging artillery and rifle fire."),
     A("conf",[404,486],[492,470],"Garnett",false,"Garnett advances on foot at the head of his brigade toward the copse of trees; he is killed at the stone wall and his brigade is wrecked at the Angle.","destroyed"),
     A("conf",[410,500],[498,480],"Kemper",false,"Kemper presses the right under flanking fire from the Vermonters; he is severely wounded and his brigade is shattered short of the wall.","destroyed"),
     A("conf",[396,492],[500,468],"Armistead",false,"Armistead leads the deepest penetration — hat on his sword — over the wall at the Angle and falls mortally wounded among the guns; the breakthrough is sealed off and his brigade destroyed.","destroyed"),
     A("union",[492,506],[472,486],"VT flank fire",true,"Stannard's Vermont brigade swings out to rake the charge's exposed right flank.")],
   hotspots:["high_water_mark","copse"],
   decision:{id:"d-lee3", commander:"Gen. Lee", side:"conf",
     title:"Renew the Assault — on the Center?",
     situation:"Day 2 failed on both flanks. Your army is bloodied; ammunition and supplies are dwindling in enemy country; Stuart has finally arrived. Longstreet pleads, again, to disengage and maneuver around the Union left rather than assault the center across open ground. You believe Meade has stripped his center to hold the flanks.",
     options:[
       {ol:"Assault the center — Pickett's Charge (historical)", od:"Mass three divisions on the copse of trees.",
        out:"A frontal assault across nearly a mile of open ground into massed artillery and infantry on high ground. It fails catastrophically — over 50% losses — and ends the offensive."},
       {ol:"Maneuver around the Union left (Longstreet)", od:"Disengage; interpose toward Washington; fight on the defensive.",
        out:"Preserves the army and plays to its strength — but cedes the initiative, is logistically fragile in enemy country, and Meade may simply hold his superb ground."},
       {ol:"Withdraw toward Virginia now", od:"Break off; recross the Potomac with the army intact.",
        out:"Concedes the campaign and the moral defeat — but preserves the Army of Northern Virginia as a force-in-being. The army would fight on for two more years."}],
     history:"A blind combativeness gripped Lee: he could not delay and maneuver — his army was living off the country and would soon strip it bare, his communications were vulnerable, the enemy was before him. He ordered the charge. It failed. 'It's all my fault,' he told the fugitives streaming back to Seminary Ridge.",
     teach:"CULMINATION & THE SUNK-COST TRAP. An army that has reached its culminating point cannot generate decisive offensive results; pressing on converts a stalled offensive into a catastrophe. The hardest command decision is to STOP — to recognize that prior investment (two days of attacks) does not justify the next, costlier one. The indicators were all present by July 3: dwindling combat power, lengthening logistics deep in hostile country, the loss of reconnaissance, and an inability to reinforce success."},
   pause:{title:"Before the Charge — Culmination", side:"both", sub:"Discuss before the assault",
     before:["Has Lee's army reached its culminating point? What indicators would tell a commander he has?",
       "Lee is influenced by two days of near-misses and faith in his men. How does the sunk-cost trap operate on commanders?",
       "Hunt husbanded his guns and ceased fire to deceive. How does disciplined economy of a scarce resource decide battles?"]}},

  /* ====== MODULE 4 — AFTERMATH ====== */
  {m:"after", map:"field", time:"3–4 July · the repulse", title:"The Line Holds",
   text:"The survivors straggle back to Seminary Ridge, still hammered by the Union guns. 'It's all my fault,' Lee tells them, and with Longstreet hastily rallies them to meet a counterattack that never comes. Hancock, wounded in Pickett's final assault, has held the center and urges an immediate counterstroke. The Federals lose 23,049; the Confederates report 20,451, but their actual losses run nearer 28,000 — one-third of their force. Lee's invasion is spent.",
   layers:["base","terrain","roads","units","labels"],
   units:[
     U("union","corps","II Corps","held the center",506,468,"Hancock's corps breaks the charge; Hancock himself is wounded in the final assault and urges an immediate counterattack."),
     U("conf","corps","ANV","withdrawing",392,480,"The survivors straggle back to Seminary Ridge under the Union guns; Lee takes the blame — 'It's all my fault.'"),
   ]},

  {m:"after", map:"campaign", time:"4–14 July 1863", title:"Retreat, Pursuit, and the Strategic Verdict",
   text:"On 4 July Lee holds his line, defying Meade to attack; that night, in a driving rain, the Army of Northern Virginia begins its retreat toward the Potomac. That same 4 July, far to the west, Vicksburg surrenders to Grant — together the two defeats mark the Confederacy's high-water mark East and West. By the 7th Lee is at Williamsport — almost out of ammunition, thinned by straggling and desertion to about 35,000 — and entrenches with his back to the flooded river. Meade approaches cautiously on the 12th with over 85,000 men, calls a council of war, and a majority votes not to attack. Lee gets his command across during the night of 13–14 July, catching Meade completely unaware, while Buford and Kilpatrick harry his rear guard.",
   campaignShow:["lee","meade"],
   decision:{id:"d-pursuit", commander:"Maj. Gen. Meade", side:"union",
     title:"Press the Pursuit, or Secure the Victory?",
     situation:"Lee is entrenched at Williamsport, his back to the flooded Potomac, almost out of ammunition. Your own army is exhausted and bled white — you have lost 23,049 men, and your aggressive corps commanders (Reynolds, Hancock, Sickles) are dead or wounded. Lincoln wants Lee's army DESTROYED, not merely defeated.",
     options:[
       {ol:"Attack the trapped army aggressively", od:"Try to destroy the ANV against the river.",
        out:"The decisive blow Lincoln craves — but against an entrenched, desperate enemy with your own army wrecked and disorganized, a repulse could squander the victory."},
       {ol:"Pursue cautiously (historical)", od:"Follow up; avoid a reckless general engagement.",
        out:"You preserve your battered army and confirm the victory — but Lee escapes across the Potomac to fight for two more years. Lincoln: 'We had them within our grasp.'"}],
     history:"Meade approached cautiously, called a council of war, and a majority voted not to attack; Lee crossed the Potomac on the night of 13–14 July, catching Meade completely unaware. Having fought a purely defensive battle and scattered the fresh VI Corps as local reserves rather than massing it for a counterstroke, Meade — in the guidebook's judgment — lost his chance to destroy Lee's army.",
     teach:"DECISIVE VICTORY, THE PURSUIT & THE PRIMACY OF POLICY. The destruction of the enemy army — not just the seizure of a field — is what makes victory strategically decisive. Yet a victorious army is often too damaged to pursue, and Meade was also bound by political guidance to cover Washington and Baltimore — the civil-military friction Lincoln voiced in 'We had them within our grasp.' About four and a half months later, on this ground, the Gettysburg Address re-stated the war's ENDS ('a new birth of freedom'): war's grammar is military, but its logic is political. Every decision on this field served — or strained — an aim set in Washington and Richmond. The gap between TACTICAL success and STRATEGIC effect is the campaign's final, enduring lesson."},
   pause:{title:"Strategic Assessment — Was Gettysburg Decisive?", side:"both", sub:"Capstone discussion",
     after:["Coupled with Vicksburg, was Gettysburg the 'turning point' — or does that label flatten a war with two more years to run?",
       "Distinguish Lee's TACTICAL defeat from the STRATEGIC effect of the campaign. What did the North actually gain?",
       "Map the campaign's lessons — intelligence, mission command, culmination, the offensive-defensive, civil-military friction — onto a contemporary operating problem your seminar is studying.",
       "If you commanded either army, what is the single decision you would change, and what second-order effects would it create?"]}},
];

/* Iconic orientation spots, highlighted per phase (schematic coords -> affine) */
GB.iconSpots = {
  "McPherson Ridge":[330,300],"Herr Ridge":[276,330],"Oak Hill":[446,250],"Barlow's Knoll":[566,250],
  "Seminary Ridge":[396,470],"Cemetery Hill":[522,374],"Culp's Hill":[576,408],
  "Cemetery Ridge":[500,470],"Little Round Top":[514,600],"Big Round Top":[524,662],
  "Devil's Den":[472,602],"The Wheatfield":[455,556],"Peach Orchard":[423,520],
  "The Angle":[500,470],"Spangler's Spring":[600,452]
};
GB.phaseIcons = {
  d1:["McPherson Ridge","Oak Hill","Barlow's Knoll","Seminary Ridge","Cemetery Hill"],
  d2:["Little Round Top","Big Round Top","Devil's Den","The Wheatfield","Peach Orchard","Culp's Hill"],
  d3:["The Angle","Cemetery Ridge","Seminary Ridge","Culp's Hill"],
  after:["Cemetery Ridge","Seminary Ridge","Cemetery Hill"]
};

/* ---------------------------------------------------------------
   GPS georeference control points: real [lon,lat] <-> map pixel [x,y]
--------------------------------------------------------------- */
GB.geoctrl = [
  {ll:[-77.2311,39.8309], px:[895,600]},
  {ll:[-77.2300,39.8221], px:[875,985]},
  {ll:[-77.2206,39.8156], px:[1015,1010]},
  {ll:[-77.2369,39.7919], px:[612,2175]},
  {ll:[-77.2383,39.7875], px:[588,2330]},
  {ll:[-77.2456,39.8160], px:[470,1300]},
  {ll:[-77.2520,39.8369], px:[430,360]},
  {ll:[-77.2497,39.7969], px:[525,1775]},
  {ll:[-77.2389,39.8417], px:[760,150]},
];

/* ---------------------------------------------------------------
   STANDS — real coordinates; `step` links to the rich step content
   (units, decision, discussion). GPS triggers within `r` meters.
--------------------------------------------------------------- */
GB.stands = [
  {id:"mcpherson",name:"McPherson Ridge",day:"Day 1 · morning",lat:39.8378,lon:-77.2460,r:220,step:"Buford's Stand",photo:"field_reynolds_fell",
   what:"Heth's division advanced east on the Chambersburg Pike. Buford's dismounted cavalry, on good ground and armed with breech-loading carbines, stopped Heth for almost two hours across these ridges. Reynolds brought up the I Corps and Wadsworth's counterattack wrecked Heth's leading brigades — but Reynolds was killed by a sharpshooter, committing the army to fight here."},
  {id:"oakhill",name:"Oak Hill",day:"Day 1 · afternoon",lat:39.84170,lon:-77.23890,r:200,step:"Line Collapses",
   bigIdea:"The meeting engagement neither commander chose — the road net and aggressive subordinates feed both armies in until each is committed.",
   takeaway:"A fight no one planned becomes the decisive battle: corps arrive piecemeal along converging roads, each new arrival deepens the commitment, and by dusk both armies are locked to ground their commanders never selected.",
   photo:"dead_first_day",
   what:"All five roads meeting at Gettysburg funneled troops onto this field. Rodes' division, marching down from the north, attacked off Oak Hill into the flank of a fight already joined to the west; Early's division arrived from York on yet another road and rolled up the Union right. Each corps fed in as it reached the sound of the guns — Confederate artillery on Oak Hill enfilading both Union corps — until both armies were fully committed to a battle neither Lee nor Meade had chosen to fight here. Both Union corps, losing over 50 per cent, gave way through town to Cemetery Hill: the XI Corps disorganized, the I Corps in good order covered by Buford."},
  {id:"barlow",name:"Barlow's Knoll",day:"Day 1 · ~3:00 p.m.",lat:39.84190,lon:-77.22470,r:170,step:"Line Collapses",
   bigIdea:"The unsupported forward salient — a division advanced off its anchor, exposed on both flanks. Sickles' error, a day early.",
   takeaway:"A commander who pushes forward to higher ground off the line he was tied into hangs both flanks in the air; the tactical mirror of Sickles at the Peach Orchard the next afternoon — local advantage purchased at the cost of mutual support.",
   photo:null,
   what:"Posted to anchor the right of the XI Corps line, Barlow instead advanced his division forward and uphill to this knoll — better ground to his front, but a salient projecting beyond the corps line, with both flanks unsupported. When Early's division arrived from York, it struck the exposed angle, turned both flanks, and rolled up the salient — collapsing the right that gathered the momentum carrying both Union corps back through Gettysburg. Barlow was badly wounded and captured on the knoll that bears his name."},
  {id:"cemhill",name:"Cemetery Hill",day:"Day 1 · evening",lat:39.82210,lon:-77.23000,r:200,step:"Line Collapses",photo:"cemetery_gatehouse",
   what:"The broken Union corps rallied here, where Steinwehr had turned the cemetery into a strong point. Hancock, arriving after 4:00 p.m. under Meade's orders, organized the position and grasped the importance of Culp's Hill. Lee ordered Ewell to take the hill 'if practicable' (the CMH book's words, 'if possible') — Ewell judged it not possible."},
  {id:"culps",name:"Culp's Hill",day:"Day 2–3",lat:39.81560,lon:-77.22060,r:200,step:"Culp's Hill",
   bigIdea:"Holding the barb of the fishhook — and the threat to the army's supply line behind it.",
   takeaway:"Greene held this height with one entrenched brigade against a division: economy of force on key terrain protects the Baltimore Pike, the army's lifeline.",
   photo:null,
   what:"The rugged, wooded mass anchoring the right of the fishhook, commanding the Baltimore Pike — the army's supply line — to its rear. On Day 2 evening Johnson occupied empty entrenchments at its foot but could not carry the hill, held by Greene's single brigade behind good entrenchments; by 11:00 a.m. on Day 3 the regrouped XII Corps had driven him back to his original position."},
  {id:"virginia",name:"Virginia Memorial — Lee's Line (Seminary Ridge)",day:"Day 2–3",lat:39.81130,lon:-77.24830,r:200,step:"Lee's Plan",photo:null,
   what:"Lee's vantage on Seminary Ridge. From here he planned the Day 2 echelon assault on the Union left and, on Day 3, watched Pickett's Charge step off across nearly a mile of open ground."},
  {id:"peachorchard",name:"The Peach Orchard",day:"Day 2 · midday — before the assault",lat:39.79690,lon:-77.24970,r:180,step:"Sickles Advances",photo:null,
   what:"Without permission from Meade, Sickles moved III Corps forward to this higher ground. Its salient shape let Confederate artillery take it under fire from two directions, and it was too extensive for one corps — the apex at the Peach Orchard — just as Longstreet's assault landed."},
  {id:"wheatfield",name:"The Wheatfield",day:"Day 2 · afternoon",lat:39.79750,lon:-77.24300,r:150,step:"Sickles Advances",
   bigIdea:"Attrition without decision — ground fed brigades in piecemeal and changed hands again and again.",
   takeaway:"Contested ground committed unit by unit consumes formations on both sides without yielding a decision; mass is squandered when it is fed in piecemeal.",
   photo:null,
   what:"In the rough, broken ground between Seminary Ridge and the Round Tops, Sickles' center and right held longer than his left, but the piecemeal Confederate assault eventually drove them back through this field — some of the day's hardest fighting."},
  {id:"devilsden",name:"Devil's Den",day:"Day 2 · ~4:30 p.m.",lat:39.79060,lon:-77.24250,r:150,step:"Little Round Top",
   bigIdea:"Terrain as combat multiplier on the open flank — the fight to anchor the army's left.",
   takeaway:"On an unanchored flank, the ground itself becomes the decisive force; who holds the rocks and the heights shapes the outcome more than numbers.",
   photo:"rebel_sharpshooter",
   what:"Hood's division rapidly smashed Sickles' left flank and overran the Devil's Den at the foot of Little Round Top before clawing up the hill's west side — which was the key to the Federal position."},
  {id:"lrt",name:"Little Round Top",day:"Day 2 · ~4:30 p.m.",lat:39.79190,lon:-77.23690,r:160,step:"Little Round Top",
   bigIdea:"Disciplined initiative again — the third data point alongside Buford and Sickles, on the key to the whole position.",
   takeaway:"Decisive results turn on subordinates empowered to act faster than orders can reach them, inside the senior commander's intent — Warren and Vincent, like Buford, read the ground and moved without being told.",
   photo:"little_round_top",
   what:"The key to the Federal position — its cleared crest could fire straight down the Union line. Warren found it held only by a small signal detail and got V Corps troops moving; on his own responsibility he diverted two brigades and a battery to the summit. Col. Strong Vincent rushed his brigade up on his own responsibility, reaching the crest a few yards ahead of Hood's men, and they drove the Confederates off in hand-to-hand fighting. On the extreme left, Chamberlain's 20th Maine broke the final assault with a downhill bayonet charge."},
  {id:"pamemorial",name:"Pennsylvania Memorial — Cemetery Ridge",day:"Day 2–3",lat:39.80500,lon:-77.23590,r:200,step:"Meade's Choice",photo:null,
   what:"The Union main line and Meade's interior position. From the fishhook, Meade shifted reserves faster than Lee could shift around its exterior — the decisive geometry of the battle."},
  {id:"angle",name:"The Angle — High-Water Mark",day:"Day 3 · ~3:00 p.m.",lat:39.81330,lon:-77.23580,r:150,step:"Pickett's Charge",
   bigIdea:"Culmination and the limits of the offensive — the farthest reach of the assault.",
   takeaway:"An army past its culminating point cannot force a decision; pressing the offensive here converted a stalled campaign into catastrophe.",
   photo:"high_water_mark",
   what:"The target of Pickett's Charge. Some 15,000 Confederates poured from the woods on Seminary Ridge into converging Union artillery and flanking infantry fire; for a moment their central mass stormed into the first Union line here. Brig. Gen. Lewis Armistead led a few hundred men over the stone wall, his hat on his sword, and fell mortally wounded among the Union guns before the Federals closed in — the 'high-water mark of the Confederacy.'"},
  {id:"cemetery",name:"Soldiers' National Cemetery",day:"Aftermath · 19 Nov 1863",lat:39.82050,lon:-77.23060,r:200,step:"Retreat",
   bigIdea:"The strategic verdict — where a tactical defensive victory acquires decisive strategic consequence.",
   takeaway:"War's grammar is military, but its logic is political: here Lincoln redefined the war's purpose, fixing the field's strategic meaning beyond the casualty lists.",
   photo:null,
   what:"The Federals lost 23,049 and the Confederates nearer 28,000 — a third of Lee's force — in the bloodiest battle in North American history. About four and a half months later, on this ground, Lincoln's address redefined the war's purpose."},
  {id:"warfield",name:"Warfield Ridge — Longstreet's Approach",day:"Day 2 · ~4:00 p.m.",lat:39.79280,lon:-77.25150,r:200,step:"Lee's Plan",
   bigIdea:"Operational design and the en-echelon attack — massing against the flank Lee believed weakest.",
   takeaway:"An attack in echelon demands synchronization the staff could not deliver: late orders and piecemeal commitment culminated the design before it could mass against the perceived flank.",
   photo:null,
   what:"Longstreet advanced over strange ground here, trying to avoid detection by the Federal signal station on Little Round Top, to attack a Union left Lee mistakenly placed along the Emmitsburg Road. The late orders, the ambush by III Corps sharpshooters, and the unexpected forward Union line at the Peach Orchard threw off the timetable from the first."},
  {id:"plumrun",name:"Plum Run — Hancock & the 1st Minnesota",day:"Day 2 · ~7:00 p.m.",lat:39.80050,lon:-77.23700,r:170,step:"Sickles Advances",
   bigIdea:"Spending a regiment to buy minutes — interior lines and a commander's nerve at the breakthrough.",
   takeaway:"Interior lines only convert to advantage when a commander has the nerve to spend a unit deliberately to buy the time reserves need to arrive.",
   photo:null,
   what:"With Sickles' salient driven back and a gap torn in the Union center, Hancock fed brigades down from Cemetery Ridge to plug it — here he threw the 1st Minnesota, about 262 men, at an advancing Confederate brigade to buy minutes for reserves, at terrible cost: it took roughly 82 per cent casualties, among the war's highest regimental loss rates. Interior lines and a commander's nerve sealed the breakthrough."},
];
/* Per-stand primary-source READINGS (public domain — OR, Battles & Leaders, pre-1929 memoirs) */
GB.standSources={
 mcpherson:[{who:"Brig. Gen. John Buford",work:"report & field dispatches, Official Records I:27:1"},{who:"Maj. Gen. Abner Doubleday",work:"report, OR I:27:1; Chancellorsville and Gettysburg (1882)"}],
 oakhill:[{who:"Maj. Gen. Robert Rodes / Lt. Gen. R.S. Ewell",work:"reports, OR I:27:2"},{who:"Maj. Gen. O.O. Howard",work:"report, OR I:27:1"}],
 barlow:[{who:"Brig. Gen. Francis Barlow / Maj. Gen. Jubal Early",work:"reports, OR I:27:1–2"}],
 cemhill:[{who:"Lt. Gen. R.S. Ewell",work:"report, OR I:27:2 — the 'if practicable' order"},{who:"Maj. Gen. W.S. Hancock",work:"report, OR I:27:1"}],
 culps:[{who:"Brig. Gen. George S. Greene / Maj. Gen. Edward Johnson",work:"reports, OR I:27:1–2"}],
 virginia:[{who:"Gen. Robert E. Lee",work:"campaign report, OR I:27:2"},{who:"Lt. Gen. James Longstreet",work:"report, OR I:27:2; From Manassas to Appomattox (1896)"}],
 warfield:[{who:"Lt. Gen. James Longstreet",work:"report, OR I:27:2 — the countermarch"},{who:"Maj. Gen. John B. Hood",work:"report/letter, OR I:27:2; Battles and Leaders"}],
 peachorchard:[{who:"Maj. Gen. Daniel Sickles",work:"report, OR I:27:1"},{who:"Maj. Gen. George Meade",work:"report & Committee on the Conduct of the War testimony (1864)"}],
 wheatfield:[{who:"Brig. Gen. John Caldwell / Brig. Gen. J.B. Kershaw",work:"reports, OR I:27:1–2; Battles and Leaders"}],
 devilsden:[{who:"Maj. Gen. J.B. Hood / Brig. Gen. E.M. Law",work:"reports, OR I:27:2; Law, 'The Struggle for Round Top,' Battles and Leaders"}],
 lrt:[{who:"Col. J.L. Chamberlain",work:"report, OR I:27:1; 'Through Blood and Fire at Gettysburg' (1913)"},{who:"Col. William C. Oates",work:"report, OR I:27:2; The War Between the Union and the Confederacy (1905)"},{who:"Maj. Gen. G.K. Warren",work:"report, OR I:27:1"}],
 plumrun:[{who:"Maj. Gen. W.S. Hancock",work:"report, OR I:27:1 — the 1st Minnesota"}],
 pamemorial:[{who:"Maj. Gen. W.S. Hancock / Brig. Gen. Henry Hunt",work:"reports, OR I:27:1"}],
 angle:[{who:"Maj. Gen. George Pickett / Lt. Gen. James Longstreet",work:"reports, OR I:27:1–2"},{who:"Brig. Gen. Henry Hunt",work:"report, OR I:27:1; 'The Third Day at Gettysburg,' Battles and Leaders"},{who:"E.P. Alexander",work:"Military Memoirs of a Confederate (1907)"}],
 cemetery:[{who:"Maj. Gen. George Meade",work:"report & correspondence, OR I:27:1 — the pursuit debate"},{who:"Abraham Lincoln",work:"Gettysburg Address, 19 Nov 1863 (public domain)"}],
};

/* ---------------------------------------------------------------
   TOURS — ordered routes through the stands (time / space / theme)
--------------------------------------------------------------- */
GB.tours = [
  {id:"chrono", name:"The Three Days", icon:"🕑",
   desc:"The whole battle in sequence, hour by hour — Buford's first shot through Pickett's repulse to the National Cemetery.",
   stops:["mcpherson","oakhill","barlow","cemhill","virginia","warfield","peachorchard","wheatfield","devilsden","lrt","plumrun","culps","angle","cemetery"]},
  {id:"route", name:"Battlefield Route", icon:"🚗",
   desc:"Every stand re-ordered for how you actually move on the ground — minimal backtracking, GPS-triggered as you drive or walk.",
   stops:["mcpherson","oakhill","barlow","virginia","warfield","lrt","devilsden","wheatfield","peachorchard","plumrun","pamemorial","angle","cemhill","culps","cemetery"]},
  {id:"decisions", name:"Command & Decisions", icon:"⚔",
   desc:"Only the decision points, in command-logic order — the seminar route for mission command, intent, and culmination.",
   stops:["mcpherson","cemhill","virginia","pamemorial","peachorchard","lrt","angle","cemetery"]},
  {id:"attack", name:"The Confederate Attack", icon:"🔴",
   desc:"The battle from Lee's side of the field — his offensive design and the assaults that came within a stone wall of breaking the line.",
   stops:["mcpherson","oakhill","virginia","warfield","peachorchard","devilsden","lrt","angle"]},
  {id:"defense", name:"The Union Defense", icon:"🔵",
   desc:"The fishhook from the defender's ground — interior lines, the rally on the heights, and the men who held each crisis in turn.",
   stops:["cemhill","culps","pamemorial","lrt","plumrun","angle","cemetery"]},
];

GB.assetsManifest = []; // filled by build (key/license credits)
window.GB = GB;
