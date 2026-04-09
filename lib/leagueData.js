export const SLOT_LIMITS = { 2025:5, 2026:6, 2027:7, 2028:8, 2029:9 }
export const getSlotLimit = (yr) => SLOT_LIMITS[yr] || 10
export const CURRENT_YEAR = 2026

export const teams = [
  { id:1, name:"HR Department", mgr:"SJ (Commish)", budget:184, deadMoney:95, deadPlayers:[], contracts:[
    { player:"Anthony Santander", sals:[6,11], curYr:2 },
    { player:"Elly De La Cruz", sals:[34,39], curYr:2 },
    { player:"Spencer Schwellenbach", sals:[5,10], curYr:2 },
    { player:"JJ Wetherholt", sals:[6,11], curYr:1 },
    { player:"Pete Alonso", sals:[29], curYr:1 },
  ]},
  { id:2, name:"Derek Holland Oates", mgr:"Sascha", budget:108, deadMoney:39, deadPlayers:[], contracts:[
    { player:"Tarik Skubal", sals:[20,25,35], curYr:2 },
    { player:"Ketel Marte", sals:[26,31], curYr:2 },
    { player:"Devin Williams", sals:[9,14], curYr:2 },
    { player:"Willy Adames", sals:[8,13], curYr:2 },
    { player:"Will Smith", sals:[15,20], curYr:2 },
    { player:"Brent Rooker", sals:[5,10], curYr:2 },
  ]},
  { id:3, name:"Caglionone My Wayward Son", mgr:"Bobby Buskett", budget:116, deadMoney:40,
    deadPlayers:[
      { player:"Sandy Alcantara", amount:11 },
      { player:"Colt Keith", amount:15 },
      { player:"Jasson Dominguez", amount:13 },
      { player:"Kristian Campbell", amount:10 },
    ],
    contracts:[
      { player:"Alec Bohm", sals:[10,15], curYr:2 },
      { player:"Zach Neto", sals:[14,19], curYr:1 },
      { player:"Lawrence Butler", sals:[6,11], curYr:2 },
      { player:"Jac Caglione", sals:[5,10], curYr:1 },
      { player:"Andrew Abbott", sals:[5], curYr:1 },
      { player:"Trevor Ragers", sals:[5], curYr:1 },
    ]
  },
  { id:4, name:"The Stewie Gooey Sluggers", mgr:"Sean S", budget:194, deadMoney:0, deadPlayers:[], contracts:[
    { player:"Jake Burger", sals:[8,13], curYr:2 },
    { player:"Taj Bradley", sals:[7,12], curYr:2 },
    { player:"Shota Imanaga", sals:[8,13], curYr:2 },
    { player:"Triston Casas", sals:[16,21], curYr:2 },
    { player:"Michael Busch", sals:[7,12], curYr:1 },
  ]},
  { id:5, name:"Sewer Snakez", mgr:"Chris F", budget:205, deadMoney:0, deadPlayers:[], contracts:[
    { player:"Jackson Merrill", sals:[12,17,27], curYr:2 },
    { player:"Dylan Crews", sals:[13,18,28], curYr:2 },
    { player:"Jackson Chourio", sals:[16,21,31], curYr:2 },
    { player:"Vladimir Guerrero Jr.", sals:[28,33], curYr:2 },
    { player:"Junior Caminero", sals:[10,15], curYr:2 },
    { player:"William Contreras", sals:[13,18], curYr:2 },
    { player:"Jarren Duran", sals:[9,14,24], curYr:2 },
  ]},
  { id:6, name:"Splitters are Quitters", mgr:"Pat J", budget:288, deadMoney:0, deadPlayers:[], contracts:[
    { player:"Juan Soto", sals:[49], curYr:1 },
    { player:"Rafael Devers", sals:[34], curYr:1 },
    { player:"Steven Kwan", sals:[8], curYr:1 },
    { player:"Tyler Soderstrom", sals:[6,11], curYr:1 },
    { player:"Samuel Basallo", sals:[5,10], curYr:1 },
    { player:"Hunter Goodman", sals:[6,11], curYr:1 },
    { player:"Taylor Ward", sals:[9], curYr:1 },
  ]},
  { id:7, name:"Stotty Potty", mgr:"Chris G", budget:126, deadMoney:39, deadPlayers:[], contracts:[
    { player:"Paul Skenes", sals:[13,18,28], curYr:2 },
    { player:"Francisco Lindor", sals:[33], curYr:1 },
    { player:"Josh Naylor", sals:[11,16], curYr:2 },
    { player:"Brenton Doyle", sals:[5,10], curYr:2 },
    { player:"Vinnie Pasquantino", sals:[7,12], curYr:2 },
    { player:"Anthony Volpe", sals:[13,18], curYr:2 },
    { player:"Pete Crow-Armstrong", sals:[11,16,26], curYr:1 },
    { player:"Brice Turang", sals:[10,15], curYr:1 },
  ]},
  { id:8, name:"Orion's Pants Are Still Down", mgr:"Brendan", budget:118, deadMoney:23, deadPlayers:[], contracts:[
    { player:"Nico Hoerner", sals:[15,20], curYr:2 },
    { player:"AJ Puk", sals:[6], curYr:1 },
    { player:"Cal Raleigh", sals:[14,19], curYr:2 },
    { player:"Jose Ramirez", sals:[42], curYr:1 },
    { player:"Randy Arozarena", sals:[15], curYr:1 },
    { player:"Cristopher Sanchez", sals:[11], curYr:1 },
    { player:"Raisel Iglesias", sals:[12,17], curYr:1 },
  ]},
  { id:9, name:"Fastball Sal", mgr:"Sal", budget:87, deadMoney:40, deadPlayers:[], contracts:[
    { player:"Aaron Judge", sals:[33,38,48], curYr:2 },
    { player:"Gunnar Henderson", sals:[35,40], curYr:2 },
    { player:"Ronald Acuna", sals:[35,40], curYr:1 },
    { player:"Nick Kurtz", sals:[10,15,25], curYr:1 },
    { player:"Konnor Griffin", sals:[5,10,20], curYr:1 },
    { player:"Nolan McLean", sals:[5,10], curYr:1 },
  ]},
  { id:10, name:"Big Ern McCracken", mgr:"Pat M", budget:175, deadMoney:20, deadPlayers:[], contracts:[
    { player:"Marcell Ozuna", sals:[13], curYr:1 },
    { player:"Cole Ragans", sals:[15], curYr:1 },
    { player:"Shane McClanahan", sals:[5,10], curYr:2 },
    { player:"Kyle Stowers", sals:[5,10], curYr:1 },
    { player:"Kyle Schwarber", sals:[27], curYr:1 },
    { player:"Roman Anthony", sals:[12,17,27], curYr:1 },
    { player:"Aroldis Chapman", sals:[6], curYr:1 },
    { player:"Chase Burns", sals:[5,10], curYr:1 },
  ]},
  { id:11, name:"Diamond Dogs Matt", mgr:"Matt", budget:232, deadMoney:31, deadPlayers:[], contracts:[
    { player:"James Wood", sals:[10,15,25], curYr:2 },
    { player:"Garrett Crochet", sals:[6,11], curYr:2 },
    { player:"Geraldo Perdomo", sals:[6,11], curYr:1 },
    { player:"Brian Woo", sals:[17,22], curYr:1 },
    { player:"Jacob Misiorowski", sals:[5,10], curYr:1 },
    { player:"Cam Schlittler", sals:[5,10], curYr:1 },
  ]},
  { id:12, name:"Oi BoiZ", mgr:"Jay", budget:210, deadMoney:20, deadPlayers:[], contracts:[
    { player:"Matt Chapman", sals:[7], curYr:1 },
    { player:"MacKenzie Gore", sals:[5], curYr:1 },
    { player:"Zack Wheeler", sals:[31], curYr:1 },
    { player:"TJ Friedl", sals:[6], curYr:1 },
    { player:"Gerrit Cole", sals:[24], curYr:1 },
    { player:"Hunter Brown", sals:[12,17], curYr:2 },
    { player:"Chris Sale", sals:[8,13], curYr:2 },
    { player:"Shohei Ohtani (P)", sals:[6,11], curYr:2 },
    { player:"Mason Miller", sals:[7,12], curYr:2 },
    { player:"Austin Riley", sals:[12,17], curYr:1 },
    { player:"Augustin Ramirez", sals:[5,10], curYr:1 },
  ]},
]

export function getCurSalary(c) { return c.sals[c.curYr - 1] || 0 }
export function getTotalCap(team) { return team.contracts.reduce((s, c) => s + getCurSalary(c), 0) }
export function getYearsRemaining(c) { return c.sals.length - c.curYr + 1 }
