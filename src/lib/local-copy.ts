/**
 * Per-place copy for the 49 location pages that have no source page.
 *
 * **This is the one file on the site whose words are written rather than
 * borrowed.** Rule 8.1 in PROJECT.md forbids that everywhere else, and it still
 * does; the repo owner lifted it for this file on 2026-09-22, after the client
 * asked for the last outstanding item on the SEO plan: "all service + location
 * pages on the website need to be more localized, in the copy, some location
 * pages only mention the location in the h1… Each service + location page needs
 * to be somewhat original."
 *
 * They were right about the measurement. Before this file, the 49 pages
 * `lib/planned-locations.ts` builds shared **100%** of their eight-word
 * sequences with a sibling, and **48 of the 49** never named their own place
 * below the h1 — every word was the service hub's. The other 146 location pages
 * come off the mirror and are in better shape: the 127 service-in-a-place pages
 * share a median 35%.
 *
 * **What is safe to write here, and what is not.** Everything below is either
 * geography — which county a town is in, which road reaches it, which districts
 * sit next to it — or a restatement of what the business already says about
 * itself on every other page: that the service is mobile, that the van comes to
 * a home, a workplace or a car park, and that it covers London and the counties
 * around it. Nothing here invents a fact about the *business*: no response
 * times, no customer counts, no years in a place, no prices, no awards. A claim
 * like that would be a lie the client has to answer for, and it is the one kind
 * of sentence this file must never grow.
 *
 * `areas` is the other half of the localisation, and it is worth more than the
 * prose: a page that names the districts around it is a page that answers the
 * search someone actually types. Every name is a real neighbouring place.
 */

/** The three services a built location page can be about. */
export type LocalFamily = "wash" | "valeting" | "detailing";

/**
 * What one service means in one place — the second half of the localisation,
 * added 2026-09-22 after an audit of the 124 pages on the client's
 * Ahrefs-verified list found the 49 built ones sharing a median **93%** of
 * their eight-word sequences with a sibling.
 *
 * `opening`, `why` and `areas` below are per *place*, so Brentwood's three
 * pages — a wash, a valet and a detail — carried the same 75 written words as
 * each other as well as as their family. This is per *(place × service)*, so
 * they no longer do.
 *
 * It is optional on purpose. 126 pages are in `PLANNED_LOCATIONS` and only the
 * 49 of round one are on the client's list; a page with no entry here builds
 * exactly as it did before rather than throwing at build.
 */
export type LocalService = {
  /**
   * The H2 over the band that carries the page's own opening copy.
   *
   * That band had no heading at all until now — `local.why`, the hub's service
   * paragraph and a photograph under a bare rule, between the district chips
   * and the price ladder.
   */
  heading: string;
  /** A second band, below the shared service copy and above the questions. */
  detail: { heading: string; body: string[] };
  /**
   * One question for the page's own accordion, answered out of `areas`.
   *
   * "Do you cover all of X?" is the question a location page exists to answer
   * and the one every hub's accordion cannot: the hub's own coverage question
   * is the one `planned-locations.ts` drops for being about London.
   */
  faq: { q: string; a: string[] };
};

export type LocalPlace = {
  /** Where the place is, as the opening sentence puts it. */
  opening: string;
  /** What being mobile means in this particular place. */
  why: string;
  /** Districts and neighbouring towns the round covers. */
  areas: string[];
  /** Per-service copy, for the pages that have had it written. */
  services?: Partial<Record<LocalFamily, LocalService>>;
};

/**
 * Keyed by the slug's own tail, so a place that carries three service pages —
 * Brentwood, Luton and Romford each do — is described once and read three
 * times. The service name is the only thing that differs between them, and
 * `planned-locations.ts` supplies it.
 */
