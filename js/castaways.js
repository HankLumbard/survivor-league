// Survivor 51 cast — sourced from Wikipedia / official CBS cast reveal (Aug 25, 2026)
// id: stable slug used as the row key in the Castaways sheet tab, and the value stored in each draft pick.
// outcome starts null for everyone (still in the game). The commissioner updates this
// from the Admin page as the season plays out. See scoring.js for how outcome becomes points.
const SURVIVOR_51_CAST = [
  { id: "aaliyah-puglia",   name: "Aaliyah Puglia",            age: 24, hometown: "Providence, RI",     occupation: "Chef" },
  { id: "alexis-levine",    name: "Alexis Levine",             age: 34, hometown: "Atlanta, GA",         occupation: "Criminal Defense Attorney" },
  { id: "thien-an-nguyen",  name: "An \u201cThien An\u201d Nguyen", age: 24, hometown: "Fort Worth, TX",  occupation: "Medical Student" },
  { id: "ana-sani",         name: "Ana Sani",                  age: 34, hometown: "Toronto, ON",         occupation: "Voice Actress" },
  { id: "jelly-loblack",    name: "Angelica \u201cJelly\u201d Loblack", age: 29, hometown: "Bloomington, IN", occupation: "Sociology Professor" },
  { id: "rob-antonson",     name: "Rob Antonson",              age: 40, hometown: "Cumberland, RI",      occupation: "Airline Gate Agent" },
  { id: "brady-booker",     name: "Brady Booker",              age: 27, hometown: "Knoxville, TN",       occupation: "Pro Wrestler" },
  { id: "patt-cannaday",    name: "Patt Cannaday",              age: 33, hometown: "Washington, D.C.",   occupation: "Federal Prosecutor" },
  { id: "linnea-capobianco",name: "Linnea Capobianco",          age: 25, hometown: "Jersey City, NJ",    occupation: "Entrepreneur" },
  { id: "cristian-chavez",  name: "Cristian Chavez",            age: 26, hometown: "Salt Lake City, UT", occupation: "Head of HR" },
  { id: "sharonda-cox",     name: "Sharonda Cox",                age: 34, hometown: "Richmond, KY",      occupation: "Resident OB-GYN" },
  { id: "jenna-doore",      name: "Jenna Doore",                 age: 30, hometown: "Toledo, OH",        occupation: "Wedding Photographer" },
  { id: "kristin-flickinger", name: "Kristin Flickinger",        age: 49, hometown: "Santa Barbara, CA", occupation: "Crisis Management" },
  { id: "ori-jean-charles", name: "Ori Jean-Charles",            age: 27, hometown: "Spring Valley, NY", occupation: "Personal Trainer" },
  { id: "lewis-kelly",      name: "Lewis Kelly",                 age: 28, hometown: "Corozal, Puerto Rico", occupation: "Farmer" },
  { id: "danny-kilby",      name: "Danny Kilby",                 age: 30, hometown: "London, ON",        occupation: "Game Designer" },
  { id: "carter-krull",     name: "Carter Krull",                age: 24, hometown: "Sioux Falls, SD",   occupation: "Livestock Farmer" },
  { id: "eric-macksoud",    name: "Eric Macksoud",               age: 34, hometown: "Windsor Locks, CT", occupation: "Mental Health Counselor" },
  { id: "maggie-nestor",    name: "Maggie Nestor",               age: 40, hometown: "Charles Town, WV",  occupation: "Farmer" },
  { id: "mike-pinsky",      name: "Mike Pinsky",                 age: 32, hometown: "New York, NY",      occupation: "Baseball Operations Executive" },
  { id: "devin-way",        name: "Devin Way",                   age: 33, hometown: "Los Angeles, CA",   occupation: "Actor" },
].sort((a, b) => a.name.localeCompare(b.name));

if (typeof module !== "undefined") module.exports = SURVIVOR_51_CAST;
