// Survivor 51 cast — sourced from Wikipedia / official CBS cast reveal (Aug 26, 2026)
// id: stable slug used as the row key in the Castaways sheet tab, and the value stored in each draft pick.
// outcome starts null for everyone (still in the game). The commissioner updates this
// from the Admin page as the season plays out. See scoring.js for how outcome becomes points.
//
// photo: hotlinked (not hosted here) from CBS-affiliate press coverage, credited "Courtesy: CBS".
// This site does not store a copy of these images -- see README.md for details and the risk
// that comes with linking to someone else's server. Alexis uses a public cast photo from Parade/CBS;
// the roster-card CSS applies the same crop/zoom treatment as the other player cards.
const SURVIVOR_51_CAST = [
  { id: "aaliyah-puglia",     name: "Aaliyah Puglia",                     age: 24, hometown: "Providence, RI",       occupation: "Chef",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/b6cbfd4f-4722-4e95-9a4f-4cbac8693785-AaliyahPuglia.png" },
  { id: "alexis-levine",      name: "Alexis Levine",                      age: 34, hometown: "Atlanta, GA",          occupation: "Criminal Defense Attorney",
    photo: "https://parade.com/.image/ODowMDAwMDAwMDAyMzMwMzgz/alexis-levine.jpg?profile=w2560&x=50&y=50" },
  { id: "thien-an-nguyen",    name: "An \u201cThien An\u201d Nguyen",     age: 24, hometown: "Fort Worth, TX",       occupation: "Medical Student",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/1d72888c-3e41-4b2d-9d59-f356f2cbac64-TheinAnNguyen.png" },
  { id: "ana-sani",           name: "Ana Sani",                           age: 34, hometown: "Toronto, ON",          occupation: "Voice Actress",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/eb9e90cc-9964-4fca-bd9d-2940d1ef72eb-AnaSani.png" },
  { id: "jelly-loblack",      name: "Angelica \u201cJelly\u201d Loblack", age: 29, hometown: "Bloomington, IN",      occupation: "Sociology Professor",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/1d94ac9c-0787-46f2-91d6-fdb707b65637-JellyLoblack.png" },
  { id: "rob-antonson",       name: "Rob Antonson",                       age: 40, hometown: "Cumberland, RI",       occupation: "Airline Gate Agent",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/12b3ddb4-fc45-49e2-aa40-9234adf28d25-RobAntonson.png" },
  { id: "brady-booker",       name: "Brady Booker",                       age: 27, hometown: "Knoxville, TN",        occupation: "Pro Wrestler",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/05d9ecae-69eb-46d0-a6c3-e24daa6a1c28-BradyBooker.png" },
  { id: "patt-cannaday",      name: "Patt Cannaday",                      age: 33, hometown: "Washington, D.C.",     occupation: "Federal Prosecutor",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/f10d2fde-caf7-4d9f-8c4f-d5b92fda5dd6-PattCannaday.png" },
  { id: "linnea-capobianco",  name: "Linnea Capobianco",                  age: 25, hometown: "Jersey City, NJ",      occupation: "Entrepreneur",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/b6fac4a6-e910-4c00-906d-5c4b5a0248d4-LinneaCapobianco.png" },
  { id: "cristian-chavez",    name: "Cristian Chavez",                    age: 26, hometown: "Salt Lake City, UT",   occupation: "Head of HR",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/c5fe29ca-1071-4fb5-81e6-e355894b6fe3-CristianChavez.png" },
  { id: "sharonda-cox",       name: "Sharonda Cox",                       age: 34, hometown: "Richmond, KY",         occupation: "Resident OB-GYN",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/bbb97a5d-5cdf-4728-9fa6-a196321f18a9-SharondaCox.png" },
  { id: "jenna-doore",        name: "Jenna Doore",                        age: 30, hometown: "Toledo, OH",           occupation: "Wedding Photographer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/06d841bb-cf45-4d48-8483-4351aa7cc147-JennaDoore.png" },
  { id: "kristin-flickinger", name: "Kristin Flickinger",                 age: 49, hometown: "Santa Barbara, CA",    occupation: "Crisis Management",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/7012944f-38af-4971-a5bf-9c4a41d3ca00-KristinFlickinger.png" },
  { id: "ori-jean-charles",   name: "Ori Jean-Charles",                   age: 27, hometown: "Spring Valley, NY",    occupation: "Personal Trainer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/637f6f72-82c2-4a63-bb14-f8bb53c01959-OriJeanCharles.png" },
  { id: "lewis-kelly",        name: "Lewis Kelly",                        age: 28, hometown: "Corozal, Puerto Rico", occupation: "Farmer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/4ebc18d6-96a9-468c-aefd-3e49f6fd89ec-LewisKelly.png" },
  { id: "danny-kilby",        name: "Danny Kilby",                        age: 30, hometown: "London, ON",           occupation: "Game Designer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/34e0d308-5c3e-4c09-bb32-14fee7b707b0-DannyKilby.png" },
  { id: "carter-krull",       name: "Carter Krull",                       age: 24, hometown: "Sioux Falls, SD",      occupation: "Livestock Farmer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/28e202ec-6802-49b0-8fc7-f42504b8850f-CarterKrull.png" },
  { id: "eric-macksoud",      name: "Eric Macksoud",                      age: 34, hometown: "Windsor Locks, CT",    occupation: "Mental Health Counselor",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/c6f23588-ed4d-48b3-b009-67a0b06911c0-EricMacksound.png" },
  { id: "maggie-nestor",      name: "Maggie Nestor",                      age: 40, hometown: "Charles Town, WV",     occupation: "Farmer",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/a2d3b5e4-4e2e-4869-a1b5-ffc08030e03f-MaggieNestor.png" },
  { id: "mike-pinsky",        name: "Mike Pinsky",                        age: 32, hometown: "New York, NY",         occupation: "Baseball Operations Executive",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/76003c77-5106-4a3f-b7df-ad0971aad662-MikePinsky.png" },
  { id: "devin-way",          name: "Devin Way",                          age: 33, hometown: "Los Angeles, CA",      occupation: "Actor",
    photo: "https://cbs6albany.com/resources/media2/16x9/1280/800/center/80/a7ab02ab-53f6-4f8e-a9d3-103de9a146e1-DevinWay.png" },
].sort((a, b) => a.name.localeCompare(b.name));

if (typeof module !== "undefined") module.exports = SURVIVOR_51_CAST;