export const LOCAL_PLACES: Record<string, LocalPlace> = {
  barnet: {
    opening:
      "Barnet spreads across the top of North London, from High Barnet and Totteridge down through Finchley and Whetstone, with the A1 and the M1 running either side of it.",
    why: "It is a borough of long driveways and quiet residential roads, which is exactly where a mobile service works best: there is room to work beside the car, and no reason to give up half a Saturday driving to a unit and waiting.",
    areas: [
      "High Barnet",
      "New Barnet",
      "Whetstone",
      "Totteridge",
      "Finchley",
      "Mill Hill",
      "Arkley",
      "Cockfosters",
    ],
      services: {
      detailing: {
        heading: "Detailing a Car Without Leaving Barnet",
        detail: {
          heading: "What Barnet Roads Leave on Your Paintwork",
          body: [
            "Paint on the northern edge of the capital takes two kinds of punishment. Under the tree cover at Totteridge and Arkley it is sap and leaf fall, which will mark a clear coat if they sit on it through an autumn. Along the A1000 as it climbs from Finchley through Whetstone up to High Barnet it is brake dust and traffic film instead, laid down a little at a time in stop-start traffic.",
            "Once either has bonded into the lacquer a rinse will not shift it. Detailing goes at the bodywork properly — cleaned, polished and protected from top to bottom — and the light marks a hedge or a shared car park leaves behind can be worked on in the same visit.",
          ],
        },
        faq: {
          q: "Do I need a driveway in Barnet, or can you work at the kerb?",
          a: ["A drive is the easiest version of it, and plenty of the housing around Totteridge, Arkley and Mill Hill has one with space beside the car. It is not a requirement, though. A resident’s bay in Whetstone or New Barnet works, so does a space at a workplace, and so does a station car park with the car standing there for the day. The van brings its own water and power, so nothing has to be run out from the house."],
        },
      },
    },
  },
  basildon: {
    opening:
      "Basildon sits in south Essex on the A127, between Brentwood and Southend, with Pitsea, Laindon and Vange around it and the Thames estuary a short run to the south.",
    why: "Estuary air carries salt, and cars parked outside all week in it pick up a film that a quick wash never quite lifts. Working at your address means the car is dealt with where it stands, rather than driven across town to a bay.",
    areas: ["Pitsea", "Laindon", "Vange", "Wickford", "Billericay", "Langdon Hills", "Fobbing"],
      services: {
        valeting: {
          heading: "Inside a Basildon Car After Winter",
          detail: {
            heading: "Dog Walks, Marsh Paths and Basildon Carpets",
            body: [
              "There is more green around Basildon than the town centre suggests. Langdon Hills is clay underfoot and holds water well into spring, the paths through Wat Tyler Country Park at Pitsea run straight out onto the marsh, and the open ground at Northlands Park is churned by the end of half-term. All of it comes back on boots and paws and presses down into the footwell carpet, where it stays wet.",
              "A valet is the version of the job that goes at that rather than around it: the carpets worked through rather than wiped over, the seats gone over properly, and the damp drawn out, because damp left down there is what a car smells of by February. It happens wherever the car is standing — a drive at Langdon Hills, a bay at a Cranes Farm Road workplace, a kerbside space in Vange — since the van carries its own water and power.",
            ],
          },
          faq: {
            q: "Can you valet a car left at Basildon station for the day?",
            a: ["A station car park is a straightforward place to work, at Basildon, Laindon or Pitsea, and the car simply stays in its space until the evening train. A workplace bay out at Burnt Mills does the same job. The round also runs north to Wickford and Billericay and south towards Fobbing, and nothing is needed at the address beyond somewhere for the van to stand."],
          },
        },
        wash: {
          heading: "Basildon Sits Between Two Trunk Roads",
          detail: {
            heading: "Wheels, Shuts and Standing Time in Basildon",
            body: [
              "Basildon has a trunk road along the top of it and another along the bottom, and a car that uses either comes back wearing the same grey film — off the A127 at one end of the day, off the A13 and the run down towards the river at the other. Lorries keep both of them dirty long after the rain has stopped. Add the brake dust that a week of roundabouts and slip roads puts on the wheel faces, and the wheels go dull well before the panels do.",
              "A wash is the routine version of dealing with that, kept up often enough that nothing gets the chance to bond — wheels, sills and door shuts included, not only the flat panels. Most of these cars commute from Laindon, Basildon or Pitsea into Fenchurch Street and then stand in the same bay all day, which is as workable a place to clean a car as a drive at Noak Bridge. Where one has been left a good deal longer than that, a valeting package is the more honest place to start.",
            ],
          },
          faq: {
            q: "Do you cover Wickford and Billericay as well as Basildon?",
            a: ["Yes, both, along with Pitsea, Laindon, Vange, Langdon Hills and the villages down towards Fobbing. The round is worked by address rather than by postcode, so a house on a lane outside Billericay counts the same as one on an estate road in the middle of Basildon. The thing that actually matters is room to get around the car where it stands."],
          },
        },
      detailing: {
        heading: "Coming Out to Basildon and the Towns Around It",
        detail: {
          heading: "Where the Car Is Parked in Basildon",
          body: [
            "Basildon was laid out as a new town, and the parking was laid out with it: garage courts behind the terraces, squares of bays shared by a row of houses, and proper drives on the later estates at Langdon Hills and out towards Billericay. Which of those the car sits in changes how the job is set up, not whether it can be done.",
            "A drive gives room to work all the way round. A shared bay or a garage court means working in the space the car already occupies, and a workplace car park on one of the industrial estates is the same again, with the car standing still while the shift runs. Nothing is needed from the building itself — the van does not turn up looking for a tap or a socket.",
          ],
        },
        faq: {
          q: "Will the salt off the estuary come back on the paint after a detail?",
          a: ["Salt and traffic film settle again on anything kept outside, and they show lowest down first — along the sills, the backs of the doors and across the glass, where low winter sun picks it up. Cars kept at Pitsea, Vange and Fobbing are the nearest to the marshes for it. What the work does is take the bonded film off and leave the bodywork cleaned, polished and protected rather than shut underneath it."],
        },
      },
    },
  },
  bedfordshire: {
    opening:
      "Bedfordshire runs north from the edge of Hertfordshire up past Luton, Dunstable and Bedford, with the M1 down its western side and a great deal of commuter parking either side of it.",
    why: "It is a county of station car parks and long weekday absences, which is the worst combination for paintwork — the car sits still, collects whatever falls on it, and only gets looked at on a Sunday. A mobile round deals with it on a weekday instead.",
    areas: ["Luton", "Dunstable", "Bedford", "Leighton Buzzard", "Ampthill", "Biggleswade", "Flitwick"],
      services: {
        detailing: {
          heading: "Getting Depth Back Into Bedfordshire Paintwork",
          detail: {
            heading: "A Fortnight in a Bedfordshire Car Park",
            body: [
              "A car left in a long-stay car park at Luton Airport for a fortnight is not resting. It is standing under open sky collecting bird lime and pollen, and a fortnight is long enough for lime to etch a clear coat rather than sit on top of it. The same goes for a car that spends a week under the limes on a Bedford side street, or under the pines around Woburn Sands.",
              "Detailing is where that gets dealt with properly rather than rinsed over. The bodywork is decontaminated, machine polished and then sealed, so the finish reads as colour again instead of as a dull grey cast, and the seal is what buys the time to get the next thing off before it bites. A drive at Ampthill, a kerb in Leighton Buzzard or a workplace bay off the A421 are all somewhere the van can do it, water and power included.",
            ],
          },
          faq: {
            q: "Do you cover the whole county, or only the towns near the M1?",
            a: ["The round takes in Luton, Dunstable and Bedford, and it goes out to Leighton Buzzard on one side and Biggleswade on the other, so the A1 towns are as ordinary a call as the A5 ones. Villages between them are the same job. If the car is standing at a workplace rather than at home, we come to it there instead."],
          },
        },
        wash: {
          heading: "Bedfordshire Cars Spend the Week Standing Still",
          detail: {
            heading: "Hard Water and Road Spray in Bedfordshire",
            body: [
              "A great many cars here do the same twelve hours: out before eight, parked up at Flitwick, Leagrave, Biggleswade or Leighton Buzzard, and collected after dark. Standing still is not restful for paintwork. Dust settles out of the air and the next shower fixes it in place, the trees along the edge of a car park drop whatever they are dropping that month, and by the time anybody looks at the car properly there is a fortnight of it on the panels.",
              "The water out of the taps here is hard, drawn off chalk, so a car hosed down and left to dry in the sun comes up spotted with everything that water was carrying. Getting the dirt off and the car dried before that can happen is half of what a wash is for. The other half is the back of it: a wet run up the A6 or the A421 lays a film across the tailgate and the rear glass that nobody notices until they open the boot.",
            ],
          },
          faq: {
            q: "How far north in Bedfordshire do you come for a wash?",
            a: ["As far as Bedford and the villages either side of it. Luton and Dunstable are the busiest end of the county for it, with Leighton Buzzard, Flitwick, Ampthill and Biggleswade in between. Because there is no site to bring the car to, the booking is made to an address instead, and a drive, a kerbside space or a bay at work all suit it equally well."],
          },
        },
      valeting: {
        heading: "What a Valet in Bedfordshire Is Up Against",
        detail: {
          heading: "Chalk, Road Film and Winter Grit in Bedfordshire",
          body: [
            "The ground changes across the county and so does what comes into the car with it. Chalk off the Downs above Dunstable is pale and fine and shows on a dark carpet straight away, the greensand through Flitwick and Ampthill is darker and coarser, and the arable country round Biggleswade puts field mud on the lanes for most of the autumn. Most of it arrives on boots and coats and ends up in the footwells.",
            "Outside, the M1 down the western edge and the A5 through Dunstable leave a film on the lower panels that a hose on its own will not shift, and winter grit goes for the sills and the wheel arches first. Neither needs the car taken anywhere — a drive in Leighton Buzzard or a workplace car park in Bedford is enough, because the van carries its own water and power.",
          ],
        },
        faq: {
          q: "Can you valet a car parked on the street rather than on a drive?",
          a: ["Luton’s terraced streets and the older roads in central Bedford mostly park at the kerb, and a kerbside bay is a perfectly ordinary place to work — a workplace car park does just as well. The car does not move for it either way."],
        },
      },
    },
  },
  berkshire: {
    opening:
      "Berkshire sits along the M4 west of London, taking in Reading, Slough, Bracknell, Maidenhead and Windsor, with the Thames winding through most of it.",
    why: "Business parks and long motorway miles are what most Berkshire cars do, and motorway miles are the kind that leave the worst behind: tar spots, fly, and a windscreen you cannot see through into low sun. All of that is handled where the car is parked.",
    areas: ["Reading", "Slough", "Bracknell", "Maidenhead", "Windsor", "Wokingham", "Newbury", "Ascot"],
      services: {
        wash: {
          heading: "What Town Driving Costs a Berkshire Car",
          detail: {
            heading: "Winter Salt on a Berkshire Round",
            body: [
              "Not all the mileage here is motorway mileage. A Berkshire week has a great deal of short, stop-start driving in it as well — the A4 through Slough, the ring road round the middle of Reading, the shuffle in and out of Maidenhead at either end of the day — and stop-start driving is what fills wheel faces with brake dust. It comes off hot, bonds itself to the lacquer on an alloy and stays there, which is why the wheels on an otherwise tidy car usually look worse than the paint.",
              "Winter is the other half of it. The M4 and the A4 are gritted early and gritted often, and the spray off them goes straight to everything low down: sills, arches, the backs of the doors, the bottom of the tailgate. A wash kept to a short interval is how that gets managed rather than left to build. It is set up wherever the car is standing — a marked bay on one of the business parks at Reading or Winnersh, a station car park, a drive at Wokingham or Ascot.",
            ],
          },
          faq: {
            q: "Do you come to office car parks around Reading and Bracknell?",
            a: ["Yes, where there is room to work around the car and no objection from whoever runs the parking. A bay on one of the business parks off the M4 does the job as well as a driveway at home, and the car stays exactly where it was left for the day. Nothing is wanted from the building itself, since the van brings its own water and its own power."],
          },
        },
      valeting: {
        heading: "Berkshire Cars, Cleaned Where They Are Parked",
        detail: {
          heading: "Interiors on a Berkshire Weekend",
          body: [
            "Weekends here tend to end up by the water. The Thames runs through Windsor, Maidenhead and Reading, with the Loddon coming up to meet it below Wokingham, and towpath mud goes back into the footwells with whoever walked it, dog hair with the dog and crumbs with everyone else. By November the same car films over on the inside overnight, which is damp working its way out of the carpets rather than anything on the glass.",
            "Damp has to be worked out of a carpet rather than wiped off it, which is why a carpet takes longer than a panel. Time like that is easiest to give a car that is standing where it lives, which is as true on a Bracknell estate road as it is outside a flat in Slough.",
          ],
        },
        faq: {
          q: "Do you valet out as far as Newbury?",
          a: ["Newbury is on the round, and so is Ascot at the other end of the county. The van is self-contained — water and power travel with it — so the work is the same in either place, done wherever the car happens to be standing."],
        },
      },
      detailing: {
        heading: "Why Berkshire Paint Loses Its Gloss",
        detail: {
          heading: "Correction and Protection Without Leaving Berkshire",
          body: [
            "Most of what dulls a finish here is not the road at all — it is the roller wash that follows it. Fine swirls go into the lacquer a few at a time, and a bonnet with a few years of them behind it reads as haze once the light is on it rather than as colour. The A34 above Newbury, the A329(M) between Reading and Bracknell and the A404 running up towards the M40 only mean it happens sooner.",
            "The other half of it is what falls on a car that is standing still. Ascot and Bracknell sit in pine and birch country at the edge of Swinley Forest, and the older streets in Windsor are lined with trees as well; a car left under any of it picks up sap and bird lime, both of which will mark a clear coat if they sit through a warm week. Sealing the paint is what buys the time to get them off before they etch, and everything the work needs travels in the van, water and power included.",
          ],
        },
        faq: {
          q: "Can swirl marks from an automatic wash be polished out?",
          a: ["Correction is exactly that work, and it is the slow half of a detail rather than anything a wash includes. It happens at the address like the rest of a detail, whether that address is in Slough, Maidenhead or Wokingham."],
        },
      },
    },
  },
  brentwood: {
    opening:
      "Brentwood sits just outside the M25 at junction 28, where the A12 heads on into Essex, with Shenfield, Hutton and Ingatestone around it.",
    why: "It is largely a commuter town, and a commuter car spends its week at a station or on the drive rather than in a garage. Coming to the address is simply the arrangement that fits — the work happens while the car is somewhere it would be anyway.",
    areas: ["Shenfield", "Hutton", "Ingatestone", "Pilgrims Hatch", "Warley", "Doddinghurst", "Mountnessing"],
      services: {
      wash: {
        heading: "Brake Dust, Salt and the Regular Wash",
        detail: {
          heading: "Washing a Car at Its Brentwood Address",
          body: [
            "Town traffic tells on a car’s appearance here — the crawl through Brentwood High Street, the shuffle on and off the A1023 at either end of the day. Brakes shed a fine dust that settles on wheel faces and in the shuts, and once the lanes east and north of the town are gritted, salt goes on top of it. Neither reads as dirt straight away; both are working on the finish all the same.",
            "A wash is the maintenance version of all that, kept up often enough that nothing gets the chance to set. It comes to the car, so it fits around wherever the car is standing that day — outside the house, in a bay at work, or at the kerb on a road with no off-street parking at all. If it has been rather longer than six weeks since the last proper clean, a valeting package is the better place to start.",
          ],
        },
        faq: {
          q: "Can the car be washed while it is parked at work?",
          a: ["Yes, where the space allows it. An office bay on one of the estates around the town does the job as well as a drive at home. The car is not moved, and nothing is run from the building."],
        },
      },
      valeting: {
        heading: "What Winter Does Inside a Brentwood Car",
        detail: {
          heading: "Valeting Where the Car Is Already Parked",
          body: [
            "The lanes north towards Doddinghurst and east past Mountnessing are narrow and hedged, and for a good part of the year they are muddy. What comes off them ends up inside the car rather than on it — walked in on boots, shed off a dog blanket, pressed down into the footwell carpet where it stays damp. By midwinter the glass is filming over from the inside on every cold morning.",
            "None of that needs the car taken anywhere. An older terrace near the High Street may have nothing but a permit bay, while a newer flat by the station has a marked space in a shared car park and a semi at Hutton or Warley has a drive; the work is arranged around whichever the address turns out to be. Water and power come with the van rather than from the house.",
          ],
        },
        faq: {
          q: "Can you valet a car that is parked on the street?",
          a: ["Yes. A resident’s bay or a kerbside space near the town centre is as workable as a drive at Shenfield or Hutton, and a marked space at a block of flats is fine as well. What the address offers decides how the job is set up, not whether it goes ahead."],
        },
      },
      detailing: {
        heading: "Paintwork That Lives on the A12",
        detail: {
          heading: "Where Detailing Gets Done in Brentwood",
          body: [
            "Junction 28 and the A12 put a good deal of the mileage here at speed, and paint picks up something different at speed than it does in traffic. Grit thrown off the road stipples the bonnet and the leading edges of the mirrors, while tar builds up low on the doors and sills. Underneath it the lacquer goes flat, and no amount of washing brings that back.",
            "Work of that kind wants the car standing still rather than queued in somebody’s yard. Hutton and Shenfield run mostly to semis with a drive down one side, and the plots out towards Pilgrims Hatch are larger again, so space is rarely the difficulty. The cleaning, polishing and protecting are done there, at the address.",
          ],
        },
        faq: {
          q: "Do you detail cars outside the town itself?",
          a: ["Yes. Shenfield and Hutton run on from the town almost without a break, so an address there is treated no differently to one on the High Street. Further out, where the streets give way to lanes around Doddinghurst and Mountnessing, the arrangement is the same."],
        },
      },
    },
  },
  bromley: {
    opening:
      "Bromley is the largest of the London boroughs by area, running from Beckenham and Penge out to Orpington, Chislehurst and the Kent border beyond.",
    why: "Much of it is suburban, with off-street parking and tree cover — and tree cover means sap and bird lime, which set hard and need lifting properly rather than scrubbing. Working at the address means treating it before it has time to etch.",
    areas: ["Beckenham", "Penge", "Orpington", "Chislehurst", "West Wickham", "Hayes", "Shortlands", "Biggin Hill"],
      services: {
        wash: {
          heading: "A Mobile Wash Across the Bromley Borough",
          detail: {
            heading: "From the Commons to the A21 in Bromley",
            body: [
              "More of this borough is common and woodland than people expect — Hayes and Keston commons, the woods at Petts Wood, the long green edges out towards Downe and Cudham. In late spring the lot of it releases at once, and a car parked underneath any of it comes up with a fine yellow-green film across the bonnet and roof. It is not heavy dirt. It is simply everywhere, it holds water against the paint, and it is back again a few days after it has been taken off.",
              "Then there is the A21, which runs the length of the borough from Bromley Common down past Farnborough towards the motorway, with a set of lights or a roundabout every few hundred yards. Cars that use it daily carry the brake dust to prove it, and from December there is grit on top. A wash at a short interval keeps both off, and the work goes to the car rather than the other way about — a drive at Petts Wood, a station bay at Orpington, a permit space in Anerley.",
            ],
          },
          faq: {
            q: "Do you wash cars parked at Orpington or Petts Wood station?",
            a: ["If the bay has space to work in, yes — the car stands there all day in any case, so it is a sensible enough place for it. Cars left for the day at Bromley South or Chislehurst are dealt with the same way. This is a long borough and the round takes in all of it, from Penge in the north down to Biggin Hill on the ridge."],
          },
        },
      valeting: {
        heading: "Short Journeys, and What They Leave in a Bromley Car",
        detail: {
          heading: "A Valet That Comes to the Kerb or the Drive",
          body: [
            "Cars in the middle of the borough do short journeys and plenty of them, and short journeys are harder on an interior than on anything mechanical. Carpet takes whatever is on people’s shoes between the school gate at Hayes and the shops at West Wickham, seats take the daily wear, and a car that is never out long enough to warm through holds the damp in its mats from November onwards.",
            "A valet deals with that where the car is parked, which in this borough is usually within a few steps of the front door. Where there is no off-street space at all — a Penge terrace, a converted house on one of the Beckenham roads — the permit bay does just as well, because the car is not asked to move for it. Seats, carpets, glass and trim are all done with the car standing where it was left.",
          ],
        },
        faq: {
          q: "Which parts of the borough do you valet in?",
          a: ["Everywhere in it, north to south. The practical question is usually the space rather than the postcode — a marked bay at a block of flats, a driveway or a quiet stretch of kerb are all workable, and the car is cleaned where it already is."],
        },
      },
      detailing: {
        heading: "Low Ground, High Ground and Bromley Paintwork",
        detail: {
          heading: "What It Takes to Bring the Finish Back",
          body: [
            "The north of the borough lies low, in the valley the Ravensbourne runs north through, and a car kept down there sits in a damp that never quite lifts between October and March. Glass films over, and a bloom comes back onto the paint a day after it has been cleaned. The ground climbs south towards Chislehurst and the ridge at Biggin Hill, where the trouble is exposure instead. Grit blows about, frost sits on the car most of the winter, and a finish that is never under cover dulls year on year.",
            "Bringing paint back from either is unhurried work, and it happens where the car is kept rather than at a unit somewhere else. There is generally standing room enough at a Hayes or West Wickham address, and where there is not, a numbered bay at a block near the town centre answers just as well. The van carries its own water and power, so the car is cleaned, polished and protected on the spot.",
          ],
        },
        faq: {
          q: "Do you come out to the southern end of the borough?",
          a: ["Yes. The roads climbing past Chislehurst and Orpington towards Biggin Hill are covered the same as the streets around the town centre. Detailing is booked to an address rather than to a postcode district, so sitting out on the edge of the borough changes nothing."],
        },
      },
    },
  },
  chelmsford: {
    opening:
      "Chelmsford is the county town of Essex, up the A12 from the M25, with Great Baddow, Springfield and Writtle around it and a good deal of new housing besides.",
    why: "New estates tend to mean shared parking courts and tight bays, which is where a fixed-site valet becomes a chore and a mobile one does not: the van carries its own water and power, so the car never has to leave its space.",
    areas: ["Great Baddow", "Springfield", "Writtle", "Galleywood", "Broomfield", "Danbury", "Boreham"],
      services: {
        valeting: {
          heading: "What Gets Carried Into a Chelmsford Car",
          detail: {
            heading: "A Weekday Valet in Chelmsford",
            body: [
              "Chelmsford runs on the Liverpool Street trains, and a car that drops someone at the station or at one of the park-and-ride car parks on the city edge then stands still until the evening. That is dead time, and it is the easiest time to use: the car is where it will be for hours, nobody needs it, and the work goes on around it without anyone having to come home for it.",
              "The other half of it is what the weekend puts back. The Chelmer and the Can meet in the middle of the city, and the riverside paths along both of them, Hylands Park to the south-west and the common at Danbury further out, are all wet clay from October onwards. It travels home in the footwells and under the seats, and it has to be drawn out of the carpet rather than brushed off the top of it.",
            ],
          },
          faq: {
            q: "Do you valet cars in the villages outside Chelmsford as well?",
            a: ["Yes. Writtle, Galleywood, Danbury, Broomfield and Boreham are all on the round, along with Great Baddow and Springfield closer in. Because the booking is to an address rather than a site, a village drive, an estate road or a space outside an office all work the same way, and nothing has to be provided at the other end."],
          },
        },
        wash: {
          heading: "A Chelmsford Wash, Week After Week",
          detail: {
            heading: "The Working Day of a Chelmsford Car",
            body: [
              "Chelmsford runs on the Liverpool Street line, and a good many cars here spend the working day doing nothing whatever — standing at the station, at one of the park-and-ride sites either side of the city, or in a company car park off the ring road. Whatever is in the air that day comes down on them, rain presses it in, and the next dry spell bakes it on. None of that is dramatic. It is simply how a car gets dull without going anywhere dirty.",
              "The driving supplies the rest. The A12 past the city and the A130 running south throw up a fine grey spray in the wet, and it reaches the lower doors, the back of the car and the glass, which is the part anybody notices at half past four in January. A wash is the maintenance answer: exterior work on a short enough cycle that none of it has to be argued with. It is done on a drive at Springfield, in a bay at Chelmer Village, or at the kerb in Great Baddow.",
            ],
          },
          faq: {
            q: "Do you wash cars at the park-and-ride sites around Chelmsford?",
            a: ["Where the site allows it and there is room to work round the car, yes. It is the same arrangement as a bay at work: the car stays where it was left, and nothing is drawn from the site itself, because water and power travel with the van. If the car is at home instead, a drive at Galleywood or a kerbside space in Moulsham answers just as well."],
          },
        },
      detailing: {
        heading: "Detailing a Car Kept in Chelmsford",
        detail: {
          heading: "What Chelmsford Paintwork Comes Up Against",
          body: [
            "Cars here tend to do long dual-carriageway runs and short town hops in the same week, and paint takes both badly: bonded tar and fly across the nose from the open road, and a dull, swirled finish from hurried washing between trips. Older roads through Galleywood and Danbury run under heavy trees, so sap and leaf fall etch into the clear coat over a summer.",
            "Work of that kind wants daylight and a bit of room more than it wants a unit, and it gets both on a Broomfield driveway, at a Writtle kerbside, or in a workplace car park out at Boreham. The bodywork is cleaned, polished and protected from top to bottom in whichever of those the car happens to be parked in.",
          ],
        },
        faq: {
          q: "Does detailing include any restoration work?",
          a: ["Some light restoration, yes. It is not a repair service — a dent or a scrape is a different trade altogether — but the process takes in the whole of the bodywork, and some of what looks like damage on a car that lives outside at Springfield or Great Baddow turns out to be bonded grime rather than anything underneath it."],
        },
      },
    },
  },
  cheshunt: {
    opening:
      "Cheshunt lies in the Lee Valley in Hertfordshire, on the A10 between Enfield and Broxbourne, with Waltham Cross and Goffs Oak beside it.",
    why: "The valley road carries a lot of heavy traffic, and cars kept along it pick up brake dust and road film faster than most. Dealing with that at the house, on a day that suits, is easier than finding a slot somewhere on the A10 and waiting in it.",
    areas: ["Waltham Cross", "Goffs Oak", "Broxbourne", "Turnford", "Wormley", "Hoddesdon", "Enfield"],
      services: {
        detailing: {
          heading: "Gloss That Survives a Cheshunt Winter",
          detail: {
            heading: "Water, Glasshouses and Paint Around Cheshunt",
            body: [
              "The valley floor is wet ground and behaves like it. Mist sits over the lakes and the Lee Navigation well into a winter morning, so a car standing at Waltham Cross or Broxbourne stays damp for longer each day than one up on the higher ground at Goffs Oak. Damp does not mark paint on its own. What it does is keep everything that has landed there soft and in contact, which is how a film bonds instead of blowing off.",
              "Then there is what falls on it. Water this close draws gulls and geese off the lakes, and bird lime is the one thing that will etch a clear coat inside a warm week rather than over a season. The old glasshouse ground along the valley adds its own dust in a dry spell. A detail lifts the bonded layer off, machine polishes the haze and the fine swirls out of the lacquer underneath, then seals it so the next winter has something to land on.",
            ],
          },
          faq: {
            q: "How far up the valley do you go from Cheshunt?",
            a: ["Broxbourne and Hoddesdon are on the round going north, with Turnford and Wormley in between, and Waltham Cross sits the other way towards the M25. Goffs Oak is a short run west and Enfield is over the county boundary. A drive is the easiest place to work, though a marked bay in a close or a workplace car park off the A10 does as well, since the van brings its own water and power."],
          },
        },
        wash: {
          heading: "Damp, Dust and a Cheshunt Wash",
          detail: {
            heading: "Along the Valley Floor at Cheshunt",
            body: [
              "The valley floor is wet ground. The Lea, the New River and a chain of flooded gravel pits run the length of it, and the air above them holds its damp well into the morning. A car left out overnight anywhere near the water is wet by six and dries slowly, which gives dust something to hold onto, and the birds that live on those lakes account for a good deal of what lands on a roof around Turnford and Wormley.",
              "A wash is the short-interval answer to that — the film taken off the panels and the glass before it has dried on twice over, with the wheels, sills and shuts done at the same time. Where it happens depends on where the car spends its day. That might be the address itself, or a workplace over towards Hoddesdon, or the station car park while its owner is on the train to Liverpool Street. The short interval is what keeps it a wash rather than a recovery job.",
            ],
          },
          faq: {
            q: "Do you come over the border into Enfield and Hoddesdon?",
            a: ["Yes. The round follows the valley rather than the county line, so Waltham Cross, Turnford, Wormley, Broxbourne and Hoddesdon are all on it, and so is Enfield on the London side of the boundary. Goffs Oak and the lanes west of it are covered as well. Wherever the car is standing on the day is where the wash is set up."],
          },
        },
      valeting: {
        heading: "Keeping a Cheshunt Car Presentable",
        detail: {
          heading: "Interior Valeting Around Cheshunt and Waltham Cross",
          body: [
            "A good deal of the driving here is commuting — a short run to the station, a day parked up, and the same again in reverse. A commuter car shows that inside, with grit tracked in off the tarmac, marks worn into the console, and a boot that carries everything from football kit to garden waste.",
            "Housing along the valley varies more than the traffic does. The older terraces near the station have no off-street parking at all, while the newer closes at Turnford and Wormley have marked bays that are tight to work in. Neither rules much out, because a valet can be sized to the car and to the space it is standing in, from a quick wash through to the full top-to-tail job.",
          ],
        },
        faq: {
          q: "What does a full valet take in that a wash does not?",
          a: ["A wash brings the outside back to clean and stops there. A full valet goes top to tail — mats and carpets, seats, glass and trim, and the paintwork with them. The vans are fitted with the equipment, materials and cleaning solutions for either one, so the choice is about how much the car needs rather than what can be brought to it."],
        },
      },
    },
  },
  clapham: {
    opening:
      "Clapham sits in South-West London around the Common, between Battersea, Brixton and Balham, on streets that are mostly Victorian terraces with permit parking.",
    why: "There is no driveway to speak of here, and that is the whole point of coming to you: the work is done at the kerb where the car is already parked, so a resident's permit bay becomes the valeting bay and nobody has to move anything.",
    areas: ["Clapham Common", "Clapham North", "Battersea", "Balham", "Brixton", "Stockwell", "Wandsworth Road"],
      services: {
        detailing: {
          heading: "Living With Kerbside Paint in Clapham",
          detail: {
            heading: "Where Clapham Bodywork Picks Up Its Marks",
            body: [
              "Almost every car here parks parallel, on a street with bays down both sides and not much daylight between bumpers. That is where the marks come from. A door edge on the car behind, a pedal or a pannier going past on Clapham Park Road, a wheelie bin dragged out to the kerb, the corner of a buggy on a school morning off Abbeville Road — none of it is dramatic, and all of it lands on the same flanks.",
              "Machine polishing is the part of a detail that deals with that. Fine scratches and the swirls a roller wash leaves behind sit in the top of the lacquer, and taking them down is what gives a panel depth again instead of a grey sheen — most obvious on the dark paint that fills the streets between the Old Town and Cedars Road. Sealing it afterwards means the next few months arrive on top of the finish rather than in it.",
            ],
          },
          faq: {
            q: "Can you work at the kerb on a narrow Clapham street?",
            a: ["Yes — a resident’s bay is where most of this work happens, whether that is off Clapham Manor Street, up by Clapham North or on the roads running down to Wandsworth Road. The van needs room to stand near the car and nothing else; water and power come with it. A basement bay under one of the newer blocks works too, as long as there is space to walk round the car."],
          },
        },
        valeting: {
          heading: "What the Common Leaves in Clapham Footwells",
          detail: {
            heading: "Working Inside a Car on a Clapham Street",
            body: [
              "The Common does not drain. From October the football pitches and the paths between the ponds turn to a grey clay that comes home on boots, on a dog, on a child’s kit bag, and goes straight into the back footwells. Add a buggy folded into the boot twice a day and the wet coats that come with it, and the inside of the car is doing more work than the outside ever does.",
              "A car that lives on a Victorian street has no garage behind it and usually no hallway worth spreading a boot liner out in, so the damp has nowhere to go and sits in the carpet until something takes it out. That is as much what a valet is for as the cleaning is, and it is done in the space the car already occupies, whichever street that turns out to be, with the water and the power arriving on the van.",
            ],
          },
          faq: {
            q: "Do you reach the streets between Clapham and Wandsworth Common?",
            a: ["Yes — the roads either side of Nightingale Lane are covered, along with Clapham Park, the Old Town, Abbeville Road and the streets running down towards Stockwell and Brixton. A car that spends its day at a workplace or in a car park can be seen there instead of at home, which suits anyone whose bay is taken by the time they get back."],
          },
        },
      wash: {
        heading: "Washing a Car That Lives Beside Clapham Common",
        detail: {
          heading: "What a Week of Clapham Streets Leaves Behind",
          body: [
            "The roads around the Common are lined with plane trees, and what comes off them is the sticky kind of dirt: sap through the warm months, leaf litter in autumn, and bird lime that will etch lacquer if it sits through a hot week. Traffic grit drifts in off the A3 and settles into the same film, and a car that stays on one street all week has nothing sheltering it from either.",
            "Many of the houses on these streets are divided into flats, so there is no outside tap to borrow and no socket that reaches the pavement. The van arrives with its own water and its own power and needs neither. That makes a short interval easy to keep, and a short interval is the difference between a wash and the full valet that sap and lime eventually make necessary.",
          ],
        },
        faq: {
          q: "Which parts of Clapham do you come out to?",
          a: ["We cover Clapham Common, Clapham North and the streets down to Wandsworth Road, along with Battersea, Balham, Brixton and Stockwell. If the car spends its day at a workplace or in a car park rather than outside the flat, we can come to it there instead."],
        },
      },
    },
  },
  croydon: {
    opening:
      "Croydon is the largest borough in South London, running from the town centre and its trams out to Purley, Coulsdon and the Surrey boundary.",
    why: "It is a borough of two halves — town-centre flats with allocated bays, and suburban roads with drives — and a mobile round suits both, because the only thing it needs is the space the car is already taking up.",
    areas: ["Purley", "Coulsdon", "Addiscombe", "Thornton Heath", "South Norwood", "Sanderstead", "Shirley", "Selsdon"],
      services: {
      detailing: {
        heading: "Detailing Without Taking the Car Out of Croydon",
        detail: {
          heading: "How Croydon Traffic Wears on a Car’s Finish",
          body: [
            "The A23 runs the length of the borough as Purley Way and climbs south through Purley towards Coulsdon, and a car driven on it daily carries the traffic film that comes with the route — tar spotted low along the doors, grit thrown up off the carriageway, and the salt that goes down on it through the winter. From a few feet away none of that reads as dirt. It reads as paint that has gone flat.",
            "Flat paint comes back with polishing rather than with another wash, and nothing about that requires the car to leave the street it is parked on. Between the trams and the one-way roads around the town centre, driving somewhere to be waited on becomes an errand of its own. The cleaning, the polishing and the protecting happen at the address instead.",
          ],
        },
        faq: {
          q: "Do you travel across the whole of Croydon?",
          a: ["Yes. From the town centre out to Purley, Coulsdon and Sanderstead, and across Thornton Heath, South Norwood, Addiscombe, Shirley and Selsdon. Everything the work needs arrives on the van — water, power and products — so nothing has to be laid on at the address."],
        },
      },
    },
  },
  "east-london": {
    opening:
      "East London covers the ground from Stratford and Hackney out through Newham, Barking and Ilford towards the Essex border, much of it rebuilt in the last twenty years.",
    why: "New-build blocks here come with underground bays and no hose, which rules out doing it yourself and makes the nearest hand wash a twenty-minute round trip. The van brings its own water and power, so the car stays in its bay.",
    areas: ["Stratford", "Hackney", "Bow", "Canary Wharf", "Barking", "Ilford", "Walthamstow", "Leyton"],
      services: {
        valeting: {
          heading: "Why East London Interiors Stay Damp",
          detail: {
            heading: "Where East London Cars Spend Their Week",
            body: [
              "An East London car is rarely carrying one person. It does the school run, the shop, the weekend game on Hackney Marshes and a run out to Wanstead Flats or Valentines Park, and every one of those puts something in the back: playground sand, wet kit, a spill from a bag of shopping off Walthamstow High Street. Short journeys never get warm enough to dry any of it out, so it stays.",
              "Parking under a block makes that worse rather than better. There is no sun on the glass and very little moving air, so a carpet that went in wet in November is still wet in January, and the smell arrives before the mould does. A valet takes the seats, carpets and boot back properly and draws the damp out of them, done in the bay, the gated courtyard or the kerbside space the car already has.",
            ],
          },
          faq: {
            q: "Can you get into an underground car park in East London?",
            a: ["Usually, yes — the thing to check is the height barrier rather than the space itself. Where one rules the van out, the car can be brought up to the entrance or left in a visitor bay for the morning instead, and gated courtyards at Stratford, Bow and Barking are arranged the same way, with whoever holds the fob. Nothing is drawn from the building: water and power travel with the van."],
          },
        },
      wash: {
        heading: "A Regular Clean Where East London Parks",
        detail: {
          heading: "Everyday Grime on an East London Street",
          body: [
            "Not everything on the paint comes off the road. The older residential streets have their street trees, and a lime over a parking bay drops honeydew all summer and leaf all autumn, with the birds sitting in it doing the rest. Building work adds its own share, a fine cement and brick dust that carries to anything parked within reach of a scaffold. None of it is difficult while it is fresh; baked on in the sun it dulls a finish and holds on.",
            "The standard wash is built for a car that is already looked after rather than one that has been left standing for months; past six weeks or so of that, a valeting package is the better fit. Whether the car is on a drive in Barking or a parking level at Canary Wharf makes no difference to what it needs, only to where the work is set up. The van comes to whichever it is.",
          ],
        },
        faq: {
          q: "Where does the East London coverage end?",
          a: ["At the Essex boundary. Barking and Ilford are the eastern end of it and Walthamstow and Leyton the northern, and everything between those and the City is inside it. A wash is booked to an address anywhere within that, and nothing has to be provided there — the van arrives with its own water and power."],
        },
      },
      detailing: {
        heading: "Detailing Without Moving the Car in East London",
        detail: {
          heading: "What East London Paintwork Is Up Against",
          body: [
            "Paintwork east of the City takes its punishment from traffic rather than weather. The A12, the A13 and the North Circular feed the whole area, and cars kept near them collect brake dust, tar spotting and a fine grit that takes the depth out of a colour. Damp coming off the Lea and the Thames keeps that film on the panels longer.",
            "The older half of the area was built before anyone kept a car, and the terraced streets through Leyton, Walthamstow and Bow still leave a resident a permit bay at the kerb and nothing else. Paint that has stood in that film for a season wants more than a rinse over it: cleaned, polished and then protected, it gives the next lot of road grit something to settle on other than the lacquer. The car is treated where it stands, so none of it costs a trip.",
          ],
        },
        faq: {
          q: "Can a full detail be done on an East London street?",
          a: ["Yes. The work is done at the address, and a kerbside bay or a level of a workplace car park is room enough for it. Coverage runs from Hackney and Bow eastward through Stratford and Canary Wharf to Barking and Ilford, with Walthamstow and Leyton to the north of that."],
        },
      },
    },
  },
  essex: {
    opening:
      "Essex runs north-east from the edge of London out to Chelmsford, Colchester and the coast, taking in Romford, Brentwood, Basildon and Harlow on the way.",
    why: "Between the estuary salt in the south and the field dust in the north, an Essex car collects a particular kind of grime, and it does it fastest on the vehicles that sit outside all week. Coming to the address is what makes it a weekday job rather than a weekend one.",
    areas: ["Chelmsford", "Brentwood", "Basildon", "Romford", "Harlow", "Colchester", "Southend-on-Sea", "Grays"],
      services: {
        valeting: {
          heading: "The Two Halves of an Essex Valet",
          detail: {
            heading: "Sand, Clay and Salt in an Essex Car",
            body: [
              "The weekend in this county goes one of two ways and both end up in the carpet. East is the water — the mudflats at Leigh, the sea wall at Maldon, the sand that comes off the beaches at Clacton and Frinton and finds every seam in a boot floor. West and north is the forest and the farmland, Epping and Hatfield Forest and the lanes north of Braintree, which are clay and field mud from October.",
              "Salt is the other half of it, and in the south of the county it gets in on shoes as much as it settles on paint. Dried into a carpet it holds moisture, which is why a car that lives near the water smells different by January. A valet goes at the carpets, the seats and the boot rather than over them, and it happens at the address — a drive at Brentwood, a yard behind a Harlow unit, a kerbside space in Grays.",
            ],
          },
          faq: {
            q: "Do you come out as far as the Essex coast?",
            a: ["Southend-on-Sea and the towns along the estuary are on the round, and Colchester marks the northern end of it. Between those and the London edge there is nothing much that is out of reach. The booking is made to an address rather than to a site, so a seafront flat with a permit bay is no more trouble than a drive inland, and the van brings its own water and power either way."],
          },
        },
        wash: {
          heading: "Essex Is Drier Than People Think",
          detail: {
            heading: "The Ordinary Week of an Essex Car",
            body: [
              "Essex is one of the driest counties in England, which sounds like good news for a car and is not. Long dry spells let dust settle and then leave it settled — off the verges, off the building sites, off the back of a tipper on a dual carriageway — and when rain does arrive it comes down through the whole lot of it. What reaches the paint is dirty water, and it dries where it lands, in rings across the bonnet and streaks down the doors.",
              "A wash is not a rescue, it is a rhythm: every few weeks, before the film has had time to bond, with the wheels and the glass treated as part of the job rather than as an afterthought. Because the round is county-wide, which end of it the car sits at makes very little difference. A drive in Billericay, a yard behind a shop in Colchester, a kerbside space in Romford and a staff car park in Harlow all come to the same work, set up around the car where it stands.",
            ],
          },
          faq: {
            q: "Do you wash cars at the kerb on a village street?",
            a: ["Yes. A good deal of Essex outside the towns has no off-street parking at all — the old high streets at Ingatestone, Writtle and Great Dunmow among them — and a car at the kerb is cleaned where it stands. It is not moved for it, nothing is run out of the house, and the only real requirement is enough room to get around it safely."],
          },
        },
      detailing: {
        heading: "Why Essex Paintwork Needs More Than a Wash",
        detail: {
          heading: "Detailing Across Essex, From Romford to the Coast",
          body: [
            "Mileage is what marks an Essex car. The A12 and the A127 carry commuters into London and back each day, the M11 and the M25 take the rest, and a car that spends its week at speed collects road film down the lower panels and a scatter of hard flecks on the bonnet and mirrors that a sponge will not lift. Away from the trunk roads it changes character: dust off the fields in summer, mud pulled onto the lanes in autumn, and bird lime under the hedgerow trees.",
            "Much of the county parks on its own ground — drives outside interwar semis, estate roads on the newer developments, a yard beside a workshop — and that is the sort of space the work wants, since what it amounts to is the whole of the bodywork cleaned, polished and protected rather than rinsed over. Where there is only a town-centre bay, as in Romford or Basildon, the car stays put and the job is set up around it.",
          ],
        },
        faq: {
          q: "Which parts of Essex do you travel to?",
          a: ["Coverage takes in Romford, Brentwood, Grays and Basildon at the London end, Chelmsford and Harlow in the middle of the county, and reaches Colchester and Southend-on-Sea. Because the service is mobile, the booking is to an address rather than a fixed site, so wherever the car sits for the day is where the work happens."],
        },
      },
    },
  },
  gravesend: {
    opening:
      "Gravesend sits on the Kent bank of the Thames estuary, east of Dartford, with Northfleet beside it and the A2 and M2 running behind.",
    why: "It is an estuary town, and estuary air is salt air: it finds its way into door shuts, wheel arches and every seam that has already lost its protection. That is worth treating where the car lives, and worth protecting afterwards.",
    areas: ["Northfleet", "Dartford", "Swanscombe", "Higham", "Meopham", "Istead Rise", "Ebbsfleet"],
      services: {
        valeting: {
          heading: "Chalk, Marsh Mud and Gravesend Carpets",
          detail: {
            heading: "River Fog on Gravesend Glass",
            body: [
              "The ground either side of the town leaves two different marks. Up on the downs behind it, round Meopham and Istead Rise, the soil is chalk and flint, pale and fine, and it shows on a dark carpet the moment it dries. Down at river level it is the opposite: grey marsh mud off the paths out past Higham, heavy, slow to dry and reluctant to brush out once it has been trodden into a footwell.",
              "Estuary air does the rest. A car parked within sight of the water sits in river fog on a still morning and takes the moisture in with it, and salt that has been walked in holds onto that damp instead of letting it go. By February the glass mists from the inside and the carpet under the mats is still cold and wet. A valet works that out of the seats, carpets and boot at the address, with the van supplying its own water and power.",
            ],
          },
          faq: {
            q: "Can the work be done in a Gravesend block’s car park?",
            a: ["Yes. A marked space in a riverside block is room enough for it, and a drive up at Meopham or Istead Rise is no different. Swanscombe, Northfleet and Ebbsfleet are all on the round, as is the older housing behind the promenade. Nothing is needed from the building itself — the van carries its own water and power, so no tap or socket comes into it."],
          },
        },
        wash: {
          heading: "Gravesend Cars and the Ground Around Them",
          detail: {
            heading: "Between the Chalk Pits and the River at Gravesend",
            body: [
              "Two things fall on a car here that would not fall on one inland. The first comes off the water: gulls work the whole length of the riverside, and what they leave behind will mark a clear coat if it bakes on through a warm week. The second is chalk. The old pits and made ground at Swanscombe, Northfleet and Ebbsfleet put a pale dust into the wind every time it is dry, and it shows worst of all on a dark car.",
              "Neither waits for a convenient moment, which is the argument for a short interval rather than one big clean twice a year. A wash takes the film off the panels and the glass, the dust out of the shuts and the brake dust off the wheels. It is done wherever the car is standing: a drive at Istead Rise, a lane outside a house at Higham, a bay at Meopham, a space at a workplace out along the A2. The house is not involved at any point.",
            ],
          },
          faq: {
            q: "Can you wash a car in a communal car park at a riverside block?",
            a: ["Usually. A marked bay in a shared car park is an ordinary enough place to do it, provided whoever manages the parking has no objection and the space is not boxed in on three sides. Nothing is taken from the building — water and power come in the van — so the car stays put and the block itself is left out of the arrangement entirely."],
          },
        },
      detailing: {
        heading: "Estuary Salt and the Paint on Gravesend Cars",
        detail: {
          heading: "Detailing at the Address in Gravesend",
          body: [
            "Cars here do motorway miles and town miles both. A daily run down the A2, or out to Ebbsfleet International and back, leaves stone chips across the bonnet and a stubborn band of road tar behind each wheel. Stop-start driving through the town adds a layer of brake dust to the wheels and arches, and dirt of that sort does not rinse off. It has to be lifted.",
            "The work is arranged around whatever the address offers, and in Gravesend that is rarely twice the same: terraced streets near the centre, flats along the riverside, drives on the estates set back from the water. Water and power come with the van, so the bodywork is cleaned and protected in the space the car already occupies, rather than being taken somewhere else to have it done.",
          ],
        },
        faq: {
          q: "Do you come out to the villages, or just into Gravesend itself?",
          a: ["Both. The villages around the town — Meopham, Istead Rise and Higham among them — are covered the same as a street in the centre, and so is the built-up run west through Northfleet towards Dartford. Wherever the car happens to be parked is where the work is done, so there is nothing to drop off and nothing to collect."],
        },
      },
    },
  },
  guildford: {
    opening:
      "Guildford sits in the Surrey hills on the A3, about half an hour south-west of the M25, with the Hog's Back to the west and a great deal of woodland around it.",
    why: "Lanes under trees are lovely to drive and hard on paint — sap in summer, leaf mould in autumn, and grit thrown up from unmade edges all year. Dealing with it at the house, before it has set, is the difference between a clean and a correction.",
    areas: ["Godalming", "Woking", "Cranleigh", "Merrow", "Burpham", "Shalford", "Ripley", "Farnham"],
      services: {
        wash: {
          heading: "Two Kinds of Mud on a Guildford Car",
          detail: {
            heading: "The Round Through Guildford and the Villages",
            body: [
              "The ground changes within a few miles here, and so does what ends up on the car. North and west of the town the road edges are chalk, and a wet week puts a pale slurry up the sills that dries almost white. South towards Shalford and Godalming it turns to sand, finer and browner and far more inclined to work its way into the wheels. Further out on the clay towards Cranleigh it is heavier again, and a car that does all three in a week carries all three.",
              "A wash is the maintenance version of that, kept frequent enough that the sills, arches and wheels never reach the point of wanting something stronger, and with the glass done at the same time — on an unlit lane in winter, dirty glass is the part anybody actually notices. It is set up wherever the car stands: a drive at Onslow Village or Jacobs Well, the verge outside a house at Ripley, a park-and-ride bay on the edge of town, a workplace space off the A3.",
            ],
          },
          faq: {
            q: "Can you get to a car parked down a narrow lane?",
            a: ["Usually, yes. A fair amount of the ground around Cranleigh, Ripley and the villages under the Downs is single track with passing places, so it comes up often enough. What matters is room to stand beside the car and get right around it. Where a lane is genuinely too tight for that, it is worth saying so when booking, so the work can be arranged wherever the car spends its working day instead."],
          },
        },
      valeting: {
        heading: "A Valet That Comes to You in Guildford",
        detail: {
          heading: "Cleaning the Inside of a Guildford Car",
          body: [
            "Interiors take the brunt of country driving. Wet boots and a dog blanket after a walk on the Downs, sand and crumbs worked into the seams of the back seats over a summer of trips, and the damp that comes off coats left in the car all winter. Once that has been trodden into carpet and fabric, a vacuum on its own stops making much difference.",
            "A valet is usually wanted for a reason — a car going up for sale, a lease ending, or an interior that has simply stopped being pleasant to sit in. It is done wherever the car spends its day: a drive in Shalford or Ripley, a workplace car park off the A3, or a bay near the station while the owner is on the train to London.",
          ],
        },
        faq: {
          q: "Is there a choice between a quick clean and a full valet?",
          a: ["Yes. It runs from a straightforward wash through to a complete top-to-tail valet, and the van arrives equipped for either. What a car actually wants usually comes down to how long it has been since the last clean and how much of the outdoors has come inside with it."],
        },
      },
      detailing: {
        heading: "Guildford’s Lanes Are Hard on Paintwork",
        detail: {
          heading: "Correction Work on a Guildford Driveway",
          body: [
            "A good deal of the mileage here is dual-carriageway mileage — the A3 north towards the M25, or the run over the Hog’s Back to Farnham. Fast roads lay a grey film across the nose and the glass, and paint that never gets more than a rinse holds onto it. Add a week of standing outdoors and there is bird lime and hard water marking on top of that.",
            "Addresses around Merrow, Burpham and Godalming tend to come with a drive or a gravel turning space, and that is where the work happens — outdoors, in daylight, which is when flat or swirled paint actually shows itself. The van is self-contained, water and power included, so the house is left out of it entirely and the car never goes anywhere.",
          ],
        },
        faq: {
          q: "What if the car is parked on the street rather than on a drive?",
          a: ["It is worked on where it stands. A good many of the older streets near the town centre have nothing but permit bays, and the car is cleaned, polished and protected in the one it is already sitting in. Where a flat comes with a numbered space or a bay under the building, that does the job just as well."],
        },
      },
    },
  },
  harlow: {
    opening:
      "Harlow is an Essex new town beside the M11, north of Epping, laid out in neighbourhoods with their own parking courts and green wedges between them.",
    why: "Those courts are shared, unmetered and nowhere near a tap, which is exactly the situation a mobile service is for. The van arrives self-contained, works in the bay the car already occupies, and leaves nothing behind.",
    areas: ["Old Harlow", "Church Langley", "Potter Street", "Sawbridgeworth", "Epping", "Roydon", "Nazeing"],
      services: {
        valeting: {
          heading: "The Inside of a Harlow Car in Winter",
          detail: {
            heading: "Stort Towpath Mud in a Harlow Footwell",
            body: [
              "The Stort runs along the top of the town, and the towpath beside it at Harlow Mill is soft ground from October through to April. Parndon Wood is wetter again, and the tracks that link one part of Harlow to the next are grass and clay wherever they leave the tarmac. All of that walks back to the car rather than being driven through, so it ends up in the footwells and across the back seat.",
              "That is a different job from cleaning the outside. Ground-in clay has to come up out of the pile, and the damp underneath it has to come out with it, or the car smells of that through every cold morning until spring. The work is set up around whatever the address has — a space outside a house at Church Langley, a drive at Old Harlow, a bay at Harlow Town station while the train does the commuting — and the van brings the water and the power with it.",
            ],
          },
          faq: {
            q: "Do you valet in Sawbridgeworth and the villages west of Harlow?",
            a: ["Yes. Sawbridgeworth up the Stort, Roydon and Nazeing over in the Lea valley and Epping to the south are all on the round, along with Old Harlow, Church Langley and Potter Street in the town itself. A narrow village lane is workable as long as the van can stand near the car, and nothing is drawn from the house — water and power arrive with it."],
          },
        },
        wash: {
          heading: "The Week’s Dirt on a Harlow Car",
          detail: {
            heading: "A Harlow Car Between Washes",
            body: [
              "Harlow drives on its avenues, and they run roundabout to roundabout — Second Avenue, Fifth Avenue, Southern Way, Edinburgh Way out past Templefields. Brakes work harder on that pattern than they do on an open road, and what they shed is a fine dark dust that settles on wheel faces, in the shuts and along the lower doors. Add the lorry traffic in and out of the Pinnacles and there is a greasy film over anything parked nearby by the end of a dry week.",
              "The north of the town sits down on the Stort, and from autumn on a car parked along there is still wet at nine in the morning. Dirt that lands on wet paint keys into it rather than sitting on top, and winter salt goes over that. None of it is hard to shift while it is fresh, which is the argument for a short interval rather than one heroic clean a year. Past six weeks or so of standing, a valeting package is the more sensible starting point.",
            ],
          },
          faq: {
            q: "Do you come out to Sawbridgeworth, Roydon and Nazeing?",
            a: ["Yes. Sawbridgeworth sits just up the Stort from Old Harlow, Roydon and Nazeing lie west of the town, and Epping is a short run south, so all of them fall inside the same round as the town itself. A village address on a narrow lane is no harder than a bay in Church Langley: the van carries its own water and power and needs nothing from the house."],
          },
        },
      detailing: {
        heading: "Detailing a Car That Lives Outdoors in Harlow",
        detail: {
          heading: "What Tar, Sap and Lime Leave on a Bonnet",
          body: [
            "Very little parking here is under cover. The M11 runs along the eastern edge of the town and the A414 cuts across it, so a front end collects tar and fly all summer, and the grit thrown up in winter dulls a bonnet from the leading edge back. A good deal of that parking sits under mature trees as well, which puts sap, leaf fall and bird lime on paint that never gets a break from it.",
            "A rinse will not shift baked-on tar or dried sap. Both have to come off the surface before anything else is worth doing, and the paint underneath is worth protecting once they have — which is the difference between a car that looks clean for a week and one that holds its colour through a season.",
          ],
        },
        faq: {
          q: "Do you detail cars right across Harlow?",
          a: ["Yes — Old Harlow, Church Langley and Potter Street, along with Sawbridgeworth, Roydon, Nazeing and Epping just outside the town. A shared estate court is as workable as a private driveway, and the same goes for a bay at work."],
        },
      },
    },
  },
  "hemel-hempstead": {
    opening:
      "Hemel Hempstead sits in west Hertfordshire at junction 8 of the M1, a new town of wide roads and roundabouts with Boxmoor, Adeyfield and Leverstock Green around it.",
    why: "A lot of what is parked here does motorway miles daily, and motorway miles are the ones that bake tar and fly onto a front end. It is easier to have that lifted on the drive than to add another trip to the week.",
    areas: ["Boxmoor", "Adeyfield", "Leverstock Green", "Bovingdon", "Berkhamsted", "Kings Langley", "Apsley"],
      services: {
        wash: {
          heading: "Brake Dust on the Hemel Hempstead Roundabouts",
          detail: {
            heading: "Salt, Spray and Hemel Hempstead Hills",
            body: [
              "The town is built around roundabouts, and the Plough at the bottom of the valley is six of them in a row. Nothing about that is fast driving; it is braking, moving a car length, braking again, and brakes shed dust the whole time. It lands on the wheel faces first and then on the sills and the lower quarter of every door, where it sits as a dark film that a hose passes straight over.",
              "Above it the town climbs. Warners End, Gadebridge, Chaulden, Highfield and Woodhall Farm all sit up on the slopes, and those roads are gritted early and often through the winter. Salt spray goes up the flanks of a car on a wet January evening and dries there overnight, and the next night puts more on top. Kept to a regular interval, none of that has time to build; left until spring, it is a different job altogether.",
            ],
          },
          faq: {
            q: "Can you wash a car at the kerb if there is no drive?",
            a: ["Yes. A good deal of the housing near the centre and out through Bennetts End and Grovehill parks on the street rather than on a drive, and a kerbside space is worked the same way a driveway is: the van pulls in beside the car, and the water, the power and the rest come off it. A steep drive on one of the hill roads is fine too, as long as the car can be reached on both sides."],
          },
        },
      valeting: {
        heading: "Keeping a Hemel Hempstead Car Clean Inside and Out",
        detail: {
          heading: "Cleaning a Cabin Where the Car Is Kept",
          body: [
            "An interior collects the place it is driven around. Daily runs between Adeyfield, Leverstock Green and the centre bring in dust and grit off open car parks, footwells pick up mud from the common at Boxmoor and the fields towards Bovingdon, and a few winters of wet coats and shopping leave a cabin that no longer smells the way it did.",
            "The cabin is the part of the car its owner actually sits in, and it is the part an exterior wash does not touch. Cleaning it means the car standing still with its doors open, which is easier on a drive in Adeyfield or a quiet bay in Apsley than anywhere that has to be driven to and queued for. The van brings the equipment, materials and cleaning solutions with it.",
          ],
        },
        faq: {
          q: "Can you valet a car at a flat or a workplace in Hemel Hempstead?",
          a: ["Yes. Flats with a bay outside, blocks with an underground space, drives in Boxmoor or Leverstock Green and workplace car parks are all fine. Nothing at the address is used — no outside tap, no socket — so a flat is no harder to work at than a house with a driveway."],
        },
      },
      detailing: {
        heading: "Damp Ground, Open Bays and Dulling Paint",
        detail: {
          heading: "Detailing on a Hemel Hempstead Drive",
          body: [
            "Boxmoor and Apsley sit low along the Gade and the Grand Union, where a car left out overnight picks up a damp film and the green cast that comes with it. Higher up in Adeyfield and Leverstock Green the bays are open on every side, so it is the bonnet, roof and boot that dull first while the doors still look fine.",
            "Dull paint comes back with polishing rather than with more washing, and protecting it afterwards is what keeps the next winter off the lacquer. It is done at the address rather than at a unit somewhere: a drive in Bovingdon or Kings Langley, an underground bay beneath a block near the centre, or a marked bay at a workplace.",
          ],
        },
        faq: {
          q: "Which areas around Hemel Hempstead do you cover?",
          a: ["Boxmoor, Adeyfield, Leverstock Green and Apsley are all covered, along with Bovingdon, Kings Langley and Berkhamsted. Paintwork is polished and protected at whichever address the car is kept, so it never has to be dropped off anywhere and collected later."],
        },
      },
    },
  },
  hertfordshire: {
    opening:
      "Hertfordshire sits immediately north of London, taking in Watford, St Albans, Hemel Hempstead and Hertford, with the M1, M25 and A1(M) all crossing it.",
    why: "It is commuter country, and a commuter car has a hard life: motorway grime through the week, a station car park through the day, and no time at the weekend to deal with either. Bringing the work to the address is what puts it back in the week.",
    areas: ["Watford", "St Albans", "Hemel Hempstead", "Hertford", "Rickmansworth", "Borehamwood", "Stevenage", "Cheshunt"],
      services: {
      detailing: {
        heading: "Paint Care for a Car That Commutes",
        detail: {
          heading: "What Hertfordshire Roads Leave on Paint",
          body: [
            "A car that joins the M1 at Hemel Hempstead or the A1(M) past Stevenage every morning collects the sort of dirt a rinse will not shift: tar flicked up onto the sills, fly baked across the nose and the mirrors, and winter salt working into the lower doors and arches. Leave the same car standing under trees all day and sap and bird lime go on top of that, and both etch into lacquer if they sit through a warm afternoon.",
            "That is not a job for another quick rinse. The car is worked on wherever it happens to be standing, which for most people in Rickmansworth or Borehamwood means the drive at home, and for the rest means the car park they leave it in all day. The van brings its own water and power with it.",
          ],
        },
        faq: {
          q: "Which Hertfordshire towns do you come to?",
          a: ["Watford, St Albans, Hemel Hempstead and Hertford are the regular ones, along with Rickmansworth, Borehamwood, Stevenage and Cheshunt. It makes little difference which: the van comes to the car rather than the other way round."],
        },
      },
    },
  },
  "high-wycombe": {
    opening:
      "High Wycombe sits in a Chiltern valley in Buckinghamshire, on the M40 between London and Oxford, with Marlow, Beaconsfield and Hazlemere around it.",
    why: "The hills either side mean steep, wooded approaches and a lot of chalk dust and leaf debris on the roads, which settles into the places a quick rinse never reaches. Working at your address means there is time to get into them properly.",
    areas: ["Marlow", "Beaconsfield", "Hazlemere", "Bourne End", "Flackwell Heath", "Downley", "Loudwater"],
      services: {
        valeting: {
          heading: "Damp Gets Into a High Wycombe Car",
          detail: {
            heading: "Valeting on a High Wycombe Hillside",
            body: [
              "The town sits low between two ridges, and a car kept on the valley floor — the terraces off Desborough Road, the streets down by the Rye — sees very little winter sun. What that does is slow: a carpet that went in wet in November is still cold in January, a dog blanket off Downley Common never quite dries, and the smell that follows is in the fabric rather than in the air. Wiping the glass treats the symptom.",
              "The hills do the rest. The climbs up to Totteridge, Terriers and Sands are steep enough that anything loose in a car finds the front of the footwell, and the grit and flint walked off the paths above Hughenden gets pressed down into the pile from there. Drawing that out, and drying what is underneath it, is slower work than a panel and easier done where the car lives — a drive at Hazlemere, a hillside kerb closer in, or a bay at Cressex where the car spends the day.",
            ],
          },
          faq: {
            q: "Can you valet a car parked on a hill or a narrow street?",
            a: ["Yes. A good deal of High Wycombe is built on a slope, and the older terraced streets on the valley floor park nose to tail at the kerb. What matters is a door’s width beside the car and somewhere level enough to stand, which most spaces give. Drives at Downley, Hazlemere or Flackwell Heath are simpler again, though nothing about the work needs one — water and power come in on the van."],
          },
        },
      wash: {
        heading: "A Regular Wash for High Wycombe Drivers",
        detail: {
          heading: "Regular Washing, Not Catching Up",
          body: [
            "The M40 runs along the top of the valley, and a car that uses it daily carries a grey film of traffic dirt that flattens the paint before anything visible has landed on it. The drop back down into the town works the brakes, and the dust off them bakes onto the wheels. Neither shows much day to day, which is how a car gets away from its owner.",
            "The standard wash is for a car that is already kept up rather than one being rescued: if it has gone longer than six weeks or so, a valeting package is the better answer. Booked regularly, it never gets that far. Drivers in Marlow, Beaconsfield, Bourne End and Flackwell Heath have it done where the car already sits, so it is cleaned in place rather than driven out to be cleaned.",
          ],
        },
        faq: {
          q: "Do you wash cars in the villages outside High Wycombe?",
          a: ["Yes. Marlow, Beaconsfield, Bourne End and Flackwell Heath are all covered, as are Hazlemere, Downley and Loudwater closer in. A car kept on a village drive is treated no differently to one on a street in the town."],
        },
      },
      detailing: {
        heading: "Detailing Without Leaving High Wycombe",
        detail: {
          heading: "The Work Comes to the Car",
          body: [
            "Nothing about detailing needs a unit. The paint is cleaned down, polished and then protected wherever the car happens to be kept — a hillside drive in Downley or Hazlemere, a permit bay on the older streets nearer the centre, or a space at work in Loudwater.",
            "That matters here because of what the roads put on the car in the first place. They climb through beech woods on both sides of the valley, so there is chalk dust on the paint in dry weather and wet leaf mulch through the autumn, and sap comes down onto roofs and bonnets under the same trees and hardens where it lands. Washing alone will not lift it once it has.",
          ],
        },
        faq: {
          q: "Can the car be detailed at my workplace?",
          a: ["Yes. An office car park or a bay at a business park does the job as well as a drive at home, and for a car that stands still all day at work it is usually the easier of the two. All that changes is the address on the booking."],
        },
      },
    },
  },
  hornchurch: {
    opening:
      "Hornchurch sits in Havering, on the eastern edge of London where it meets Essex, with Upminster, Elm Park and Romford around it.",
    why: "It is a suburb of long front gardens and driveways, so there is usually space beside the car to work properly. That is all a mobile round needs — the van brings everything else with it.",
    areas: ["Upminster", "Elm Park", "Romford", "Rainham", "Emerson Park", "Cranham", "Gidea Park"],
      services: {
        detailing: {
          heading: "Hornchurch Paint, Taken Back to Gloss",
          detail: {
            heading: "Sun and Mud on Hornchurch Cars",
            body: [
              "Emerson Park and the roads out towards Cranham are built wide and open, with the cars sitting on the drive rather than under anything. That is easier on a car in most ways, but it means the flat panels — the bonnet, the roof, the boot lid — take the full summer on them. Red and dark blue go first. What starts as a slight loss of gloss ends up as a bonnet that no longer matches the doors.",
              "The other half of it comes off the lanes. Hacton Lane, and the narrow roads running east beyond Upminster into open farmland, throw up Essex clay after rain, and a hedge that has grown out over a single-track lane will leave a run of fine marks down a flank without the driver feeling a thing. A detail deals with both ends of that — the paint decontaminated and machine polished, then protected, so the next season sits on the sealant rather than on the colour.",
            ],
          },
          faq: {
            q: "Do you detail cars at Emerson Park, Cranham and Upminster too?",
            a: ["Those are all covered, along with Elm Park, Ardleigh Green and Gidea Park. Most addresses out that way have a drive with space to walk round the car, which is what a machine polish wants. Where there is no drive — a maisonette on Station Lane, a flat off the High Street — a space on the street or one at the office works just as well."],
          },
        },
        valeting: {
          heading: "Inside a Hornchurch Family Car",
          detail: {
            heading: "Taking a Hornchurch Interior Apart",
            body: [
              "A good many cars here spend their week on short local runs — the primary school, the pitches at Harrow Lodge Park, the swimming lesson, the shop — and every one of those journeys puts something in the back. Sand out of a football boot, half a packet of crisps trodden into the seat base, a drink that went over somewhere between Ardleigh Green and Cranham. None of it is noticed on the day it happens.",
              "It is noticed in July, when the car has stood in the sun all afternoon and the doors are opened. By then it is in the weave of the seat rather than on it, along with whatever has gone down the sides of the cushions and under the rails. A valet takes the interior apart in the ordinary sense — mats out, seats moved, the boot floor lifted — and that is as easily done on a side street near Elm Park station as on a drive at Emerson Park.",
            ],
          },
          faq: {
            q: "Which areas around Hornchurch do you cover for valeting?",
            a: ["Upminster and Cranham to the east, Elm Park and Rainham down towards the river, and Emerson Park, Gidea Park and Romford to the north are all on the round, along with Hornchurch itself. Water and power travel with the van, so the address can be a house, a workplace or a marked space at a block of flats without anything being needed from the building."],
          },
        },
      wash: {
        heading: "Keeping a Hornchurch Car Clean Between Valets",
        detail: {
          heading: "A Wash on the Drive in Hornchurch",
          body: [
            "The A127 runs along the top of the district and the A13 passes below it through Rainham, so there is more road film on cars here than a suburb of front gardens would suggest. Mornings off the Ingrebourne valley leave a damp grey bloom on the paint, the older avenues drop sap and leaf litter on whatever is parked under them, and a fortnight is enough for a clean car to stop looking like one.",
            "Most houses here have a drive or a wide front garden, which is all the room a wash needs. The van parks up beside the car and carries its own water and power, so no hose runs through a window and no lead crosses a pavement. Where a flat or a maisonette leaves no drive, a kerbside bay or a space at the workplace does the same job, and the car is never driven anywhere for it.",
          ],
        },
        faq: {
          q: "Is the standard wash enough for a car that lives outside?",
          a: ["It is meant for a car that is looked after already and wants bringing back to a proper shine. Once one has gone more than six weeks or so without a clean — a winter of grit off the A127, a summer parked under the avenue trees — one of the valeting packages is the better place to start."],
        },
      },
    },
  },
  hounslow: {
    opening:
      "Hounslow sits in West London under the Heathrow approach, running from Chiswick and Brentford out through Isleworth to Feltham.",
    why: "Living under a flight path has a cost the brochures do not mention: a fine, gritty film that settles on everything parked outside and does not rinse off cleanly. It wants lifting properly, and it wants doing where the car is.",
    areas: ["Chiswick", "Brentford", "Isleworth", "Feltham", "Osterley", "Heston", "Cranford", "Bedfont"],
      services: {
      detailing: {
        heading: "What Paintwork in Hounslow Is Up Against",
        detail: {
          heading: "Detailing Without Leaving Hounslow",
          body: [
            "Cars here do motorway miles whether their owners plan them or not. The M4, the A30 and the A316 all cut through the borough, and that mileage shows as tar spotting along the sills and a gritty feel to the lacquer. Stop-start traffic on the A4 leaves brake dust in the wheels and along the lower panels, and paint carrying all of that loses its depth long before it loses its colour.",
            "Detailing is a slower job than a wash, and a different one: the bodywork is cleaned, polished and protected from top to bottom rather than rinsed and dried. It is not a repair service, though some light restoration work can come into it. What it asks for is time and somewhere for the car to stand — a drive at home, a workplace car park, a bay beneath a block of flats — and most addresses across the borough already have one of those.",
          ],
        },
        faq: {
          q: "Is detailing a repair service?",
          a: ["No. It is a way to enhance the paintwork and the look of the car, and light restoration work can be part of that, but it is not bodywork repair. On a car carrying tar from the M4 and the fine grit that comes with parking under the approach path, what changes is the paint’s depth and finish rather than its shape."],
        },
      },
    },
  },
  ilford: {
    opening:
      "Ilford sits in Redbridge in East London, on the A12 between Stratford and Romford, with Barkingside, Seven Kings and Gants Hill around it.",
    why: "Much of the parking here is on-street and permit-controlled, and the nearest hand wash usually means a queue. A mobile round skips both: the work happens in the space the car is already in, at a time that was going to be free anyway.",
    areas: ["Barkingside", "Seven Kings", "Gants Hill", "Goodmayes", "Woodford", "Wanstead", "Chadwell Heath"],
      services: {
      detailing: {
        heading: "Detailing for a Car Kept in Ilford",
        detail: {
          heading: "What the A12 Does to Ilford Paintwork",
          body: [
            "Paint on a car kept here spends its life close to traffic. The A12 throws grit and tar along the lower panels, the High Road and Cranbrook Road add brake dust from stop-start queues, and anything parked under a tree takes sap, and bird lime from whatever is sitting in it — both of which will mark a clear coat if they are left on. Years of quick washes add the fine swirls that only show up in low sun.",
            "None of that is damage so much as accumulation, and it comes off in stages: a wash first, then decontamination to draw the bonded grit out of the paint, then polishing to take the swirls back, then a sealant so that the next few months of Redbridge traffic land on something other than bare lacquer. That is hours of work rather than minutes, so it is booked to an address rather than to a unit, with everything it runs on, water and power included, arriving on the van.",
          ],
        },
        faq: {
          q: "Is a driveway needed, or can the car be done at the kerb?",
          a: ["A driveway is not needed. A permit bay or a kerbside space outside the house gives room enough to work in, and so does a workplace car park or a bay under a block of flats. What matters is access around the car rather than the kind of space it happens to be parked in."],
        },
      },
    },
  },
  kent: {
    opening:
      "Kent runs south-east from the edge of London out through Bromley's border towns to Maidstone, Sevenoaks and the coast, with the M20 and M2 crossing it.",
    why: "Between the estuary in the north and the open country in the south, a Kent car meets salt, chalk and farm mud in the same week. None of that is difficult to deal with — it is only difficult to find the time, which is what coming to you solves.",
    areas: ["Sevenoaks", "Maidstone", "Dartford", "Gravesend", "Tonbridge", "Orpington", "Swanley", "Bexley"],
      services: {
        detailing: {
          heading: "Paintwork Across a County the Size of Kent",
          detail: {
            heading: "The Front End of a Kent Car",
            body: [
              "Kent motoring is long-distance motoring in a way that London motoring is not. A run down the A21 towards Tunbridge Wells or along the A2 to the coast puts an hour of open road on the front of the car, and open road at speed is what bakes tar, fly and road grime onto a bumper and a bonnet until none of it will rinse away. The nose of a Kent car is almost always the worst panel on it.",
              "Then there are the lanes, which is the other half of the county. A single-track road in the Weald with the hedge grown out over it will draw a line of fine scratches down a wing at walking pace, and a car left near the water at Whitstable or Herne Bay collects gull mess that will etch a warm panel inside a day. A detail takes the bonded contamination off first, machine polishes what is left, and seals the paint so the next long run has something to land on.",
            ],
          },
          faq: {
            q: "Do you come out as far as Maidstone and the villages around it?",
            a: ["Maidstone is covered, along with Sevenoaks, Tonbridge, Dartford, Gravesend, Swanley and Orpington, and the villages between them are no different. The one thing worth checking out in the county is not distance but the room to work: the van needs somewhere level to park beside the car, which a verge on a steep lane will not always give. A yard, a drive or a farm track that widens is fine."],
          },
        },
        wash: {
          heading: "The Case for a Regular Kent Wash",
          detail: {
            heading: "What Port Traffic Leaves on a Kent Car",
            body: [
              "Kent’s trunk roads are freight roads first. The A2 and the M20 carry everything moving to and from the ports, and a road with that many lorries on it throws up a heavy, oily film that settles on anything travelling in it — worst across the front, the mirrors and the first third of the bonnet. The queue for the Dartford crossing adds the other kind: standing traffic, constant braking, and dust off the pads onto the wheels.",
              "North of the A2 the county runs down to the estuary, and a car kept along the Gravesend and Dartford shore stands in damp air for most of the winter. Gulls work well inland from the water, and what they leave will mark lacquer if it sits through a hot week. None of it is difficult while it is fresh, and that is what a regular wash is for; the same dirt left to harden is a longer job with a different name.",
            ],
          },
          faq: {
            q: "How far into Kent do you come for a wash?",
            a: ["From the London edge outwards — Bexley, Orpington and Swanley, then Dartford and Gravesend on the estuary side, and south to Sevenoaks, Tonbridge and Maidstone. Addresses out on the lanes between those towns are covered on the same basis as a street in Dartford, and the work is set up beside the car wherever that address turns out to be."],
          },
        },
      valeting: {
        heading: "Valeting Booked to a Kent Address",
        detail: {
          heading: "What Commuting Does to a Kent Interior",
          body: [
            "A lot of Kent motoring is commuting motoring. Cars sit all day at station car parks in Sevenoaks, Tonbridge and Maidstone, then do the lanes at each end, and the inside shows it: grit ground into the driver’s mat, dog hair through the boot after the North Downs, and a fine grey film on the dash from months of heater use.",
            "Putting that right takes hours rather than minutes. Mats and carpets are taken through properly rather than passed over, the boot lining is dealt with separately, and the dash, vents and the inside of the glass are left until last so that nothing settles back onto them. It is work that asks only for the car to be standing somewhere for a while, which in a county this spread out is the difference between a valet happening and a valet being put off again.",
          ],
        },
        faq: {
          q: "Does the address need an outside tap or a power socket?",
          a: ["No. The van carries its own water and power, so a drive at home or a space at work is all the address has to provide. Kent addresses vary a great deal — a terrace in Dartford and a house on a lane outside Maidstone have very little in common — and neither has to supply anything for the job."],
        },
      },
    },
  },
  kingston: {
    opening:
      "Kingston upon Thames sits on the river in South-West London, with Surbiton, New Malden and Norbiton around it and Richmond Park on its doorstep.",
    why: "River air and park trees between them keep a car damp and dirty for most of the year, and damp dirt is the kind that marks paint if it sits. Dealing with it at the address, regularly, is what keeps it from becoming a bigger job.",
    areas: ["Surbiton", "New Malden", "Norbiton", "Chessington", "Hampton Wick", "Berrylands", "Coombe", "Tolworth"],
      services: {
      detailing: {
        heading: "Why Paint Stays Dirty Longer in Kingston",
        detail: {
          heading: "Paint Condition on the Streets Around Kingston",
          body: [
            "The A3 runs along the eastern side of the borough, through New Malden, Tolworth and Hook, and a car that joins it every day comes back with tar along the sills and brake dust welded to the wheels. Nearer the river the air stays damp for weeks at a time, so that grime sits wet on the paint rather than drying and blowing off.",
            "Damp is also the argument for protection: a sealed panel sheds a wet morning rather than holding on to it, and marks that would etch into bare lacquer lift off the surface instead. None of that work calls for a trip anywhere — a driveway in Coombe and a permit bay off a terrace near the station both leave space enough to work around the car, and the van brings its own water and power with it.",
          ],
        },
        faq: {
          q: "Which parts of Kingston do you come out to?",
          a: ["The town itself and the districts around it, Surbiton, New Malden and Tolworth among them. Because the service is mobile, what matters is where the car stands rather than which side of the borough it is on: a driveway, a permit bay, a workplace car park or the space under a block of flats all work."],
        },
      },
    },
  },
  luton: {
    opening:
      "Luton sits in Bedfordshire at junctions 10 and 11 of the M1, about thirty miles north of London, with Dunstable beside it and the airport on its eastern edge.",
    why: "Airport parking is where paintwork goes to be forgotten — a fortnight in the open, under whatever the weather and the birds provide. It is worth dealing with on the drive before the trip and again after it, rather than hoping a jet wash will lift it later.",
    areas: ["Dunstable", "Houghton Regis", "Leagrave", "Stopsley", "Barton-le-Clay", "Caddington", "Harpenden"],
      services: {
      wash: {
        heading: "Keeping On Top of Dirt in Luton",
        detail: {
          heading: "Regular Washes on Luton’s Estate Roads",
          body: [
            "Roads here are gritted through the winter, and the salt that comes off the slip roads and the A505 sits in the wheel arches and along the sills for weeks. By autumn it is sap and leaf stain instead, from the older streets where cars park under mature trees. Neither is heavy on its own; both are easier to stay ahead of than to catch up with.",
            "Salt is easier to take off before it has had a season to work, which makes the interval matter more than any single wash. Keeping to one is simpler when a wash is not an errand: the car is cleaned at the address it is already parked at, whether that is a house on an estate road in Houghton Regis or an office car park in Dunstable, and nothing about the day has to be rearranged for it.",
          ],
        },
        faq: {
          q: "How often does a car around Luton need washing?",
          a: ["Often enough that the salt and the sap never get a season to work on the paint, which through winter means regularly rather than occasionally. Once a car is six weeks or more past its last clean, a standard wash is no longer the right starting point and a valeting package does more."],
        },
      },
      valeting: {
        heading: "What a Full Week Leaves Inside a Luton Car",
        detail: {
          heading: "Interiors, Seats and Boots Across Luton",
          body: [
            "A lot of Luton driving is done with the car full — the school run across town, an early start to the station at Leagrave or the Parkway, weekend loads out to Dunstable and back. Interiors take the consequences: grit walked in off chalky verges, spilled coffee on the commute, and the flat smell a car develops when it is never properly aired.",
            "Getting that out is fabric work more than anything: seats and mats taken through rather than wiped over, the boot lining done separately, and the air in the car dealt with by cleaning whatever is holding the smell rather than covering it. The car stands at home or in a car park at work while it happens, and goes straight back into use afterwards.",
          ],
        },
        faq: {
          q: "What does the van need from the address?",
          a: ["Somewhere to stand beside the car, and nothing more than that. It carries water and power of its own, so no outside supply is called on, and the car can stay on the drive, in a residents’ bay or in a car park at work for the whole job."],
        },
      },
      detailing: {
        heading: "Paint, Protection and Luton’s Motorway Miles",
        detail: {
          heading: "Taking Bonded Grime Back Out of the Paint",
          body: [
            "Much of the mileage on a Luton car is motorway mileage — the M1 at junctions ten and eleven, the A505 across to Dunstable, the A6 north towards Barton-le-Clay — and that kind of driving bonds tar and fly to the front of a car until polish is the only thing that will shift it. Chalk dust off the Chiltern edge settles into the same panels.",
            "Taking that back off is a sequence rather than a single pass: the bonded grit is pulled out of the paint, the swirls are polished down, and a sealant goes on last so that what the motorway throws up next sits on top of it instead of on the lacquer. The interwar semis and postwar estates around Stopsley and Leagrave usually have room enough beside the house to do all of it there.",
          ],
        },
        faq: {
          q: "Is detailing different from a valet?",
          a: ["Yes. A valet is a thorough clean, inside and out. Detailing goes at the bodywork itself — washed back, polished and then protected — and while light restoration work can be part of it, it is not a repair service. On a car doing regular motorway miles, the protection is the part that lasts."],
        },
      },
    },
  },
  "milton-keynes": {
    opening:
      "Milton Keynes sits in north Buckinghamshire at junction 14 of the M1, laid out on grid roads with Bletchley, Wolverton and Newport Pagnell inside it.",
    why: "The grid roads are fast, open and swept by everything the weather throws across them, so cars here collect road film evenly and quickly. The upside is space: almost every address has somewhere the van can work properly beside the car.",
    areas: ["Bletchley", "Wolverton", "Newport Pagnell", "Stony Stratford", "Woburn Sands", "Olney", "Wavendon"],
      services: {
        wash: {
          heading: "Milton Keynes Cars and the Weekly Film",
          detail: {
            heading: "Lake Birds and Winter Salt in Milton Keynes",
            body: [
              "There is a lot of water here for an inland town. Willen, Caldecotte and Furzton are balancing lakes with parkland around them, geese and gulls use all three, and a good deal of parking sits within a short flight of one. Bird mess is the most urgent thing that lands on a car in Milton Keynes: it does not simply sit on the lacquer, and a fortnight of July sun is long enough to leave a mark that washing will not lift.",
              "The other half of it is winter. The grid roads are gritted hard, and a car crossing four or five roundabouts each way to Bletchley or Wolverton picks up a salt film that dries pale on the lower panels and goes unnoticed until the first bright morning in March. A fortnightly interval stays ahead of both. The standard wash assumes that footing; a car that has gone a whole winter without one is a valeting job first.",
            ],
          },
          faq: {
            q: "Can you wash a car in an office car park in Milton Keynes?",
            a: ["Yes, provided the car park itself permits it. Bays on the blocks off Silbury and Midsummer Boulevard are marked out generously enough for the van to work beside the car, and nothing is taken from the building — no tap, no socket, no lead run across a walkway. The same goes for the business areas out at Kiln Farm and Linford Wood, and for a drive at home in Shenley or Walnut Tree."],
          },
        },
      valeting: {
        heading: "A Full Valet Without Leaving Milton Keynes",
        detail: {
          heading: "Inside a Car That Commutes",
          body: [
            "Much of the mileage here runs south on the M1 or into the station car parks at Milton Keynes Central and Bletchley, and the inside of the car takes the brunt of it: grit walked onto the mats, a rim of dust along the dash, cup rings in the console and a stale, shut-up smell after a week of early starts and short, cold journeys.",
            "The valet is done where the car already stands, so it goes straight back into use rather than after another drive home. Mats, carpets, the door shuts and the glass are all dealt with at the kerb, on the drive or in the bay the car was parked in that morning.",
          ],
        },
        faq: {
          q: "Can the car be valeted while it is parked at work?",
          a: ["Yes. An office or station car park is as workable as a drive at home, because the van arrives with everything the valet needs and the car is cleaned where it stands. It stays where you left it and is ready to drive when you are."],
        },
      },
      detailing: {
        heading: "What the Grid Roads Do to Paint",
        detail: {
          heading: "Paint Correction and Protection Across Milton Keynes",
          body: [
            "A car kept here covers most of its miles on dual carriageways and roundabouts, and the paint carries the evidence: chips along the leading edge of the bonnet, grit driven into the lower doors and sills, and tar spotted behind the wheel arches. The tree belts running beside the grid roads add sap in summer and stained leaf fall in autumn.",
            "Correction and protection happen where the car is kept rather than at a unit, so it is worked on at a standstill and goes back into use as soon as the last panel is finished. Nothing is dropped off, waited on or collected afterwards.",
          ],
        },
        faq: {
          q: "Which parts of Milton Keynes do you come out to?",
          a: ["The whole borough rather than the central grid squares alone — Bletchley in the south, Wolverton and Stony Stratford in the north, Newport Pagnell by junction 14, with Olney, Woburn Sands and Wavendon beyond them. Work is booked to the address the car is at, so it makes no difference which of them you are in."],
        },
      },
    },
  },
  reading: {
    opening:
      "Reading sits in Berkshire where the Kennet meets the Thames, on the M4 at junctions 10 to 12, about forty miles west of London.",
    why: "It is a town built around business parks and the motorway, and that mix leaves a very particular finish on a car: tar on the sills, fly on the front, and a windscreen that smears in low sun. All of it is straightforward to put right at your own address.",
    areas: ["Caversham", "Tilehurst", "Earley", "Woodley", "Winnersh", "Theale", "Shinfield", "Wokingham"],
      services: {
        detailing: {
          heading: "Correcting and Protecting Paint Around Reading",
          detail: {
            heading: "How a Reading Finish Loses Its Depth",
            body: [
              "A finish that has had ten years of quick washes behind it is rarely damaged in any obvious way. It has simply lost its depth: thousands of fine marks in the clear coat scatter the light instead of reflecting it, and the colour reads a half-tone lighter than it should. The place it shows is on the A4 heading west out of Calcot on a clear afternoon, with the sun low and straight down the bonnet.",
              "Machine polishing is what puts that back, working the clear coat level a panel at a time, and sealing it afterwards is what keeps the following winter out of it. The other thing worth mentioning is the multi-storeys in the centre: a car left under a concrete deck for a working day collects the drips that come through it, and those carry enough lime and rust with them to mark a bonnet if they are left to dry on. Sealed paint buys the days it takes to notice and get them off.",
            ],
          },
          faq: {
            q: "Can you detail a car at a Reading business park during the day?",
            a: ["Yes, provided the car is in a marked bay and can stay there for the length of the job. The business parks off the A33 south of the centre and those out towards junction 11 are inside the area, as are Whitley, Southcote, Calcot, Emmer Green and the villages out at Sonning and Purley on Thames. Water and power come with the van, so nothing is needed from the building."],
          },
        },
        valeting: {
          heading: "A Reading Car Between Nine and Five",
          detail: {
            heading: "Cup Holders and Seat Fabric in Reading",
            body: [
              "A lot of cars here do a short run in the morning and then stand still for nine hours — Lower Earley or Woodley in, a bay at Green Park or Thames Valley Park, and back out again at six. Lunch gets eaten in them, coffee goes in the holder and some of it goes beside it, and the vents blow warm air over the same crumbs every morning of the week.",
              "What that leaves is mostly in the fabric and in the gaps: the runner under the seat, the seam where the cushion meets the back, the cup holder that has never been emptied, the vent slats. Cleaning the plastics gets a car looking tidy and does not touch any of it. Nor does the car need to go anywhere for the rest — a space at the office is as good an address as a drive in Caversham or Tilehurst.",
            ],
          },
          faq: {
            q: "Do you work in underground car parks in Reading?",
            a: ["Usually, yes. The newer blocks around Reading station and along the Kennet have parking underneath them, and the questions are headroom and whether the doors open fully in the bay — not the work itself. Where a space is too tight, the nearest surface bay or the kerb outside does the job instead. Everything needed comes in on the van."],
          },
        },
      wash: {
        heading: "Regular Washing for Cars Kept Around Reading",
        detail: {
          heading: "Washing a Car That Lives on the M4",
          body: [
            "The damp that settles in the valley on a still morning shows on a car left out overnight: a grey film that is back within days, green creeping along the rubbers and the bottoms of the doors, and bird lime under the trees by the water at Caversham. None of it is heavy, but it returns quickly.",
            "Dirt that comes back this steadily is better kept to a rhythm than saved up, and that is easier when the car does not have to go anywhere: it is washed on the drive, in a permit bay, or at the business park where it spends the day. Terraced streets near the centre have no outside tap, which makes no difference here — the van brings its own water and power.",
          ],
        },
        faq: {
          q: "Do you wash cars outside Reading town centre?",
          a: ["Yes. Caversham lies over the river, Tilehurst and Theale to the west, and Earley, Shinfield, Woodley, Winnersh and Wokingham east and south of the centre — all of them inside the area covered. A car parked at any of those addresses is washed there rather than driven in."],
        },
      },
    },
  },
  rickmansworth: {
    opening:
      "Rickmansworth sits in south-west Hertfordshire near junction 18 of the M25, in the Three Rivers district, with Chorleywood, Croxley Green and Mill End around it.",
    why: "It is a green, wooded corner of the county, which is pleasant to live in and hard on paintwork — sap, leaf fall and lane grit in turn. Treating it where the car is parked, before it sets, is far easier than correcting it later.",
    areas: ["Chorleywood", "Croxley Green", "Mill End", "Batchworth", "Maple Cross", "Sarratt", "Watford"],
      services: {
        detailing: {
          heading: "Detailing Cars Kept Around Rickmansworth",
          detail: {
            heading: "Hedgerow Marks on Rickmansworth Paintwork",
            body: [
              "The lanes north of the town — up towards Sarratt, out over the Chess valley and across to Chenies — are single track for long stretches with hedges standing right at the edge of the tarmac. Pulling into a gap to let something past means putting a wing and a door into that hedge, and blackthorn and hawthorn leave very fine scratches all over one side of a car. They are shallow. They also catch every bit of light at the wrong angle.",
              "Shallow is the important word: marks that sit in the top of the lacquer are what machine polishing is for, and a panel that has been corrected and then sealed carries the next summer of lanes far better than a bare one. Where it is done is a matter of convenience rather than requirement — a drive at Chorleywood or Croxley Green, a bay at Croxley Park while the working day runs, a yard at Mill End or Maple Cross. The car stays put throughout.",
            ],
          },
          faq: {
            q: "Can you work on a gravel drive, or does it need hard standing?",
            a: ["Gravel is common on the older houses around Chorleywood and Batchworth, and it makes no difference: the work happens at the car rather than on the ground under it. A reasonably level patch to stand on helps, and most gravel drives have one by the house. Tarmac, block paving, a yard at Mill End or a marked bay in town are all equally workable, and nothing has to be laid down first."],
          },
        },
        wash: {
          heading: "Rickmansworth Cars, Washed Where They Stand",
          detail: {
            heading: "River Damp and Motorway Film Around Rickmansworth",
            body: [
              "The district is named for its rivers, and a car kept near them notices. The Chess, the Gade and the Colne all come together around Batchworth, with the Aquadrome lakes beside them, and the valley holds mist well into a winter morning. Paint that stands in that overnight never properly dries, and the shaded flank of a car starts to green over. Waterfowl off the lakes account for a good deal of the rest.",
              "The other side of it is the motorway. The M25 runs along the bottom of the district past Maple Cross and West Hyde, and in wet weather everything within a field of it carries a fine grey spray that dries as a film rather than as dirt — it shows on the glass before it shows on the paint. Washing on a regular footing keeps both off; leaving it means the film has been cleaned onto itself several times over by the time anyone gets round to it.",
            ],
          },
          faq: {
            q: "Which parts of Three Rivers do you reach besides Rickmansworth?",
            a: ["Croxley Green, Mill End, Batchworth and Maple Cross are all close enough to be part of the same round, with Loudwater and Moor Park just outside the town and Watford beyond them. The surface underneath matters less than the room around the car: a gravel drive, a shingle turning circle or an ordinary kerbside space on a Metropolitan line street are all worked the same way."],
          },
        },
      valeting: {
        heading: "Valeting in Rickmansworth and the Lanes Around It",
        detail: {
          heading: "Damp Interiors, Cleaned in Place",
          body: [
            "Cars in this corner of the county do a lot of short, damp journeys — the station car park, the lanes out towards Sarratt, a walk along the canal and back. What comes home is on the inside: wet mats, grit in the footwells, hair on the back seat and a film on the inside of the glass that never quite clears on a cold morning.",
            "Seats, carpets, mats, trim and the glass are all cleaned in place, so the whole job happens where the car is parked instead of it being driven off and waited on. Nothing is dropped off, nothing is collected, and the car is back in use the moment the work is finished.",
          ],
        },
        faq: {
          q: "Are Chorleywood and Sarratt on the same round as Rickmansworth?",
          a: ["Yes. Both sit inside the area this round covers, along with the rest of Three Rivers, and a village address on the Chilterns side is set up no differently from one in the town: a lane with no outside tap and nothing to plug into changes nothing, because the van supplies both itself."],
        },
      },
    },
  },
  romford: {
    opening:
      "Romford sits in Havering on the eastern edge of London, on the A12 where the city runs into Essex, with Gidea Park, Collier Row and Harold Wood around it.",
    why: "It is a mix of terraces, semis and new flats, and between them the parking runs from permit bays to private drives. A mobile round does not care which — the van is self-contained, so the work happens wherever the car already is.",
    areas: ["Gidea Park", "Collier Row", "Harold Wood", "Rush Green", "Hornchurch", "Elm Park", "Chadwell Heath"],
      services: {
        valeting: {
          heading: "What a Romford Car Carries Home",
          detail: {
            heading: "The Part of a Romford Car Nobody Looks At",
            body: [
              "The boot does most of the unglamorous work here. A week’s shopping, a market bag that leaked somewhere on the ring road, compost and bedding plants in spring, a bootful of cardboard for the tip, sports bags, wet coats after an hour at Bedfords Park. Because the lid stays shut, none of it gets dealt with at the time, and a split bag of anything spreads out under the liner where nobody sees it.",
              "So a valet starts by emptying it and lifting the floor out, because the well underneath holds water as readily as anything else, then works forward through the rear seat backs, which take the worst of it whenever they have been folded down. Nothing in that wants the car driven anywhere first, which is just as well when the boot is full — the van arrives at the address carrying its own water and power.",
            ],
          },
          faq: {
            q: "Do you valet in Collier Row, Harold Wood and Gidea Park?",
            a: ["All three, and Rush Green, Chadwell Heath, Hornchurch and Elm Park with them, along with the whole of Romford itself. Distance from the town centre makes no difference to how the job is done: the car is worked on where it stands, so an address out at Harold Wood or up at Collier Row is arranged exactly as one behind the ring road would be."],
          },
        },
      wash: {
        heading: "A Mobile Wash on the Eastern Edge of London",
        detail: {
          heading: "The Dirt That Keeps Coming Back",
          body: [
            "Havering is half suburb and half green belt, and a car kept in Romford does its mileage across both. What settles on it is ordinary enough: mud off the lanes north of Collier Row, dust that dries onto the glass in summer, rain spotting that never quite goes on its own, a flat look to the paint after a fortnight of weather. None of it is damage, and none of it is urgent. It just never stops arriving.",
            "That suits a standard wash rather than a valet: the car is in decent order and only needs the week taken off it, rather than having been left long enough for the dirt to stop shifting. Because the van is what moves rather than the car, a wash can be kept to a rhythm instead of fitted in around an errand, and that is the difference between keeping a car clean and starting over.",
          ],
        },
        faq: {
          q: "Does winter change how often a car should be washed?",
          a: ["It does. Gritted roads across Havering throw salt and grit up the sills and into the wheel arches, and a car parked outdoors collects more of it in one wet week than in a dry month. Left on, it dulls the paint and settles into the seams, so a car kept outside in Romford tends to want washing more often between November and March than it does through the summer."],
        },
      },
      detailing: {
        heading: "Detailing Across Havering, Whatever the Parking",
        detail: {
          heading: "No Workshop, No Drop-Off",
          body: [
            "Paint can look clean from the pavement and still feel like fine sandpaper under a hand. That is what a week on the A12 and the A127 leaves behind — tar specks low down on the doors, brake dust baked into the faces of the wheels, and a traffic film that bonds to the lacquer rather than sitting on top of it. A car doing that run out of Romford collects it far faster than one that rarely leaves the residential roads.",
            "Very little of that comes off with a sponge. A detail goes at the bodywork properly — cleaning it, then polishing it, then leaving protection on it — and none of that calls for a workshop. It happens at the address instead, with the car standing in the space it was parked in, so the only journey involved is the van’s.",
          ],
        },
        faq: {
          q: "The car is washed regularly — is a detail worth it as well?",
          a: ["A wash lifts what is sitting on the paint. A detail deals with what has bonded to it — the tar, the wheel grime and the film that a regular wash never quite gets under. Nothing about it is a repair; it is a deeper clean of the bodywork, and a car on those roads every week gives it plenty to work on."],
        },
      },
    },
  },
  sidcup: {
    opening:
      "Sidcup sits in Bexley in South-East London, on the A20 between Eltham and Swanley, with Foots Cray, Blackfen and Bexley village around it.",
    why: "It is a suburb where most cars sit on a drive or a hardstanding all week, which sounds harmless and is not: standing water, leaf fall and overnight damp do more to a finish than driving ever does. Regular attention at the address is what keeps ahead of it.",
    areas: ["Foots Cray", "Blackfen", "Bexley", "Albany Park", "New Eltham", "Chislehurst", "North Cray"],
      services: {
        detailing: {
          heading: "Bringing the Depth Back to Sidcup Paintwork",
          detail: {
            heading: "Years of Quick Washes Show in Sidcup",
            body: [
              "Most of what takes the life out of a finish here was put there slowly. Ten years of quick washes leave a lacquer full of fine scratches that a grey morning hides completely; the first low sun of the winter picks every one of them up at once, and the panel goes silver instead of the colour it is meant to be. Machine polishing is the only thing that takes them out.",
              "The rest is what the address adds. Down towards Foots Cray and North Cray the ground is low and the river keeps the air heavy, so anything that lands on a panel has longer to work on it before it dries. Cars kept nearer Chislehurst stand under old woodland instead. Once the bonded contamination is off and the paint has been machine polished, it is sealed, and the difference shows most on a dark car in direct sun.",
            ],
          },
          faq: {
            q: "Can you detail a car parked on a shared hardstanding in Sidcup?",
            a: ["Yes, so long as the car can stay put for the day. A shared hardstanding, a resident’s bay or a space in an office car park all give enough room to work round the panels, and a detail is done at whatever address the car spends its time at — Sidcup itself, Bexley village, New Eltham, Chislehurst or the Crays. The van arrives self-contained, so nothing is needed from the house."],
          },
        },
        valeting: {
          heading: "A Dog’s Week in a Sidcup Car",
          detail: {
            heading: "What a Vacuum in Sidcup Misses",
            body: [
              "Foots Cray Meadows is the walk most people here default to, and the ground beside the Cray stays soft long after the path looks dry; Scadbury Park and the woods over towards Chislehurst are no better in February. What comes back from either goes straight into the car — river mud on paws, a wet blanket over the back seat, hair working its way into the cushions rather than sitting on them.",
              "Hair is the part that a brush and a household vacuum never finish. It has to be lifted out of the weave, which takes longer than the mud does, and the mud itself has usually gone through the mat into the carpet below it by the time anyone notices. None of that calls for the car to be taken anywhere: the van parks alongside it, whether that is at home in Albany Park or Longlands or at a workplace on the other side of the A20.",
            ],
          },
          faq: {
            q: "What if there is no drive at the address?",
            a: ["It makes no difference. The flats along Sidcup High Street and the blocks near the station mostly have a marked bay or a shared forecourt, and either is enough to work around a car properly. A kerbside space on Halfway Street or one of the roads off Blackfen Road does the same. Nothing is needed from the building itself, since water and power arrive with the van."],
          },
        },
      wash: {
        heading: "Keeping a Sidcup Car Clean Between Valets",
        detail: {
          heading: "What a Parked Car Picks Up in Sidcup",
          body: [
            "Much of Blackfen and Albany Park is interwar semis with drives, and a car parked on one of them for most of the week never really dries off. Sap and bird lime harden where they land, a green film creeps along the window rubbers and the lower edges of the doors, and grit blown in off the A20 settles in the shuts. A quick rinse lifts the loose dirt and leaves all of that behind.",
            "The work is done where the car already stands. A drive in Blackfen, a hardstanding in Foots Cray or a kerbside space on one of the narrower roads all leave enough room to work around the car properly. The van carries its own water and power, so no tap or socket is needed at the address.",
          ],
        },
        faq: {
          q: "Do you wash cars across the whole of Sidcup?",
          a: ["Yes. The whole of Sidcup is covered, along with Blackfen and Albany Park to the north, Foots Cray and North Cray towards the river, and Bexley village, New Eltham and Chislehurst on either side. The car is washed wherever it is parked that day, whether that is at home or at work."],
        },
      },
    },
  },
  slough: {
    opening:
      "Slough sits in Berkshire between junctions 5 and 7 of the M4, west of Heathrow, with Langley, Burnham and Windsor around it and one of the country's largest trading estates inside it.",
    why: "A lot of what is parked here is a work vehicle or a company car, and both do hard, high-mileage weeks. Getting them cleaned where they are parked — at the unit, the office or the house — is the only version of it that does not cost a working hour.",
    areas: ["Langley", "Burnham", "Windsor", "Datchet", "Iver", "Colnbrook", "Farnham Royal", "Stoke Poges"],
      services: {
      detailing: {
        heading: "Detailing a Working Car in Slough",
        detail: {
          heading: "Company Cars, Vans and the M4",
          body: [
            "Motorway miles leave a different sort of dirt from town miles. A car running between junctions 5 and 7 of the M4 picks up tar along the sills, fly baked across the front and brake dust on the wheels. On a dark company car, the swirl marks left by a hurried wash show up in low sun. Polishing is what evens that finish out again, and protection goes on over the top.",
            "Detailing takes hours rather than minutes, and it is close work. The car stands still, whoever is working on it needs room along each side, and a yard or a car park in Slough gives that as readily as a workshop bay does. The car stays where it was parked from start to finish.",
          ],
        },
        faq: {
          q: "Which parts of Slough and the villages around it do you reach?",
          a: ["Slough itself, Langley included, and then outwards: Burnham, Farnham Royal and Stoke Poges to the north, Iver and Colnbrook to the east, Datchet and Windsor across the river. Water and power travel with the van, so the car does not have to be taken anywhere for the work to happen."],
        },
      },
    },
  },
  "south-london": {
    opening:
      "South London runs from Wandsworth and Lambeth out through Croydon, Bromley and Sutton to the Surrey and Kent boundaries, with the river along its northern edge.",
    why: "Inner South London is permit bays and Victorian terraces; the outer boroughs are drives and garages. A mobile service is the one arrangement that works across both, because all it needs is the space the car is already parked in.",
    areas: ["Wandsworth", "Lambeth", "Clapham", "Croydon", "Bromley", "Sutton", "Dulwich", "Streatham"],
      services: {
        detailing: {
          heading: "South London Paint, From Bay to Driveway",
          detail: {
            heading: "What South London Does to a Clear Coat",
            body: [
              "Two very different cars sit under the same heading here. One lives in a marked bay in Clapham or Dulwich with traffic passing a foot from its flank, picking up iron from brake dust all day and the odd scuff from a passing bag or bike. The other stands on a drive out at Bromley, Sutton or the edge of Croydon, where nothing touches it and the finish simply goes quietly flat over several years.",
              "Both end up in the same place, and both are answered the same way: the bonded contamination has to come away first, and then the lacquer is machine polished until the light sits on it evenly again, then the paint is protected. It is slow work, which is the point of doing it where the car already is — on the drive, in the bay it is permitted for, or on a deck in an office car park while the day goes on around it.",
            ],
          },
          faq: {
            q: "How far south do you come — is Croydon or Bromley covered?",
            a: ["Both are, and so is everything between them and the Thames: Wandsworth, Lambeth, Clapham, Streatham, Dulwich and Sutton, as far as the county line in either direction. A detail is not a quick job, so the usual arrangement is wherever the car is standing anyway — at home, at work, or in a residents’ bay it already has a permit for."],
          },
        },
      wash: {
        heading: "A Standard Wash Wherever You Park in South London",
        detail: {
          heading: "Parked Outside, Washed Where It Stands",
          body: [
            "Street trees line a good many of these roads, and what comes off them — sap in summer, leaf mulch in autumn, bird lime all year — does not wait to be dealt with. Add the brake dust thrown up along the A23 and the South Circular and a car kept outside in Streatham or Wandsworth shows it again soon after a wash.",
            "Washing it where it stands takes the trip out of the job, on the road outside the house or in the bay at work, and nothing has to be laid on at the address: the water and the power both come on the van.",
          ],
        },
        faq: {
          q: "Is a standard wash enough for a car that lives on the street?",
          a: ["For a car that is kept on top of, yes — the standard wash is there to take the dirt off one that is already in good order. Once six weeks or so have gone by, and an autumn under trees will do it, a valeting package is the better starting point."],
        },
      },
      valeting: {
        heading: "Valeting Across the South London Boroughs",
        detail: {
          heading: "Inside a Car That Commutes Through South London",
          body: [
            "Cars here spend their weeks on the A3 and the A24, and most of what that costs ends up inside rather than on the paint. Dust settles on a dashboard that stands outdoors all year, leaf litter comes off the commons on shoes, and a wet coat leaves a tide line on the seat behind it.",
            "Glass is the giveaway. A film builds on the inside of a windscreen that has carried damp air and warm breath all week, and after dark it turns every oncoming headlight into a smear. The same film sits on the dash top and the door cards, where it holds dust instead of letting it blow off.",
          ],
        },
        faq: {
          q: "Is there any point having the inside done in winter?",
          a: ["Winter is when most of it goes in. Salt and grit off the roads travel in on shoes, coats go in wet and stay wet, and a car parked outdoors never gets warm enough to dry a carpet out on its own. An interior valet in January is dealing with more than one in June."],
        },
      },
    },
  },
  "st-albans": {
    opening:
      "St Albans is a cathedral city in Hertfordshire between the M1 and the M25, about twenty miles north of London, with Harpenden, London Colney and Wheathampstead around it.",
    why: "The old centre is narrow, and much of the parking is on-street and controlled, so taking a car anywhere to be cleaned costs more time than the clean does. Coming to the address is simply the sensible way round.",
    areas: ["Harpenden", "London Colney", "Wheathampstead", "Redbourn", "Bricket Wood", "Park Street", "Sandridge"],
      services: {
      detailing: {
        heading: "Detailing for Cars Kept In and Around St Albans",
        detail: {
          heading: "What St Albans Roads Leave on Your Paintwork",
          body: [
            "The A414 and the A1081 carry most of the traffic through the city, and the grime off roads like those is the baked-on sort: tar flecks low on the doors, a film of fly across the front and the mirrors. Park beneath the trees on an older road afterwards and sap and bird lime go on top of it.",
            "That is the difference between a car that is dirty and one that has gone dull. Loose dirt comes off in the wash; what has bonded into the lacquer stays where it is and flattens the colour, and it shows most on a dark car standing out in the open. Detailing works on the second of those — on the paint itself, and on the protection that goes over it once the surface is clean.",
          ],
        },
        faq: {
          q: "Does bird lime need dealing with straight away?",
          a: ["It is not worth leaving. Bird lime and tree sap both bite into lacquer, and they do it faster in warm weather, so a car left under street trees can keep the marks long after the dirt around them has been washed off. Taking it off early is a good deal easier than dealing with what it leaves behind."],
        },
      },
    },
  },
  surrey: {
    opening:
      "Surrey sits south-west of London, from the boroughs on the M25 out through Guildford, Woking and Epsom to the Sussex border, much of it wooded.",
    why: "Tree cover is the defining thing here: sap in summer, leaf mould in autumn, and lane grit whenever it rains. All of it marks paint if it is left, and none of it is a problem if the car is seen to regularly where it stands.",
    areas: ["Guildford", "Woking", "Epsom", "Esher", "Weybridge", "Reigate", "Leatherhead", "Staines"],
      services: {
        detailing: {
          heading: "Chalk, Flint and Surrey Paintwork",
          detail: {
            heading: "How the Scratches Come Out of Surrey Paint",
            body: [
              "The lanes are what make the difference here. A road under the North Downs throws up chalk in dry weather and flint grit in wet, and both are abrasive; wash a car that has been down the lanes around Box Hill or over Reigate Hill without lifting that off first and the cloth carries it across the paint. That is where most of the fine scratching in a Surrey car’s lacquer comes from, rather than from anything the road did directly.",
              "Correction is a machine job and a slow one. The lacquer is worked back until the scratches stop catching the light, and then sealed, so the next lot of grit sits on a protected surface rather than on bare paint. Surrey is a wide county and the addresses vary — a drive at Esher or Weybridge, a yard at Leatherhead, a marked space outside an office at Woking — but the work is the same in all of them, and none of them asks the car to move.",
            ],
          },
          faq: {
            q: "Can you detail a car parked at an office in Woking or Guildford?",
            a: ["Yes, as long as the car can stand in the same space for the job. A marked bay at a business park is fine, and so is a space in a multi-storey deck or an underground bay, provided there is room to open the doors and walk round. The same applies at home, on a drive at Esher, Weybridge or Reigate, or at the end of a lane out towards Leatherhead."],
          },
        },
        wash: {
          heading: "Keeping a Surrey Car Ahead of the Weather",
          detail: {
            heading: "Two Surrey Soils and a Steady Road Film",
            body: [
              "Surrey is two soils, and a car meets both. Along the Downs it is chalk: the A24 through the Mole gap at Dorking, the ridge road on the Hog’s Back west of Guildford. Chalk travels as a pale dust that settles into every shut and shows worse on dark paint than it has any right to. West around Woking, Chobham and Bagshot the ground is sand and heath instead, and a dry, windy week leaves a gritty film on anything standing out in it.",
              "Then there is the river. Staines, Chertsey and Weybridge sit on the Thames, where geese and gulls come off the water and the damp hangs about the riverside roads well into the morning. Add the M3 and the M23 at either side of the county and a steady road film goes over all of it. A car washed on a short, regular interval never lets any of that get established; one washed twice a year is always starting from behind.",
            ],
          },
          faq: {
            q: "Can you reach addresses on the lanes between Guildford and Dorking?",
            a: ["Yes. The A25 villages between the two — Shere, Gomshall and Abinger among them — are as reachable as Guildford or Leatherhead themselves, and a lane address is worked from the van at the roadside rather than needing a driveway. The wider round takes in Woking, Epsom, Esher, Weybridge, Reigate and Staines, so most of the county sits inside it one way or another."],
          },
        },
      valeting: {
        heading: "What a Valet Has to Deal With in Surrey",
        detail: {
          heading: "Surrey Cars, From Guildford to Staines",
          body: [
            "The county is commuter country. Cars run down the A3 towards Guildford, sit out the day in station car parks at Woking, Epsom and Staines, and pick up the M25 wherever it crosses the county on the way home. What collects inside is the ordinary consequence: grit and leaf litter in the footwells, mud carried in off gravel drives, and a boot that has held the dog, the shopping and the recycling.",
            "Trees are the other constant: sap hardens on the lacquer over a summer, and leaf mould packs into window channels and around the boot seal. Neither is serious if the car is seen to regularly, and both take real work once they have sat. None of it needs the car to go anywhere — the van carries its own water and power, so the valet happens on the drive at home, in the car park at work, or in the bay the car already sits in, with no outside tap and no lead run out through a window.",
          ],
        },
        faq: {
          q: "Do you valet cars right across Surrey?",
          a: ["Yes. Surrey is inside the area covered, along with London and the counties around it, and that takes in Guildford, Woking, Epsom, Esher, Weybridge, Reigate, Leatherhead and Staines. The work is mobile, so the car does not have to be driven anywhere to be cleaned."],
        },
      },
    },
  },
  sutton: {
    opening:
      "Sutton sits at the southern edge of London where it meets Surrey, with Carshalton, Cheam, Wallington and Worcester Park around it.",
    why: "It is a borough of suburban streets and off-street parking, which means most cars here can be worked on exactly where they live. That is the whole arrangement: the van arrives with its own water and power, and the car never moves.",
    areas: ["Carshalton", "Cheam", "Wallington", "Worcester Park", "Belmont", "Hackbridge", "Banstead"],
      services: {
        detailing: {
          heading: "A Decade of Sun on a Sutton Roof",
          detail: {
            heading: "Cheam, Wallington and the Sutton Side Streets",
            body: [
              "The panels that go first are the horizontal ones. A bonnet, a roof and a boot lid take every hour of summer sun on a south-facing drive in Cheam or Worcester Park, and a clear coat with ten years of that behind it loses its sharpness — a reflection on the roof softens long before anything looks wrong from the side. It is the part of a car nobody looks at directly and the first part a machine polish brings back.",
              "Shade brings its own version of the same thing. The older avenues around Carshalton, Wallington and Beddington have grown a heavy canopy, and a car kept under it stays damp, holds what falls on it and goes green along the trim and the seals. Both ends of that — the bleached roof and the shaded flanks — are dealt with in the same visit, and the paint is sealed afterwards, so water beads and runs off rather than standing on it.",
            ],
          },
          faq: {
            q: "Can you detail a car in an allocated bay near Sutton station?",
            a: ["Yes, provided the bay has room either side to work round the car. Allocated spaces behind the newer blocks in the town centre are usually fine, and an undercroft or a deck in a car park works as well. Elsewhere it is mostly drives — Cheam, Carshalton, Wallington, Worcester Park, Belmont and out towards Banstead — and the car stays where it is parked for the day."],
          },
        },
        wash: {
          heading: "Sutton Parking and What Lands on Paint",
          detail: {
            heading: "Street Trees Over a Sutton Front Drive",
            body: [
              "Sutton has a great deal of tree cover for an outer borough, and the trees are in the streets rather than only in the parks. Limes along an avenue drip honeydew right through the warm months, which is not dirt so much as a sticky base coat for everything that blows past afterwards. Horse chestnut and plane hold the birds, and the mature stuff around Nonsuch Park, Beddington Park and Oaks Park keeps the pattern going wherever a car is left standing.",
              "Almost none of that parking is under cover. The interwar streets through Cheam, Carshalton and Wallington were built with short front drives, open on every side, and the newer flats put cars in an unroofed bay off the road. A car in either position collects everything the season is doing, week in and week out. Washed on a short interval, none of it gets the chance to bond; left to build, honeydew in particular sets hard and stops being a wash problem at all.",
            ],
          },
          faq: {
            q: "Can you wash a car parked on the road outside a flat?",
            a: ["Yes. The kerb is where a good many cars here get cleaned, which covers the flats around the town centre and Rosehill and the older streets on the St Helier side where the houses have no drive at all. Nothing is taken from the building and the car is not moved. A marked bay behind a block is the same job again, as long as there is room to walk round it."],
          },
        },
      valeting: {
        heading: "Valeting in Sutton, on the Drive or at the Kerb",
        detail: {
          heading: "Short Sutton Runs, Damp Mats and Chalk Dust",
          body: [
            "Mileage here is short and local — the A217 up through the town centre, the A232 west to Cheam and east towards Wallington, the A2043 north to Worcester Park, the school and the station and back. A short run never warms a car through, so winter damp stays in the mats and the glass mists from the inside every morning. That film on the windscreen is the first thing anyone notices and the last thing a rinse over the outside touches.",
            "Higher up towards Belmont and Banstead the roads run onto the chalk of the Downs, and pale dust works into the carpet and the backs of the seats. Down along the Wandle at Hackbridge and Carshalton it is damp rather than dust, a musty edge to the air when the car has stood with its doors shut all week. Both are interior problems rather than paintwork ones, and neither is reached by washing the outside.",
          ],
        },
        faq: {
          q: "Do you cover the whole of the Sutton borough?",
          a: ["We work right across it — Carshalton, Cheam, Wallington, Worcester Park, Belmont, Hackbridge and out to Banstead on the Surrey side. Bookings are met at whatever address the car spends its day at, and everything the valet needs arrives on the van."],
        },
      },
    },
  },
  "welwyn-garden-city": {
    opening:
      "Welwyn Garden City sits in Hertfordshire on the A1(M), north of Hatfield, laid out with wide verges, tree-lined roads and a great deal of green between its neighbourhoods.",
    why: "Those trees are the reason the town looks the way it does and the reason cars here need more than a rinse — sap and leaf fall get into panel gaps and around trim and stay there. It is a job worth doing thoroughly, at the address.",
    areas: ["Hatfield", "Welwyn", "Digswell", "Oaklands", "Woolmer Green", "Knebworth", "Hertford"],
      services: {
        valeting: {
          heading: "Autumn Inside a Welwyn Garden City Car",
          detail: {
            heading: "Garage Courts and Verges in Welwyn Garden City",
            body: [
              "Sherrardspark Wood is oak and hornbeam, and what lies on that floor by late October is not dry leaf but a heavy wet mould that comes away on a boot sole and stays there. Stanborough adds lake mud and goose mess off the path, and the meadows along the Lea at Lemsford add more of the same. All of it travels home in the footwells, and a good deal of it gets pressed through the mats into the carpet underneath.",
              "Getting that back out is a matter of lifting the mats, working the carpet and then drying it, which is the step a wipe-round skips and the reason a car smells of the wood until March. It is done wherever the car is kept. Some of the older neighbourhoods keep their garages in a block behind the houses rather than at the door, and a space in one of those — or a verge-side bay off a service road at Woodhall or Hollybush — gives as much room to work as a drive does.",
            ],
          },
          faq: {
            q: "Do you come out to Welwyn, Digswell and Woolmer Green?",
            a: ["Yes — those three, along with Knebworth up the old Great North Road, Oaklands, Hatfield to the south and Hertford to the east. A village address makes no odds to the arrangement: the van comes to the car and carries its own water and power, so nothing has to be run out of the house for it."],
          },
        },
        wash: {
          heading: "Shade, Verges and a Welwyn Garden City Wash",
          detail: {
            heading: "Washing at the Kerb in Welwyn Garden City",
            body: [
              "Plenty of the town still parks on the road, and the roads here were laid out with grass either side rather than a hard edge. A car that sits half on the verge takes mud up onto its sills whenever it rains, and a fine green wash of it when the verges are cut. In late spring there is pollen over everything as well — a yellow-green dust that a shower turns into streaks down the glass and the bonnet.",
              "The other thing the canopy does is keep the sun off. A car parked in permanent shade dries slowly after every rain, and paint that stays damp grows the faint green bloom that shows first along the boot shuts and the bottom of the doors. It comes off easily while it is young. A regular wash is simply that job done before any of it has settled, which is a different proposition from rescuing a car in the spring.",
            ],
          },
          faq: {
            q: "Can you wash a car at an office or station car park?",
            a: ["Yes, where the car park itself allows it — an office space on Shire Park or off Broadwater Road does the job as well as a drive at home, and a car left by the station all day is in the same position. The van works beside the vehicle and takes nothing from the building, so nobody has to unlock a tap or find a socket for it."],
          },
        },
      detailing: {
        heading: "Paintwork Under the Trees of Welwyn Garden City",
        detail: {
          heading: "Motorway Miles and the Case for Machine Work",
          body: [
            "A good deal of the driving here is A1(M) driving, and motorway miles bake on rather than settle: tar flecked down the lower doors, fly across the front, grit worked into the wheel faces. Underneath it, years of hurried washes leave a fine haze and a pattern of swirls in the lacquer. A wash takes the dirt away and leaves that behind, which is the difference between washing a car and detailing one.",
            "The town was laid out with space, and most of its houses were built with a drive. That matters more than it sounds: machine polishing wants room to work one panel at a time in daylight, not a squeeze between two parked cars. Where there is no drive, the kerb does the job instead, with water and power carried in on the van.",
          ],
        },
        faq: {
          q: "Do you cover the whole of Welwyn Garden City?",
          a: ["Yes — the whole of it, from Handside and Sherrards west of the railway across to Peartree, Panshanger and Haldens on the east. Digswell, Welwyn, Hatfield, Woolmer Green, Knebworth and Hertford are covered alongside it."],
        },
      },
    },
  },
  /*
    Not one of the 49: this is a borough hub whose mirror page is a stub — an
    h1 reading "Our Locations" and nothing else, 3 words in all. It is here so
    `content/overrides.ts` can build the page the mirror never had.
  */
  "city-of-westminster": {
    opening:
      "The City of Westminster runs from the river at Millbank up through Victoria, Mayfair and Marylebone to the edge of Regent’s Park, taking in Soho, St James’s and Belgravia on the way.",
    why:
      "There is almost no off-street parking in any of it, and what there is tends to be an underground bay with no tap and no socket. That is the whole case for a mobile service here: the van arrives self-contained and works in the resident’s bay, the mews or the office car park, without the car moving at all.",
    areas: [
      "Mayfair",
      "Marylebone",
      "Victoria",
      "Belgravia",
      "Soho",
      "St James’s",
      "Pimlico",
      "Bayswater",
      "Paddington",
    ],
  },
  "west-london": {
    opening:
      "West London runs from Hammersmith and Chiswick out through Ealing and Acton to Hounslow and the Heathrow corridor, with the A4 and the M4 through the middle of it.",
    why: "It is dense, busy and largely permit-parked, and the airport corridor adds a fine grit to everything left outside. Between the two, taking a car somewhere to be cleaned is the least convenient option available — which is why the van comes to it instead.",
    areas: ["Hammersmith", "Chiswick", "Ealing", "Acton", "Shepherd's Bush", "Brentford", "Northolt", "Greenford"],
      services: {
      detailing: {
        heading: "What West London Traffic Does to Paintwork",
        detail: {
          heading: "Working Where the Car Is Already Parked",
          body: [
            "Stop-start driving on the Uxbridge Road, the A40 and the North Circular bonds brake dust into the wheel faces and leaves a flat film across the clear coat. Cars kept close to the river at Chiswick and Brentford take on a damp bloom on top of that, and quick washes over the years leave the swirl marks that show up the moment the sun does. None of that lifts with a bucket; it is corrected, panel by panel.",
            "Parking decides how the work is arranged more than anything else does. A permit bay outside a terrace, a space on an estate road, a slot in an office car park off the A4 — each of them is a place the car already stands for hours, and each is room enough to work in properly, so nothing has to be booked in anywhere.",
          ],
        },
        faq: {
          q: "Which parts of West London do you travel to?",
          a: ["Hammersmith and Chiswick at the eastern end, Acton, Shepherd’s Bush and Ealing through the middle, and Brentford, Greenford and Northolt further out are all inside the area covered, along with the streets between them."],
        },
      },
    },
  },
  borehamwood: {
    opening:
      "Borehamwood sits in Hertfordshire just outside the M25 at junction 23, north of Barnet, with Elstree beside it and the film studios that gave both their name.",
    why: "It is a town of estates and station parking, where most cars sit still all week and collect whatever the weather leaves on them. Dealing with that at the address turns it into a job that fits around the week rather than one that eats a Saturday.",
    areas: ["Elstree", "Shenley", "Radlett", "Barnet", "Mill Hill", "Potters Bar", "Bushey"],
    services: {
      detailing: {
        heading: "Paint Correction Around Borehamwood and Elstree",
        detail: {
          heading: "Estate Closes and the A1 at Borehamwood",
          body: [
            "Two things share the same postcode here. Along the A1 at Stirling Corner and on the run down Barnet Lane, cars pick up the traffic film and brake dust of a dual carriageway, laid on in the slow crawl rather than at speed. Two streets back, on the closes off Shenley Road, the same cars stand under sycamore and plane for six days out of seven and take sap and bird lime instead.",
            "Both end up bonded into the lacquer, and once they are there a wash only takes the loose layer off the top. A detail goes further down: the paint is decontaminated, machine polished to take the haze and the fine swirls out of it, and then protected so the next month’s worth has something to sit on rather than something to bite into. It happens on the drive, in a marked bay or at the kerb, whichever the address has.",
          ],
        },
        faq: {
          q: "Is Radlett, Shenley or Bushey on the same round as Borehamwood?",
          a: ["They are, and so are Potters Bar, Elstree and the Barnet side of the boundary. Radlett’s larger plots off Watling Street are straightforward to work on, and so are the narrower closes around Borehamwood itself, since the van parks alongside and needs nothing from the house — it carries its own water and power."],
        },
      },
    },
  },
  "central-london": {
    opening:
      "Central London is the ground inside the Congestion Charge zone and the streets just outside it — the City, Holborn, Soho, Marylebone, Westminster and the West End.",
    why: "Almost nothing here has a driveway, and driving a car anywhere to be cleaned means paying to do it. The van comes to the bay, the mews or the office car park instead, carrying its own water and power, so the car never moves and never pays.",
    areas: ["The City", "Holborn", "Soho", "Marylebone", "Fitzrovia", "Covent Garden", "Clerkenwell", "Bloomsbury"],
    services: {
      detailing: {
        heading: "What Central London Does to a Finish",
        detail: {
          heading: "Underground Bays and Garden Squares in Central London",
          body: [
            "Central London mileage is slow mileage. A car here spends its time in queues behind buses and taxis on the Euston Road, along Aldwych, or waiting at the lights on Theobald’s Road, and that kind of driving lays soot and brake dust onto paint without ever getting it warm or moving enough air over it to dry. The panels that suffer are the ones nobody looks at: the lower doors, the sills and the back of the boot lid.",
            "Where the car sleeps decides the other half of it. A basement bay in Marylebone or Clerkenwell keeps the weather off and puts fine dust and drips on instead; a resident’s bay beside one of the Bloomsbury squares sits under plane trees, so it takes sap in July and bird lime all year. Detailing deals with both — decontaminated, machine polished until the finish has depth in it again, then sealed — and it happens in the bay the car is already in.",
          ],
        },
        faq: {
          q: "Can you work in an underground car park in the City?",
          a: ["Yes, provided there is room to open the doors and walk round the car, which most basement bays under the offices in the City and Clerkenwell have. Ramp height is the thing worth mentioning when you book, since a van cannot follow a car down every one of them. Street bays in Soho, Fitzrovia and Covent Garden are the same job at ground level, and a kerbside bay in Bloomsbury is no different."],
        },
      },
    },
  },
  chelsea: {
    opening:
      "Chelsea runs along the north bank of the Thames between Battersea Bridge and Sloane Square, with the King’s Road through the middle of it and Kensington above.",
    why: "Parking is permit-controlled and tight, and the streets are narrow enough that a car leaving to be cleaned may not find its space again. Working at the kerb where it already stands is the arrangement that actually fits the postcode.",
    areas: ["Sloane Square", "King’s Road", "World’s End", "Brompton", "South Kensington", "Pimlico", "Battersea"],
    services: {
      detailing: {
        heading: "Dark Paint on a Chelsea Street",
        detail: {
          heading: "Why a Chelsea Finish Goes Flat",
          body: [
            "A lot of what is parked between Cheyne Walk and Sloane Street is black, navy or dark grey, and dark paint is honest about everything that has ever touched it. Every fine scratch shows, every swirl from a roller wash shows, and the marks that come from parking nose to tail on a narrow street — a bag swung past a wing, a pedal, a bin wheeled along the kerb — show worst of all in low sun.",
            "The other half is the river. Cars kept along the Embankment and on the streets behind Royal Hospital Road sit in damp air that holds traffic film on the paint rather than letting it dry off, and the planes along the water drop sap and draw birds onto whatever is under them. Machine polishing is what takes the accumulated haze back out of the lacquer; sealing it afterwards is what keeps the next few months of Fulham Road grime sitting on the surface.",
          ],
        },
        faq: {
          q: "Can you detail a car in a Chelsea permit bay without moving it?",
          a: ["That is the usual arrangement here, and the bay the car is already in is the one we work in — off Flood Street, on Old Church Street, or up at World’s End. The van parks close, brings its own water and power, and takes nothing from the house. South Kensington, Brompton and the Pimlico side are the same call."],
        },
      },
    },
  },
  chingford: {
    opening:
      "Chingford sits at the northern end of Waltham Forest, on the edge of Epping Forest, with Highams Park and Woodford beside it and the Lee Valley to the west.",
    why: "Living beside the forest means sap in summer and leaf mould through autumn, both of which mark paint if they sit. The advantage is space: most addresses here have a drive or a wide kerb, which is all the van needs.",
    areas: ["Highams Park", "Woodford Green", "Walthamstow", "Waltham Abbey", "Buckhurst Hill", "Loughton", "South Chingford"],
    services: {
      detailing: {
        heading: "Detailing on the Edge of Chingford’s Forest",
        detail: {
          heading: "Narrow Lanes and Old Oaks Around Chingford",
          body: [
            "The forest roads are not wide. Anything that runs from the Plain across to Woodford, or up Sewardstone Road towards Waltham Abbey, is hedged or overhung for stretches of it, and in summer the flanks of a car take the ends of branches at door-handle height. That is not something you notice in a car park. It is a set of fine scratches down one side that shows up when the sun is low and behind you.",
            "Standing still has its own version. A car left under an oak or a lime through a warm spell comes back tacky with honeydew, and the reservoirs over towards the Lee bring gulls onto roofs and bonnets all year. Machine polishing is what takes those fine marks and the general haze out of the lacquer rather than washing over them, and the sealed finish that goes on afterwards is what gives the next August something to be wiped off.",
          ],
        },
        faq: {
          q: "Can you get to houses on the forest lanes around Chingford?",
          a: ["The lanes off Rangers Road and up towards Sewardstone are narrow but they are not a problem — the van stands in line with the car rather than beside it where there is no room to spare, and everything the job needs travels with it. Highams Park, Woodford Green, Buckhurst Hill, Loughton and Walthamstow are on the same round, along with Waltham Abbey on the far side of the forest."],
        },
      },
    },
  },
  chiswick: {
    opening:
      "Chiswick sits in West London on a bend of the Thames, between Hammersmith and Brentford, with the A4 along its northern edge and the High Road through its centre.",
    why: "The A4 puts a steady film of road grime on everything parked near it, and the river keeps the mornings damp enough to hold it there. Neither is hard to deal with — it is finding a free hour that is hard, which is what coming to you removes.",
    areas: ["Turnham Green", "Grove Park", "Gunnersbury", "Brentford", "Hammersmith", "Acton Green", "Strand-on-the-Green"],
    services: {
      detailing: {
        heading: "Chiswick Paint, Polished Where It Is Parked",
        detail: {
          heading: "Gravel, Trees and Traffic Film in Chiswick",
          body: [
            "Bedford Park and the streets around Grove Park have front gardens given over to gravel and hardstanding, and gravel is quietly hard on a car. Every turn onto it throws stone against the sills and the lower doors, and in dry weather the dust settles in a band along the bottom of the paint that never quite rinses clean. The mature trees on those roads work on the same panels from above.",
            "Cars that commute are collecting something else again. A run down to the Hogarth Roundabout and out along the Great West Road puts tar spots on the sills and fly on the front end in summer, and a winter of it leaves a haze that reads as flat colour rather than deep colour. Detailing goes at that in order — decontamination, then machine polishing to take the swirls and the dullness out, then a sealed finish — on the drive or at the kerb down at Strand-on-the-Green.",
          ],
        },
        faq: {
          q: "Do you need a driveway, or is a permit bay near Turnham Green fine?",
          a: ["A permit bay is fine, and a good deal of the work here is done in one. The narrower roads off the High Road and around Turnham Green are no obstacle as long as the van can stand near the car. Gunnersbury, Acton Green and Brentford are on the same round, and a workplace car park is just as workable as a drive."],
        },
      },
    },
  },
  ealing: {
    opening:
      "Ealing sits in West London between Acton and Hanwell, a borough of wide avenues and parkland that has been called the Queen of the Suburbs for a century.",
    why: "The tree-lined roads that earned it the name are also what covers the cars beneath them, and sap does not come off with a rinse. A mobile round treats it properly on the drive, before it has time to etch into the lacquer.",
    areas: ["West Ealing", "Acton", "Hanwell", "Northfields", "Perivale", "Greenford", "Southall", "Pitshanger"],
    services: {
      detailing: {
        heading: "Two Kinds of Mile in Ealing",
        detail: {
          heading: "What the Hanger Lane Crawl Costs Ealing Paint",
          body: [
            "An Ealing car does one of two things with its week. Either it is out on the Uxbridge Road and round the gyratory at Hanger Lane, collecting brake dust in the crawl and tar along the sills on Western Avenue, or it barely moves at all — parked on an avenue in Pitshanger or Northfields, taking whatever the trees above it drop. The two look nothing alike up close, and both end in the same flat finish.",
            "Neither is a washing problem by the time it shows. What has bonded into the lacquer has to come off it, and the swirls underneath — most of them put there by roller washes over the years — have to be polished down rather than filled in. That is the order of a detail: decontaminate, correct, protect, so the colour comes back and holds for a while. Perivale, Greenford and Hanwell are the same call as the Broadway.",
          ],
        },
        faq: {
          q: "Is Greenford on the round, or only the Ealing Broadway side?",
          a: ["Greenford is on it, and so are Perivale, Hanwell, Southall, Acton and Northfields. Where the car is standing matters more than which of them it is in: a drive in Pitshanger, a bay on a West Ealing terrace or a car park on one of the estates off Western Avenue are all somewhere the van can set up, because it arrives with its own water and power."],
        },
      },
    },
  },
  /*
    Edgware, Golders Green and Harrow were the three places on the client's
    list with no entry here, because all three carry mirror pages only and
    this file was written for the pages that had no source at all. They are
    here now so those pages can have the districts row every other location
    page shows.
  */
  edgware: {
    opening:
      "Edgware sits at the top of Barnet in north-west London, at the end of the Northern line, where the A5 runs straight up Watling Street towards the Hertfordshire boundary.",
    why: "It is a suburb of semis, driveways and station parking, with a trunk road down the middle of it — so cars here collect road film steadily and then sit still all week in it. There is nearly always room to work beside one, which is the only thing a mobile round asks for.",
    areas: ["Burnt Oak", "Mill Hill", "Canons Park", "Stanmore", "Queensbury", "Colindale", "Hendon", "Elstree"],
  },
  enfield: {
    opening:
      "Enfield is the northernmost of the London boroughs, running from Southgate and Palmers Green up past the town centre to the Hertfordshire boundary, with the A10 through it.",
    why: "It is mostly suburban, which means driveways, and driveways mean the van can work properly beside the car. That is the whole requirement — everything else it brings with it.",
    areas: ["Southgate", "Palmers Green", "Winchmore Hill", "Edmonton", "Bush Hill Park", "Cockfosters", "Oakwood", "Enfield Lock"],
    services: {
      detailing: {
        heading: "Enfield Paint Between the Parks and the A10",
        detail: {
          heading: "Bringing an Enfield Finish Back to Depth",
          body: [
            "The borough splits in two along the A10. On the eastern side, Edmonton, Ponders End and the industrial ground at Brimsdown put lorry traffic and brake dust on everything parked near them, and that dust is not inert — the iron in it embeds in paint and rusts there, which is what the orange specks on a white car are. The North Circular through Edmonton does the same at a larger scale.",
            "West of it the problem changes shape. Cars at Southgate, Winchmore Hill and Oakwood sit under the canopy that runs out of Trent Park and Grovelands, so the marks are sap, leaf tannin after rain and bird lime instead. Detailing handles either: the bonded fallout comes off chemically, the lacquer is machine polished until the finish has depth in it rather than a grey cast, and it is sealed so the next season sits on the surface instead of in it.",
          ],
        },
        faq: {
          q: "Do you cover the whole of Enfield, up to the M25?",
          a: ["Southgate, Palmers Green and Winchmore Hill are on the round, and so are Edmonton, Bush Hill Park and Enfield Lock over towards the Lee. North of the town centre, Forty Hill, Clay Hill and Crews Hill are all within it, up to the motorway and across to Cockfosters and Oakwood. A drive, a shared bay or a workplace car park all work, since nothing is needed from the building."],
        },
      },
    },
  },
  finchley: {
    opening:
      "Finchley sits in Barnet in North London, between Golders Green and Whetstone, with the North Circular along its southern edge and the A1 running north out of it.",
    why: "A car kept on a Finchley street spends its week under plane trees and beside a busy road, which is a combination that dulls paint faster than mileage does. Regular attention where it is parked is what keeps ahead of it.",
    areas: ["North Finchley", "East Finchley", "Church End", "Whetstone", "Golders Green", "Muswell Hill", "Woodside Park"],
    services: {
      detailing: {
        heading: "Paint Correction at a Finchley Address",
        detail: {
          heading: "Finchley Streets and the Marks They Leave",
          body: [
            "Most of what dulls a car here arrives without anyone noticing it. A morning off the Dollis Brook leaves the panels damp, the day dries them where they stand, and each time that happens a little more of what was in the water is left behind on the paint. Add the film that drifts off Henlys Corner and settles on the streets around Church End, and a bonnet that is washed regularly can still read flat rather than glossy.",
            "Detailing is where that gets dealt with rather than covered over. The bonded film comes off first, then the paint is machine polished so the colour has depth in it again, and it is sealed afterwards so the next few months are easier. The 1930s semis around Woodside Park and Nether Street usually have enough drive to walk right round the car; on the terraced streets off Ballards Lane there is no drive at all, and the bay the car is already in does perfectly well.",
          ],
        },
        faq: {
          q: "Can you detail a car parked on a Finchley side street?",
          a: ["Yes, and a fair number of them are. A resident’s bay on one of the roads off Regent’s Park Road or East End Road gives enough room to work, and so does an office car park, or a station bay where the car is left all day. The van is self-contained for water and power, so the only thing an address has to offer is somewhere for the car to stand."],
        },
      },
    },
  },
  fulham: {
    opening:
      "Fulham sits on the north bank of the Thames between Chelsea and Putney Bridge, a grid of Victorian terraces with the Fulham Road and the New King’s Road through it.",
    why: "Every street here is permit-parked and most houses have no drive at all, so the nearest hand wash means giving up the space you queued for. The van works at the kerb instead, which is the only version of this that does not cost you the parking.",
    areas: ["Parsons Green", "Fulham Broadway", "Sands End", "West Brompton", "Putney Bridge", "Hammersmith", "Chelsea Harbour"],
    services: {
      detailing: {
        heading: "Fulham Paintwork, Done Where the Car Parks",
        detail: {
          heading: "What a Permit Bay Costs a Fulham Car",
          body: [
            "A car in a Fulham bay takes two different lives on its two sides. The offside sits out in the traffic on Wandsworth Bridge Road or Munster Road and collects everything thrown off a wheel; the nearside sits under whatever the pavement has, which on the roads beside Bishops Park and Eel Brook Common means bird lime through the summer and leaf mulch through the autumn. Neither side comes off with a sponge once it has had time to bond.",
            "Etching from bird lime and the fine haze that builds up under years of quick washes are both paint problems rather than dirt problems, and both are worked out with a machine polish. After that the finish is protected, which is the part that matters most to a car with nowhere indoors to go. The work is set up in whatever space the car occupies — a bay off Parsons Green Lane, a residents’ space in Sands End, or an underground level at one of the riverside blocks.",
          ],
        },
        faq: {
          q: "Do you cover Sands End and the riverside blocks by Chelsea Harbour?",
          a: ["Yes, along with Parsons Green, Fulham Broadway, West Brompton and the streets running down to Putney Bridge. An underground or gated level is worked in the same way as a street bay, with the car left where it is parked. The only thing such a space usually needs is somebody able to let the van through the barrier; everything else the job takes arrives with it."],
        },
      },
    },
  },
  "golders-green": {
    opening:
      "Golders Green sits in Barnet in north-west London, where the Finchley Road comes up from Hampstead towards Hendon, with Temple Fortune above it and Brent Cross a mile west.",
    why: "Much of it is mansion-block flats with a shared forecourt and no tap in sight, and the rest is tree-lined streets that fill up by evening. Either way the car is easier to deal with where it stands than anywhere you could drive it to.",
    areas: ["Temple Fortune", "Hampstead Garden Suburb", "Childs Hill", "Brent Cross", "Hendon", "Cricklewood", "Finchley Road", "Hampstead"],
  },
  hammersmith: {
    opening:
      "Hammersmith sits in West London where the A4 meets the river, with the flyover above it, Chiswick to the west and Shepherd’s Bush to the north.",
    why: "It is one of the busiest road junctions in the capital, and cars parked in the streets around it wear that traffic — brake dust, tyre film and a grit that settles overnight. All of it lifts cleanly enough if it is not left for months.",
    areas: ["Brook Green", "Shepherd’s Bush", "Ravenscourt Park", "Barons Court", "Chiswick", "Fulham", "White City"],
    services: {
      detailing: {
        heading: "Detailing Around the Hammersmith Traffic",
        detail: {
          heading: "Why Hammersmith Cars Lose Their Depth",
          body: [
            "The damage that shows on paint here is rarely the dirt itself. It is what happens next: a driver runs a cloth over a dusty wing before setting off down Talgarth Road, and the grit that was sitting on it goes into the lacquer as a ring of fine scratches. Do that on a dark car for a couple of winters and the panel stops reflecting properly. Under the lights on King Street it looks hazy rather than deep.",
            "Correction is what takes it back out again. The paint is decontaminated first, then machine polished in stages until the marks are out of the clear coat rather than filled over, and sealed so the next few months of dust sit on top of the protection instead of in the paint. It is done where the car is: a resident’s bay on a street beside Ravenscourt Park, a rear yard behind a Brook Green mansion block, or a space at work.",
          ],
        },
        faq: {
          q: "Which areas around Hammersmith do you come out to?",
          a: ["Brook Green, Ravenscourt Park, Barons Court and Shepherd’s Bush are all on the same round, and so are Chiswick and the northern edge of Fulham. The awkward part of this corner of London is not the distance but the room to work, so a quiet side street off the Goldhawk Road is often easier than somewhere closer to the Broadway, where the traffic never lets up."],
        },
      },
    },
  },
  harrow: {
    opening:
      "Harrow sits in north-west London between Wembley and Watford, with the school and the old village on the hill above the town centre and Wealdstone, Kenton and Rayners Lane around it.",
    why: "It is a borough of interwar suburb — long drives, deep front gardens and a great many trees — so there is room to work beside a car and plenty on it to remove. Sap and leaf fall are the local problem, and both are far easier to lift before a season has set them.",
    areas: ["Harrow on the Hill", "Wealdstone", "North Harrow", "South Harrow", "Rayners Lane", "Kenton", "Pinner", "Stanmore"],
  },
  hayes: {
    opening:
      "Hayes sits in Hillingdon in West London, on the Uxbridge Road between Southall and Uxbridge, with the Grand Union Canal and a good deal of industry beside it.",
    why: "There are more vans and work vehicles parked here than in most of London, and a working vehicle is judged on how it looks when it arrives. Cleaning it at the yard or the house means it never loses a working hour to the trip.",
    areas: ["Hayes End", "Yeading", "Harlington", "Southall", "West Drayton", "Northolt", "Uxbridge"],
    services: {
      detailing: {
        heading: "A Detail Booked to a Hayes Address",
        detail: {
          heading: "Industrial Fallout on Hayes Paintwork",
          body: [
            "The rail line through Hayes and Harlington and the estates either side of it put a particular kind of dirt on a car: fine metal particles, thrown off brakes and rails, which land while the paint is warm and sit there. On a light-coloured car they show a few weeks later as rust-coloured specks that will not wash off, because by then they are in the clear coat rather than on it.",
            "A detail starts by drawing that out chemically and then taking the surface back to smooth, which is the only way the polish afterwards does anything lasting. The finish is sealed at the end so the next round of grit off the A312 has something to sit on. Room is rarely the problem in this part of Hillingdon — a yard, a forecourt or a drive at Hayes End or Yeading all give space to walk round the car, and nothing is drawn from the building.",
          ],
        },
        faq: {
          q: "Do you come out to the industrial estates around Hayes and Harlington?",
          a: ["Yes, and to the yards and business parks along North Hyde Road and towards West Drayton as well. A car or a van standing on a unit’s forecourt for the working day is a straightforward place to work, since it is not going anywhere and there is usually room on all four sides. Houses at Hayes End, Yeading and Harlington are the same arrangement, only in a drive."],
        },
      },
    },
  },
  islington: {
    opening:
      "Islington runs north from the edge of the City through Angel and Upper Street to Highbury and Archway, a borough of Georgian terraces and almost no off-street parking.",
    why: "The parking here is permit-controlled and hard won, so leaving a bay to sit in a queue somewhere is a poor trade. The van comes to the bay, brings its own water and power, and the space is still yours afterwards.",
    areas: ["Angel", "Upper Street", "Highbury", "Canonbury", "Archway", "Barnsbury", "Finsbury Park", "Clerkenwell"],
    services: {
      detailing: {
        heading: "Machine Polishing on an Islington Street",
        detail: {
          heading: "What Standing Still Does in Islington",
          body: [
            "An Islington car does very little mileage and a great deal of standing, and standing is when paint takes its worst punishment. A bay under the planes on one of the Barnsbury squares collects sap and bird lime for a fortnight at a time, and both of those etch a clear coat in warm weather. Add the dust that drifts off a basement dig or a scaffolded front — there is almost always one on the street — and the car collects a gritty film it cannot shed.",
            "Etching is not dirt, so it does not come off in a wash; it is taken out of the lacquer by machine, in stages, and the paint is sealed afterwards so the next month of lime sits on the protection instead. The streets here are narrow and the bays are tight, which changes the order things are done in rather than whether they can be done at all — the work moves round the car in the space it already occupies, from Canonbury and Highbury down to Clerkenwell.",
          ],
        },
        faq: {
          q: "Can you work on a narrow terraced street in Islington?",
          a: ["Yes. Most of the borough is exactly that — Barnsbury, Canonbury, the roads off Liverpool Road and Essex Road — and the work is set up within the car’s own bay rather than spreading across the carriageway. The van parks close by and brings water and power with it, so no hose crosses a pavement and nothing has to come out of a flat three floors up."],
        },
      },
    },
  },
  kensington: {
    opening:
      "Kensington sits in west-central London around High Street Kensington and the museums, with Holland Park to the west, Notting Hill north and Chelsea south.",
    why: "Garden squares and mews mean narrow access and permit bays, and the cars kept in them are usually worth doing properly. Both point the same way: the work comes to the car, and it is done by hand where it stands.",
    areas: ["South Kensington", "Holland Park", "Notting Hill", "Earl’s Court", "Knightsbridge", "Chelsea", "Bayswater"],
    services: {
      detailing: {
        heading: "Detailing Cars That Rarely Leave Kensington",
        detail: {
          heading: "Dark Paint on a Kensington Square",
          body: [
            "Black, navy and the darker metallics are the house colours around here, and they are the hardest finishes to keep looking like anything. Every swirl a sponge ever put in one is visible the moment the sun comes over the terrace, which on the streets off Kensington Church Street and around the garden squares is only a narrow part of the day. A silver car forgives that. A black one records all of it.",
            "The other thing working against paint here is time rather than mileage. A car that goes out rarely sits through everything the trees over the square drop on it, and a fortnight of that on a warm panel marks a clear coat for good. Cromwell Road adds the film that any four-lane road adds. A detail lifts the bonded contamination away, machine polishes the finish back to an even gloss, and seals it, which is what makes the next few months survivable.",
          ],
        },
        faq: {
          q: "Which streets around Kensington do you reach — Holland Park, Earl’s Court, Bayswater?",
          a: ["All of those, along with South Kensington, Notting Hill and the Chelsea side of the boundary. Access is the thing worth checking rather than distance: a resident’s bay on a wide street is straightforward, a cobbled mews with a car at each end is tighter but workable, and a gated or underground space only needs whoever holds the entry code to know the visit is happening."],
        },
      },
    },
  },
  knightsbridge: {
    opening:
      "Knightsbridge sits between Hyde Park and Belgravia, on the Westminster and Kensington boundary, with Sloane Street and Brompton Road running through it.",
    why: "Almost all of the parking here is underground or permit-controlled, and neither comes with a tap. A self-contained van is the only way to clean a car properly without taking it out of the building it lives in.",
    areas: ["Belgravia", "Brompton", "Hyde Park", "South Kensington", "Sloane Street", "Chelsea", "Mayfair"],
    services: {
      detailing: {
        heading: "Polishing a Car in a Knightsbridge Garage",
        detail: {
          heading: "Strip Lights and Knightsbridge Paintwork",
          body: [
            "A car that lives in a basement bay is only ever seen under a strip light, and a strip light is the most forgiving illumination there is. Flat, even, directly overhead: it shows the colour and almost none of the marks in it. Take the same car out onto Brompton Road on a clear morning and the whole of the last few years is on the bonnet at once — swirls, wipe marks, a dull ring where a badge is cleaned around.",
            "Very little of it comes off the road. A cover dragged on and off a fortnight of settled dust, or a duster run over a dry panel in a hurry, puts more into a finish than a week of driving would. That comes out by machine, gradually, and the paint is sealed afterwards. Low ceilings and tight bays in the blocks around Lowndes Square and Pont Street change how the work is laid out, not whether the car has to be moved for it.",
          ],
        },
        faq: {
          q: "Can you work in an underground car park under a Knightsbridge block?",
          a: ["That is where a good many of these cars live, and it is the easiest place to work in some ways: no wind, no rain, no sun moving across a panel. What matters is headroom and the ramp, so it is worth saying which level the bay is on when you book. Entry systems and whoever holds the fob are the usual things to arrange in advance."],
        },
      },
    },
  },
  "north-london": {
    opening:
      "North London covers the ground from Camden and Islington up through Haringey and Barnet to Enfield, taking in Finchley, Highgate and Muswell Hill on the way.",
    why: "It is two kinds of parking in one half of the city — permit bays in the inner boroughs, drives further out — and a mobile round is the one arrangement that works in both, because it only needs the space the car is already in.",
    areas: ["Camden", "Islington", "Haringey", "Barnet", "Finchley", "Highgate", "Muswell Hill", "Enfield"],
    services: {
      detailing: {
        heading: "A Mobile Detail Anywhere in North London",
        detail: {
          heading: "Winter Salt Across North London",
          body: [
            "Winter does most of the damage in this half of the city. The gritters run the A406, the A1 up through Archway and the A10 out to Enfield, and the salt that comes off those roads goes everywhere on a car — into the arches, along the sills, and in a fine grey haze over the paint that dries on and stays. On the hills at Highgate, Muswell Hill and Crouch End the brakes work harder on the way down, so there is more iron in it as well.",
            "Salt is not the thing that ruins a finish on its own; it is what it leaves behind once it has dried on and been washed over a dozen times. A detail strips that back, machine polishes the paint so the colour reads properly again, and puts a layer of protection on top, which is what makes the following winter come off rather than stick. It is the same work in Camden as it is in Enfield, with the car left exactly where it was parked.",
          ],
        },
        faq: {
          q: "Which parts of North London do you cover for detailing?",
          a: ["Coverage runs from the Camden and Islington end out to the North Circular and beyond it, so Crouch End, Wood Green, Southgate, Whetstone and the Enfield side of the A10 are all reachable. The only thing that changes across that spread is where the car is standing when the work starts — a permit bay, a station car park, a space at an office or a drive at home are all workable."],
        },
      },
    },
  },
  "north-west-london": {
    opening:
      "North-West London runs from St John’s Wood and Kilburn out through Brent and Harrow towards Stanmore, with the A5 and the North Circular crossing it.",
    why: "The arterial roads through it carry traffic all day, and the streets either side of them collect the film that comes off it. That is a straightforward job when it is done regularly and a much bigger one when it is not.",
    areas: ["Kilburn", "Willesden", "Wembley", "Harrow", "Edgware", "Stanmore", "Hendon", "Cricklewood"],
    services: {
      detailing: {
        heading: "Machine Polishing Across North West London",
        detail: {
          heading: "Why North West London Paint Goes Flat",
          body: [
            "A car that crosses Staples Corner twice a day picks up more than dirt. Iron from brake pads, tar thrown off resurfaced carriageways and the grit that comes with both bond into the surface of the lacquer, and once they have, washing does nothing: the paint stays flat to look at and slightly rough to the hand. Lifting that out is the first half of a detail, and it has to happen before any polishing, or the machine only drags it about.",
            "The second half is the light. Once the surface is clean a machine polish takes the haze out of it, and a dark car in Kilburn or Cricklewood, parked nose to tail under a street lamp, is where that shows most. Out at Edgware and Stanmore the problem is above the car instead: those interwar streets were laid out with trees along them, and eighty years on the trees are directly over the drives. A sealed finish is what gives time to get sap and bird lime off before they etch.",
          ],
        },
        faq: {
          q: "Can you detail a car in a resident’s bay in Kilburn?",
          a: ["Yes, and a good deal of the work in Kilburn, Willesden and Cricklewood happens exactly there, in the bay the car already occupies. A drive at Stanmore, Edgware or Hendon gives more room to walk round, which helps on a long job, but it is not a condition of booking. A workplace car park is the same again. The van carries its own water and power, so nothing comes out of the flat."],
        },
      },
    },
  },
  northwood: {
    opening:
      "Northwood sits at the north-western edge of Hillingdon on the Metropolitan line, next to Rickmansworth and the Hertfordshire border, with a great deal of green around it.",
    why: "It is a commuter suburb of long drives and mature trees, which is the best possible ground for a mobile service and the worst for paintwork left alone: sap, leaf fall and a car that only moves twice a day.",
    areas: ["Northwood Hills", "Pinner", "Ruislip", "Rickmansworth", "Eastcote", "Moor Park", "Harefield"],
    services: {
      detailing: {
        heading: "Paint Correction on a Northwood Drive",
        detail: {
          heading: "Shade, Damp and Northwood Paintwork",
          body: [
            "Copse Wood and Park Wood come right up to the edge of Northwood, and Batchworth Heath sits just over the border, so a great many cars here spend the day in shade. A surface in shade stays wet for hours after the rain has stopped, and anything already on it — honeydew off the limes, bird lime, the dust that comes down with both — stays wet with it and keeps working at the clear coat rather than drying and blowing off.",
            "That is why a detail here is more than a polish. The surface is decontaminated first, then machine polished to take out the marks that have gone in over the years, then sealed so the next lot of sap sits on top of the protection instead of in the paint. It is done where the car stands — a drive at Northwood Hills, one of the private roads on the Moor Park estate, or a bay at the station end of town — with the van supplying its own water and power.",
          ],
        },
        faq: {
          q: "Do you cover Moor Park, Eastcote and the Rickmansworth side?",
          a: ["Yes. The round takes in Northwood Hills, Moor Park, Eastcote, Ruislip and Harefield, and carries on over the county line into Rickmansworth and Batchworth. A gated road or a long private drive is no obstacle — the work happens at the car, and a job on Ducks Hill Road is set up the same way as one behind the shops on Green Lane."],
        },
      },
    },
  },
  "notting-hill": {
    opening:
      "Notting Hill sits in west London between Holland Park and Westbourne Grove, built around Portobello Road and a run of stucco terraces and garden squares.",
    why: "Parking is permit-only and the streets are busy with market traffic for half the week, so taking a car out to be cleaned is a decision you regret on the way back. The van works in the residents’ bay instead.",
    areas: ["Portobello Road", "Holland Park", "Westbourne Grove", "Ladbroke Grove", "Kensal Green", "Bayswater", "Shepherd’s Bush"],
    services: {
      detailing: {
        heading: "Notting Hill Paint, Corrected in Place",
        detail: {
          heading: "Why Notting Hill Cars Show Every Swirl",
          body: [
            "Dark colours are common on these streets, and dark paint is the least forgiving finish to keep in a city. Every wash puts a few fine marks into the lacquer, and after enough of them the marks read as a haze lying over the colour rather than as scratches. Low sun down a stucco terrace shows it immediately, and so does a street lamp on a wet evening. Polishing is the only thing that takes it out, and it is slow work.",
            "Working on a car that is boxed into a bay takes a different setup from a drive, and that is the normal case here: a length of kerb on Lansdowne Road or Chepstow Villas, a mews behind a terrace, or an underground bay beneath one of the newer blocks. None of it changes the sequence. The paint is decontaminated, corrected and then sealed, so that the film the street lays down over the following months sits on the protection rather than in the clear coat.",
          ],
        },
        faq: {
          q: "Can you work in an underground car park off Ladbroke Grove?",
          a: ["Underground bays are workable where there is room to open the doors and get round the car, and the van’s own water and power mean nothing has to be found on site. Street work is more common in W11 anyway: a permit bay in Ladbroke Grove, Westbourne Grove or Holland Park is the usual place for it, and Kensal Green, Bayswater and Shepherd’s Bush are all on the same round."],
        },
      },
    },
  },
  "park-royal": {
    opening:
      "Park Royal straddles the Brent and Ealing boundary beside the A40, one of the largest business and industrial estates in the capital, with Acton and Willesden either side.",
    why: "Most of what is parked here works for a living — vans, fleet cars and light commercials — and a working vehicle cannot spare the half day it takes to be driven somewhere and waited on. Cleaning it at the unit is the only version that costs nothing.",
    areas: ["Acton", "Willesden", "Alperton", "Harlesden", "Wembley", "Greenford", "North Acton"],
    services: {
      detailing: {
        heading: "Detailing Working Vehicles at Park Royal",
        detail: {
          heading: "Dust, Miles and Park Royal Bodywork",
          body: [
            "A vehicle that lives in a yard off Coronation Road or Abbey Road is outside every hour it is not being driven, and it is the flat panels that give first. Roof and bonnet go chalky while the doors still look reasonable, because those are the surfaces taking the sun, the dust off the yards around them and everything the lorries drag in and out of the estate. With Old Oak Common being rebuilt a mile to the south-east, there is more of that about than usual.",
            "Machine polishing is what brings the colour back out of a panel in that state, and sealing it afterwards is what keeps the next year of A40 brake dust and Hanger Lane traffic film on the surface rather than in it. A sealed panel also comes clean with less work, which matters more across a fleet than on one car. The work is done in the yard or the car park, in the bay the vehicle already stands in, with nothing drawn from the unit.",
          ],
        },
        faq: {
          q: "Do you work on vehicles parked at units around Park Royal?",
          a: ["Yes, and the estate is the usual case rather than the exception. A yard off Park Royal Road, a marked bay at one of the business parks along Western Avenue, or a space at the back of a unit in Alperton or Harlesden all work, provided the vehicle can stand still for the length of the job. Acton, Willesden, Greenford and Wembley sit on the same round."],
        },
      },
    },
  },
  pinner: {
    opening:
      "Pinner sits in Harrow in north-west London, on the Metropolitan line between Harrow and Northwood, with a village high street and a great deal of interwar suburb around it.",
    why: "Almost every house here has a drive and a tree over it, which is a good arrangement for everything except paintwork. Treating sap and leaf fall where the car is parked, before it has set, keeps it from becoming a machine-polishing job.",
    areas: ["Hatch End", "Northwood Hills", "Rayners Lane", "Eastcote", "Harrow", "North Harrow", "Ruislip"],
    services: {
      detailing: {
        heading: "Restoring Depth to Pinner Paintwork",
        detail: {
          heading: "Where a Pinner Car Fades First",
          body: [
            "Pinner grew along the Metropolitan line between the wars, and the layout of those streets means a great many cars stand on the same patch of drive, facing the same way, for years at a time. Paint fades from the top down. The roof, the bonnet and the upper half of the boot lid take the sun while the doors are shaded by the house or the hedge, so the car ends up two shades of the same colour, most obvious on reds and dark blues.",
            "Oxidised paint of that kind responds to machine work better than most people expect: the dullness is in the top of the clear coat, and taking a very little of it off levels the surface again and lets the colour read properly. Sealing it afterwards is what slows the next round of it down. All of that happens on the drive — Hatch End, North Harrow, Rayners Lane, Eastcote — with the car left where it normally sits and the van bringing its own water and power.",
          ],
        },
        faq: {
          q: "Can you detail a car on a narrow drive in Pinner?",
          a: ["Most of them are narrow, and it is rarely a problem: what matters is room to open one door fully and walk down each side, which a standard 1930s drive gives. Where a car is tight against a fence, it is usually enough to pull it forward or back a couple of feet. Kerbside in Pinner village or at Hatch End is workable too, and so is a space at work."],
        },
      },
    },
  },
  preston: {
    opening:
      "Preston sits on the Brent and Harrow boundary in north-west London, around Preston Road station, between Wembley and Kenton — not the Lancashire city of the same name.",
    why: "It is a suburb of semis and short drives, close enough to the North Circular that the traffic film reaches it and far enough out that most cars sit still all week. Both are easier to deal with on the drive than anywhere else.",
    areas: ["Wembley", "Kenton", "Harrow", "Sudbury", "Northwick Park", "Kingsbury", "North Wembley"],
    services: {
      detailing: {
        heading: "Preston Road Cars, Polished at Home",
        detail: {
          heading: "What Puts Swirls in Preston Paint",
          body: [
            "Most cars here are washed at home, on a short drive between the bay window and the pavement, and that is where the fine circular marks in the lacquer come from — a sponge, one bucket and the grit already on the panel. Every pass moves whatever was on the paint across the paint. On silver it hides well. On black or dark blue it gathers under a low sun and reads as a dull ring over each panel.",
            "Correcting it means taking the top of the clear coat back flat with a machine, slowly and panel by panel, and then sealing what is underneath so the next few months of washing do less damage. That matters more here than it sounds. Preston Road sits close enough to Wembley that event days fill the side streets between here and Kenton with parked cars for hours at a time, and a sealed surface sheds the dust and lime that come with a crowded street instead of holding them.",
          ],
        },
        faq: {
          q: "Which streets around Preston Road station do you cover?",
          a: ["All of them, and the surrounding area with it: North Wembley, Sudbury, Kenton, Northwick Park and Kingsbury are on the same round as Preston itself. A short drive, a hardstanding in front of a bay window or a kerbside space outside the house are all workable, and on an event day it is usually simpler to park the car on the drive the night before. The van needs nothing from the house."],
        },
      },
    },
  },
  putney: {
    opening:
      "Putney sits on the south bank of the Thames opposite Fulham, with the High Street running down to the bridge, Putney Heath above it and Wandsworth to the east.",
    why: "River mornings keep cars damp here well into the day, and damp holds dirt against the paint rather than letting it blow off. Regular attention at the address is worth more than an occasional heavy clean.",
    areas: ["East Putney", "Roehampton", "Barnes", "Wandsworth", "Southfields", "Putney Heath", "Fulham"],
    services: {
      detailing: {
        heading: "Paint Correction in Putney and Roehampton",
        detail: {
          heading: "The Orange Specks on Putney Paintwork",
          body: [
            "Putney High Street runs bus after bus down to the bridge, and every set of brakes on them sheds hot iron. The particles land on whatever is parked nearby, embed themselves in the lacquer and then rust in place, which is what those tiny orange flecks on a white or silver car actually are. The same thing happens along the Upper Richmond Road and up the hill towards Tibbet’s Corner, where the traffic is heavy and slow.",
            "A detail starts by dissolving that out of the surface rather than polishing over the top of it, then takes the lacquer back to an even finish and seals it. Where it happens is a matter of what the street allows: a permit bay in the terraces off the Lower Richmond Road, the forecourt of a mansion block by the Embankment, a garage court on one of the Roehampton estates, or a space at work in Wandsworth. The van is self-contained, so the address makes little difference.",
          ],
        },
        faq: {
          q: "Are Southfields, East Putney and Roehampton on the same round?",
          a: ["Yes — East Putney, Southfields and Roehampton are all inside it, along with Putney Heath, Barnes and Wandsworth. The work is set up around whatever space the address has, so a tight bay on a Victorian terrace is as ordinary as a drive. The only real requirements are that the car can stand still for the length of the job and that there is room to walk round it."],
        },
      },
    },
  },
  "richmond-upon-thames": {
    opening:
      "Richmond upon Thames sits on the river in south-west London, with the park above the town, Twickenham across the water and Kew and Barnes downstream.",
    why: "The park and the riverside are the reason people live here and the reason their cars are permanently under something — deer-cropped dust in summer, leaf mould in autumn, damp all winter. It is a place that rewards being seen to often.",
    areas: ["Twickenham", "Kew", "Barnes", "East Sheen", "Ham", "Petersham", "St Margarets", "Mortlake"],
    services: {
      detailing: {
        heading: "Gloss Work Across Richmond upon Thames",
        detail: {
          heading: "Hard Water and Richmond upon Thames Paint",
          body: [
            "London sits on chalk and the water that comes out of a hose here is hard, which is why a car dried by the sun rather than by a cloth ends up with rings on it. Under the trees along Petersham Road or around the edges of the park the sun comes through in patches, so one half of a bonnet flashes dry while the other is still wet. What is left behind is a mineral deposit, and by August it has bitten into the clear coat.",
            "Light spotting comes off with the right chemistry; anything that has etched has to be polished out, which is machine work and the reason a detail takes the time it does. Sealing afterwards changes how the next rain behaves on the panel, so it beads and runs off instead of sitting and drying in place. The work is done at the address — a drive in East Sheen, a permit bay in St Margarets or Mortlake, a space at Kew — with the van carrying its own water and power.",
          ],
        },
        faq: {
          q: "Can you get a van down the narrow streets near Richmond Green?",
          a: ["The streets around the Green and the lanes off them are tight, and the practical answer is that the car is worked on where it stands while the van stops wherever it can. That is the ordinary arrangement on Richmond Hill and in the older parts of Twickenham and St Margarets too. Ham, Petersham, Kew, Barnes, Mortlake and East Sheen are more straightforward, and all of them are inside the area covered."],
        },
      },
    },
  },
  ruislip: {
    opening:
      "Ruislip sits in Hillingdon in north-west London, between Northwood and Uxbridge, with Ruislip Woods on one side and the A40 within easy reach on the other.",
    why: "It is a suburb of driveways and garages backing onto woodland, so there is room to work and plenty for the work to remove. Doing it where the car lives is simply less trouble than the alternative.",
    areas: ["South Ruislip", "Ruislip Manor", "Eastcote", "Ickenham", "Northolt", "Uxbridge", "Northwood"],
    services: {
      detailing: {
        heading: "Under the Oaks at Ruislip",
        detail: {
          heading: "Machine Polishing on a Ruislip Drive",
          body: [
            "Ruislip is ringed by ancient woodland — Park Wood, Copse Wood and Mad Bess Wood are all within a mile or two of the High Street — and oak, lime and hornbeam all shed something onto whatever is parked beneath them. Honeydew comes off the limes in summer and sets hard in a day of sun; leaf fall and bird lime follow in autumn. None of it rinses off once it has had a week to bond into the lacquer.",
            "The other half of it arrives on the move. West End Road and the A40 a little further south hold the stop-start traffic that lays iron and traffic film into the paint, and it settles lowest down, along the sills and the backs of the wheel arches. Detailing takes that off properly and then works the finish back with a machine polish, so the lacquer is clear before anything is sealed over the top of it.",
          ],
        },
        faq: {
          q: "Do you cover South Ruislip and Eastcote as well as Ruislip?",
          a: ["Yes — Ruislip Manor, South Ruislip and Eastcote are all on the round, along with Ickenham, Northolt, Northwood and Uxbridge. Most of the housing here has a drive or a garage apron with room to work around the car, and where it does not, a kerbside space or a workplace car park does the job. Everything the work needs comes on the van, water and power included."],
        },
      },
    },
  },
  stanmore: {
    opening:
      "Stanmore sits at the top of Harrow at the end of the Jubilee line, on the Hertfordshire boundary, with Belmont and Canons Park below it and open country above.",
    why: "It is the end of the line, which means station car parks full of cars that sit all day, and hillside streets under trees. Neither is a problem if the car is seen to regularly, and both compound if it is not.",
    areas: ["Canons Park", "Belmont", "Edgware", "Harrow Weald", "Bushey", "Queensbury", "Kenton"],
    services: {
      detailing: {
        heading: "Stanmore Paint, and What Etches It",
        detail: {
          heading: "Water Spots on a Stanmore Slope",
          body: [
            "Stanmore stands on one of the higher ridges in London, and the water that comes out of the taps up here is hard. A car rinsed with a hosepipe on a sloping drive off Stanmore Hill or up at Harrow Weald never dries evenly — the water runs to the lower edge of each panel and stands there until the sun gets to it, and what is left behind is a mineral ring bedded into the clear coat rather than sitting on top of it.",
            "Trees do the rest. The commons at Stanmore and Harrow Weald are oak and birch, and the streets running down towards Belmont and Canons Park are old enough to have grown a canopy over them, so resin and bird lime land on a bonnet and harden within a day or two of warm weather. A detail takes all of that off again, works the lacquer flat with a machine polish, and finishes with a layer of protection over the top.",
          ],
        },
        faq: {
          q: "Do you come up to Stanmore, Belmont and Canons Park?",
          a: ["Yes — Stanmore, Belmont, Canons Park and Queensbury are all covered, as are Edgware, Kenton, Harrow Weald and Bushey across the county line. Most of the housing up here has a drive with room to get round the car, and where a road is narrow or the drive is short, a bay at work or a space in a nearby car park does the job instead. The van carries its own water and power."],
        },
      },
    },
  },
  streatham: {
    opening:
      "Streatham sits in Lambeth in south London, strung along the A23 between Brixton and Norbury, with the common on its eastern side.",
    why: "The A23 runs through the middle of it, and the terraces either side are permit-parked with no drives to speak of. Cleaning a car at the kerb where it is parked is the only arrangement that does not cost you the space.",
    areas: ["Streatham Hill", "Streatham Common", "Norbury", "Balham", "Tulse Hill", "Brixton", "Thornton Heath"],
    services: {
      detailing: {
        heading: "High Road Grime and Streatham Lacquer",
        detail: {
          heading: "Correction Work at a Streatham Kerb",
          body: [
            "A car that lives flank-on to a main road does not weather evenly. The side facing the traffic collects the iron thrown off brake pads — buses and lorries shed a lot of it on a road that stops and starts as often as this one — and it beds into the lacquer as fine orange specks that a sponge goes straight over. The kerb side of the same car can look years younger.",
            "Off the main road it is a different problem. The terraces up Leigham Court Road and around Streatham Common are shaded for much of the day, and a panel that never dries holds whatever has landed on it against the clear coat. Taking the bonded contamination off, polishing the lacquer and sealing it resets both halves of the car, and on a dark colour the difference between the traffic side and the kerb side stops being visible at all.",
          ],
        },
        faq: {
          q: "Can you work on a car in a Streatham permit bay?",
          a: ["Yes, and most of the work here is done in one. A marked bay on a residential road off Streatham High Road gives enough space to get round the panels, and a car left in the same bay all day is easier to work on than one that has to be shuffled. Streatham Hill, Streatham Common, Streatham Vale, Norbury and Tulse Hill are all covered, and so are Balham and Brixton."],
        },
      },
    },
  },
  sudbury: {
    opening:
      "Sudbury sits in Brent in north-west London, between Wembley and Greenford, on the Harrow Road with Sudbury Hill and Sudbury Town either side of it.",
    why: "It is a suburb of semis and short drives near two busy arterial roads, so cars here collect road film steadily and quietly. There is almost always room to work beside one, which is all a mobile round asks for.",
    areas: ["Wembley", "Greenford", "Alperton", "Harrow", "Perivale", "North Wembley", "Sudbury Hill"],
    services: {
      detailing: {
        heading: "Where the Gloss Goes in Sudbury",
        detail: {
          heading: "Wembley Event Days and Sudbury Kerbs",
          body: [
            "Wembley is close enough that Sudbury feels the event days. On a stadium afternoon the residential turnings off the Harrow Road fill with cars that do not normally park there, and doors are opened alongside whatever is already standing at the kerb. What that leaves is usually a light mark in the lacquer — a scuff along a door edge, a shallow swirl at wing height — and it only really shows in direct light.",
            "The other half is simply that these cars live outdoors. The garages that came with the semis along the Harrow Road were built for far narrower cars than the ones parked outside them now, so the drive or the kerb is where the paint spends its life, through every summer of sun and every winter of grit off the main roads. A detail is the point at which all of that comes back off, the lacquer is polished flat and the finish is sealed.",
          ],
        },
        faq: {
          q: "Do you come out to Sudbury Hill, Alperton and North Wembley?",
          a: ["All three, along with Sudbury itself, Wembley, Greenford, Perivale and Harrow. A short drive off the Harrow Road is enough to work in, and where it is not, a kerbside space or a bay at work does the same job. On a stadium day the streets nearby fill early, which is worth knowing if the car is parked at the Wembley end of Sudbury."],
        },
      },
    },
  },
  twickenham: {
    opening:
      "Twickenham sits on the Middlesex bank of the Thames in south-west London, across the river from Richmond, with the stadium to the north and Strawberry Hill below.",
    why: "It is a riverside town, and riverside means damp mornings and green film on anything parked in the shade for a season. That is straightforward to remove and slow to come back once the paint has been protected.",
    areas: ["St Margarets", "Whitton", "Strawberry Hill", "Teddington", "Isleworth", "Hampton", "Richmond"],
    services: {
      detailing: {
        heading: "Between the River and the Stadium in Twickenham",
        detail: {
          heading: "Stadium Days and Twickenham Street Parking",
          body: [
            "The river brings birds, and birds are what actually marks paint here. A car left on the roads by the towpath at St Margarets or below Radnor Gardens takes gull and goose lime rather than the odd pigeon’s, and there is a great deal more of it. It is acidic, it goes off in warm weather, and a week of July sun on a bonnet is enough for it to etch a mark into the lacquer that washing will not take out.",
            "Match days are the other thing the calendar does to a car here. The streets between the ground and the station fill for an afternoon, cars park nose to tail on roads that are half empty the rest of the week, and doors and bags find the panels that are nearest. A machine polish takes the etching and the light scratching out together, and the protection that goes on afterwards is the part that matters through a wet winter by the river.",
          ],
        },
        faq: {
          q: "Do you work in Whitton and Strawberry Hill as well as Twickenham?",
          a: ["Both, and St Margarets, Teddington, Hampton, Isleworth and Richmond across the bridge. Most of the housing on this side of the river has either a drive or a residents’ bay, and either is enough to work in. On a match day the roads close to the ground are restricted, so a car parked over at Strawberry Hill or Teddington is often the easier one to reach that afternoon."],
        },
      },
    },
  },
  uxbridge: {
    opening:
      "Uxbridge sits at the western edge of London in Hillingdon, at junction 1 of the M40, with Cowley and Hillingdon beside it and Buckinghamshire across the Colne.",
    why: "It is where the motorway starts, and the cars kept here do motorway miles — which means tar on the sills and fly on the front rather than ordinary dirt. Both want a proper decontamination rather than a rinse, and both can be done on the drive.",
    areas: ["Cowley", "Hillingdon", "Ickenham", "Denham", "West Drayton", "Ruislip", "Iver"],
    services: {
      detailing: {
        heading: "The Colne Valley Edge of Uxbridge",
        detail: {
          heading: "Where an Uxbridge Car Spends Its Day",
          body: [
            "Uxbridge sits low where the Colne and the canal come through, and the ground either side of them holds moisture into the middle of the morning. A car parked out at Cowley, Yiewsley or over towards Denham wets and dries every night for most of the winter, and that cycle is what does the damage: anything acidic already on the paint is live again each time, so a fortnight of small marks becomes one set of shallow etchings in the lacquer.",
            "Polishing is what takes them out, and it is the part of a detail that cannot be hurried. The bonded film comes off first, then the lacquer is worked with a machine polish until the surface is even again, then it is protected. Where that happens depends on the address — a drive on one of the interwar roads at Hillingdon, an allocated bay under one of the newer blocks near the station, or a marked space at a business park with the car standing there through the working day.",
          ],
        },
        faq: {
          q: "Do you come out as far as Denham, Iver and West Drayton?",
          a: ["Yes — the Buckinghamshire side at Denham and Iver is covered as well as Uxbridge itself, along with Cowley, Hillingdon, Ickenham, West Drayton and Ruislip. The work is done wherever the car is standing, which out here is usually a drive or a space at a business park. Nothing is needed from the building — the van turns up with its own water and power."],
        },
      },
    },
  },
  walthamstow: {
    opening:
      "Walthamstow sits in Waltham Forest in north-east London, at the top of the Victoria line, with the marshes to the west, Chingford above and Leyton below.",
    why: "Most of it is terraced and permit-parked, with the wetlands keeping the air damp on that side of the borough. The van comes to the bay with its own water, which is the only way to do the job properly without moving the car.",
    areas: ["Walthamstow Village", "Highams Park", "Leyton", "Leytonstone", "Chingford", "Blackhorse Road", "Wood Street"],
    services: {
      detailing: {
        heading: "Detailing Cars Where They Park in Walthamstow",
        detail: {
          heading: "Between Epping Forest and the Walthamstow Traffic",
          body: [
            "The streets that run up towards Epping Forest — Wood Street, Hale End and the roads around Highams Park Lake — sit under mature limes and oaks, and what falls off them in late summer does not rinse away. Sap dries hard onto a warm panel, and bird lime comes down with it. Further south it is traffic film and brake dust instead, arriving a bit at a time in the queues along Hoe Street and up Chingford Road to the Crooked Billet.",
            "None of that comes off with a rinse once it has had a week to set. The work starts by lifting the bonded film out of the paint, and only then goes to the machine — a polish to take the fine swirls out of the clear coat, which is what makes a dark car look grey under a streetlight, and a sealant over the top so the next month of sap and dust sits on the protection instead.",
          ],
        },
        faq: {
          q: "Can you get to the narrow streets around Walthamstow Village?",
          a: ["Yes. The planters and filters around Orford Road change how a van gets in, not whether it can — the work happens in the bay the car is already standing in, and nothing has to be run out of the house for it. The same goes for Wood Street, Blackhorse Road and the roads off Forest Road, and for Highams Park and Leyton either side."],
        },
      },
    },
  },
  wandsworth: {
    opening:
      "Wandsworth sits on the south bank of the Thames between Battersea and Putney, with the common to the south and the one-way system and river bridges to the north.",
    why: "It is a borough of Victorian terraces, permit bays and a great many plane trees, which between them keep cars dirty and make taking them anywhere an errand. Doing the work where the car is parked removes the errand entirely.",
    areas: ["Earlsfield", "Southfields", "Battersea", "Putney", "Balham", "Tooting", "Clapham Junction"],
    services: {
      detailing: {
        heading: "Bringing the Gloss Back to a Wandsworth Car",
        detail: {
          heading: "Short Journeys and Wandsworth Brake Dust",
          body: [
            "Most driving in this part of south London is short and slow — down Garratt Lane into Earlsfield, round the back of Clapham Junction, over to the common and home again. Short journeys are hard on a car in their own way: the wheels stay hot, brake dust lands on warm lacquer and bonds to it, and nothing ever dries off at speed the way it does on a motorway run. It shows on the arches and the sills first.",
            "That is the layer a detail takes off before anything else happens. Underneath it the finish is usually sound and dulled rather than damaged: fine swirls in the clear coat, and a flat look to a dark colour when the low winter sun comes across Wandsworth Common. Machine polishing is what puts the depth back into it, and a sealant afterwards means the next few months of dust sit on the protection rather than in the paint.",
          ],
        },
        faq: {
          q: "Which areas around Wandsworth do you come out to?",
          a: ["The borough end to end — Earlsfield and Southfields, Balham and Tooting on the far side of the common, Battersea along the river, Putney and Roehampton up the hill. Most of it is worked at the kerb, including the terraces down by the Wandle and the roads off Trinity Road and Nightingale Lane. A space at an office or a station car park is just as workable, since the van carries its own water and power."],
        },
      },
    },
  },
  watford: {
    opening:
      "Watford sits in south-west Hertfordshire between junction 5 of the M1 and junctions 19 and 20 of the M25, with Bushey, Rickmansworth and Croxley Green around it.",
    why: "It is ringed by motorway, and motorway grime is the kind that bakes on: tar along the sills, fly across the front, and a windscreen that smears in low sun. All of it is lifted properly at the address, without adding a trip to the week.",
    areas: ["Bushey", "Croxley Green", "Rickmansworth", "Abbots Langley", "Garston", "Kings Langley", "Oxhey"],
    services: {
      detailing: {
        heading: "Paint Correction at a Watford Address",
        detail: {
          heading: "What a Parked Watford Car Collects",
          body: [
            "A Watford car spends more of the week standing than moving. It sits at Watford Junction while its owner is at Euston, or in a bay off Clarendon Road through the working day, and the pleasantest streets to leave it on are the ones with limes and horse chestnuts over them — Nascot Wood, the roads down either side of Cassiobury Park, the avenues out towards Oxhey. What comes off those trees in July is sticky, and it dries onto a warm panel within the day.",
            "Underneath that, the finish on a car a few years into this is usually dull rather than damaged. Hard water is half of it — the chalk under this part of Hertfordshire leaves spots that bake in if a car dries in the sun — and the fine swirls that show in low light are put there a few at a time by forecourt brushes and grit, not by the road. A detail takes both on: decontaminated, machine polished, then sealed, so the next summer’s sap sits on the protection instead of the paint.",
          ],
        },
        faq: {
          q: "Can you detail the car at my office car park in Watford?",
          a: ["A car park is one of the easier versions of it. A bay on Clarendon Road, a space at one of the units on Watford Business Park or at Croxley Park, or the car left at Watford Junction for the day all work the same way — the car stands where it already is, and the van brings its own water and power with it. Bushey, Garston, Abbots Langley, Kings Langley and Rickmansworth are the same trip."],
        },
      },
    },
  },
  wembley: {
    opening:
      "Wembley sits in Brent in north-west London, around the stadium and the arena, with the North Circular to the south and Harrow and Sudbury either side.",
    why: "Event days fill every street and side road for a mile, and a car parked through one collects a week of grime in an afternoon. Between them, the cars here are better served by someone coming to the drive than by another queue.",
    areas: ["Wembley Park", "North Wembley", "Alperton", "Sudbury", "Preston", "Harlesden", "Kingsbury", "Tokyngton"],
    services: {
      detailing: {
        heading: "A Detail That Comes to Wembley",
        detail: {
          heading: "Industrial Dust on the Wembley Main Roads",
          body: [
            "Brent is a working borough and it shows on paintwork. Park Royal fills the south of it, Alperton’s units and yards sit along the canal, and Ealing Road carries the traffic that serves both, so cars parked anywhere near them stand in a steady drift of brake dust, tyre rubber and site dust. On the Kingsbury side it is the Welsh Harp instead, and the gulls and geese that come off the water.",
            "None of that stays on the surface for long. Metal dust from brakes lands hot and embeds itself in the lacquer, which is why a panel can feel gritty after a wash and look grey rather than black in daylight. Taking it out is a decontamination stage before any polishing starts, and the machine work afterwards is what brings the depth back. Sealing it is the part that matters most here, since it gives the next lot something to sit on.",
          ],
        },
        faq: {
          q: "Can you detail a car in a residents’ car park at Wembley Park?",
          a: ["Yes, and a fair amount of Wembley Park is exactly that now — decked and undercroft bays behind the blocks rather than driveways. The car is worked on where it sits, with the van’s own water and power, so nothing has to be carried down from a flat. Sudbury, Preston, Alperton, Tokyngton, North Wembley and Harlesden are the same, whether that means a drive or a shared bay."],
        },
      },
    },
  },
  westminster: {
    opening:
      "Westminster runs from the river at Millbank up through Victoria and Mayfair to Marylebone and the edge of Regent’s Park, taking in Soho and St James’s on the way.",
    why: "There is next to no off-street parking in any of it, and what exists is an underground bay with no tap and no socket. A self-contained van is the only way to have a car cleaned properly here without taking it out of the building.",
    areas: ["Mayfair", "Marylebone", "Victoria", "Soho", "St James’s", "Pimlico", "Belgravia", "Paddington"],
    services: {
      detailing: {
        heading: "Working on Paintwork Inside Westminster",
        detail: {
          heading: "Where a Westminster Car Is Kept",
          body: [
            "A Westminster car does very little mileage and a great deal of standing. It comes out of a bay in Pimlico or a mews behind Belgravia, does a few miles and goes back — so what dulls the paint is not the road but what settles on it while it waits: diesel soot, brake dust off the taxi traffic, and the fine grit that comes off scaffolding and stonework in Mayfair and Marylebone.",
            "The squares are the other half of it. The planes in Berkeley Square and St James’s are old and very large, and anything left under them through a warm month picks up a sticky film and the bird mess that follows it. Both will etch if they sit. A detail takes the contamination off first, then machine polishes the lacquer and seals it, all of it done where the car is kept rather than anywhere it has to be driven to.",
          ],
        },
        faq: {
          q: "Can you work on a resident’s bay in Pimlico or a Mayfair mews?",
          a: ["Both are ordinary here. The work happens in the space the car already occupies, whether that is a bay off Warwick Way, a mews behind Grosvenor Square or an underground bay beneath a block in Marylebone — the van brings its own water and power in with it. Soho, Victoria, Paddington and St John’s Wood are all on the same run."],
        },
      },
    },
  },
  wimbledon: {
    opening:
      "Wimbledon sits in Merton in south-west London, with the common and the village above the town, Raynes Park to the west and Tooting to the east.",
    why: "The village and the streets around the common are all trees and gravel drives, which is pleasant to live on and hard on a finish. Treating it where the car stands, regularly, is what stops it turning into a correction job.",
    areas: ["Wimbledon Village", "Raynes Park", "South Wimbledon", "Morden", "Colliers Wood", "Southfields", "New Malden"],
    services: {
      detailing: {
        heading: "Detailing Above and Below Wimbledon Hill",
        detail: {
          heading: "Common Dust and Wimbledon Town Traffic",
          body: [
            "Two different sorts of dirt meet in this corner of Merton. Above the hill the common is sand and gravel, and in a dry spell the horse rides and the car park by the windmill throw up a fine pale dust that settles on anything standing near them. Below it, along Merton High Street and out through Colliers Wood, it is ordinary traffic film and brake dust instead, worked into the paint by stop-start driving.",
            "Dust is the one that catches people out, because wiping it off dry is what puts the swirls in. The dark cars around the Ridgway and Southfields show it first — a finish that looks flat in daylight and full of fine circles once a low sun gets across it. That comes out under a machine polish, and a sealant afterwards means the next dry fortnight’s dust rinses off instead of being dragged over the lacquer.",
          ],
        },
        faq: {
          q: "Can you still get to us during the Wimbledon tennis fortnight?",
          a: ["The roads immediately around Church Road change for those two weeks and fill early, so a car parked on one of them is easier to sort before the crowds arrive than in the middle of a match day. Everywhere else carries on as normal — Raynes Park, South Wimbledon, Colliers Wood, Morden and the streets off the Ridgway are unaffected, and a car standing at a workplace or a station car park is out of it altogether."],
        },
      },
    },
  },
  windsor: {
    opening:
      "Windsor sits in Berkshire on the Thames at junction 6 of the M4, opposite Eton, with the castle above the town and the Great Park to the south.",
    why: "It is a riverside town under a great deal of parkland tree cover, so cars here meet damp mornings and sap in the same season. Both are ordinary to remove and both mark paint if they are left to sit through a summer.",
    areas: ["Eton", "Datchet", "Old Windsor", "Slough", "Ascot", "Maidenhead", "Egham", "Burnham"],
    services: {
      detailing: {
        heading: "Looking After Paint in Windsor",
        detail: {
          heading: "Bird Lime and Back Lanes Around Windsor",
          body: [
            "The worst of it here comes off things that are alive. Canada geese work the grass on both banks — the Brocas over at Eton, the riverside walk below the castle — and gulls come up the river after them, so a car left in one of the car parks near the water for an afternoon comes back marked. Bird lime is acidic, and on a warm panel it will etch a ring into the clear coat within a day or two.",
            "The other half is the lanes. Anything that goes out past Cranbourne and Winkfield, or down the back roads between Old Windsor and Datchet, is running between hedges on surfaces that throw flint and grit up the flanks. That is what the fine scratching along a door is, once the light catches it. A detail goes at the paint properly — decontaminated, machine polished, then protected — and a sealed finish is the difference between lime that wipes off and lime that leaves a mark.",
          ],
        },
        faq: {
          q: "Do you come over to Eton and Datchet as well as Windsor?",
          a: ["Yes — Eton, Datchet, Old Windsor, Dedworth and Clewer are all the same run, along with Slough, Burnham, Ascot and Maidenhead further out. Getting a vehicle across to Eton means going round by the Queen Elizabeth Bridge rather than over the old Windsor Bridge, which has been shut to traffic for years, so it is worth saying which side of the water the car is on."],
        },
      },
    },
  },
};

/** The place a slug names, in the key this file uses. */
export const localKey = (slug: string) => slug.split("/").pop() ?? slug;

/** What this file knows about a slug's place, if anything. */
export const localPlace = (slug: string): LocalPlace | undefined =>
  LOCAL_PLACES[localKey(slug)];

/**
 * One sentence a service hub writes about London, and the version of it that
 * names the page's own place instead.
 *
 * Client, 2026-09-22, on `/car-detailing/watford`: *"the write up here needs to
 * be customized to suit the area, im on the watford page, and its mentioning
 * london and hertfordshire"*. They were reading the hub's own opener to its
 * price ladder, which every built location page carries verbatim — so 118 of
 * the 126 told a reader in Kent, Surrey or Bedfordshire that the company serves
 * London. Eight sentences across the three hubs account for all of it.
 *
 * **These rewrites are written copy, and this is the file that is allowed to
 * hold it** (PROJECT.md rule 8.1, lifted for `local-copy.ts` on 2026-09-22).
 * The repo owner chose this over dropping the sentences.
 *
 * **What a rewrite may do.** Move the geography onto the page's own place, and
 * nothing else. Every claim the source makes — the 20 years, the 100%
 * satisfaction rating, the standing, the four packages — survives with its
 * scope intact. Where a sentence dates the business *by* London ("across London
 * for more than 20 years"), the duration is kept unqualified and the place is
 * named as somewhere the work is done: re-scoping it would be claiming twenty
 * years in Watford, which is a fact about the business that no page supports.
 *
 * `find` is matched as an exact substring of a block's own text and **every
 * rule must fire on every page of its family** — `localiseHubLines` throws
 * otherwise. So an edit to a hub that moves one of these sentences takes the
 * build down rather than quietly putting "London" back on 118 pages.
 */
export type HubLine = {
  /** The hub's own words, exactly as `pages.json` has them. */
  find: string;
  /** The same sentence with this page's place in it. */
  write: (place: string) => string;
};

export const HUB_LINES: Record<LocalFamily, readonly HubLine[]> = {
  detailing: [
    {
      find: "to our customers in London and Hertfordshire, each one building on the other",
      write: (place) => `to our customers in ${place}, each one building on the other`,
    },
    {
      find:
        "we have been restoring and protecting the paintwork on vehicles across London for more than 20 years, with incredible results.",
      write: (place) =>
        `we have been restoring and protecting the paintwork on vehicles for more than 20 years, and that is the work we bring to ${place}, with incredible results.`,
    },
    {
      find:
        "we are one of the capital\u2019s most respected mobile car detailing companies\u2014a reputation that we work hard to maintain.",
      write: (place) =>
        `we are one of the most respected mobile car detailing companies covering ${place}\u2014a reputation that we work hard to maintain.`,
    },
  ],
  valeting: [
    {
      find: "at-home valeting solution for our customers across London and Hertfordshire.",
      write: (place) => `at-home valeting solution for our customers in ${place}.`,
    },
    {
      find: "There are plenty of reasons to choose us for your car valet service in London.",
      write: (place) => `There are plenty of reasons to choose us for your car valet service in ${place}.`,
    },
    {
      find:
        "for more than 20 years, we have delivered a car valeting service at home for customers across London and in nearby areas.",
      write: (place) =>
        `for more than 20 years, we have delivered a car valeting service at home, and ${place} is one of the places we come out to.`,
    },
  ],
  wash: [
    /* The mirror doubles a word here — "we bring that experience and
       experience to every job" — and `content/overrides.ts` now corrects that
       on the hub itself, which is what these pages are built from. So the
       needle is the corrected sentence, not the source's: overrides run first.
       Move one and the other throws, which is the point. */
    {
      find:
        "we have been washing cars to a brilliant gleam in London for many years, and we bring that experience to every job.",
      write: (place) =>
        `we have been washing cars to a brilliant gleam for many years, and we bring that experience to every job in ${place}.`,
    },
    {
      find:
        "we have achieved 100% customer satisfaction with our mobile car wash service and are well-reviewed across the capital.",
      write: (place) =>
        `we have achieved 100% customer satisfaction with our mobile car wash service and are well-reviewed wherever we work, ${place} included.`,
    },
  ],
};
