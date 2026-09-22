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

export type LocalPlace = {
  /** Where the place is, as the opening sentence puts it. */
  opening: string;
  /** What being mobile means in this particular place. */
  why: string;
  /** Districts and neighbouring towns the round covers. */
  areas: string[];
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
  },
  basildon: {
    opening:
      "Basildon sits in south Essex on the A127, between Brentwood and Southend, with Pitsea, Laindon and Vange around it and the Thames estuary a short run to the south.",
    why: "Estuary air carries salt, and cars parked outside all week in it pick up a film that a quick wash never quite lifts. Working at your address means the car is dealt with where it stands, rather than driven across town to a bay.",
    areas: ["Pitsea", "Laindon", "Vange", "Wickford", "Billericay", "Langdon Hills", "Fobbing"],
  },
  bedfordshire: {
    opening:
      "Bedfordshire runs north from the edge of Hertfordshire up past Luton, Dunstable and Bedford, with the M1 down its western side and a great deal of commuter parking either side of it.",
    why: "It is a county of station car parks and long weekday absences, which is the worst combination for paintwork — the car sits still, collects whatever falls on it, and only gets looked at on a Sunday. A mobile round deals with it on a weekday instead.",
    areas: ["Luton", "Dunstable", "Bedford", "Leighton Buzzard", "Ampthill", "Biggleswade", "Flitwick"],
  },
  berkshire: {
    opening:
      "Berkshire sits along the M4 west of London, taking in Reading, Slough, Bracknell, Maidenhead and Windsor, with the Thames winding through most of it.",
    why: "Business parks and long motorway miles are what most Berkshire cars do, and motorway miles are the kind that leave the worst behind: tar spots, fly, and a windscreen you cannot see through into low sun. All of that is handled where the car is parked.",
    areas: ["Reading", "Slough", "Bracknell", "Maidenhead", "Windsor", "Wokingham", "Newbury", "Ascot"],
  },
  brentwood: {
    opening:
      "Brentwood sits just outside the M25 at junction 28, where the A12 heads on into Essex, with Shenfield, Hutton and Ingatestone around it.",
    why: "It is largely a commuter town, and a commuter car spends its week at a station or on the drive rather than in a garage. Coming to the address is simply the arrangement that fits — the work happens while the car is somewhere it would be anyway.",
    areas: ["Shenfield", "Hutton", "Ingatestone", "Pilgrims Hatch", "Warley", "Doddinghurst", "Mountnessing"],
  },
  bromley: {
    opening:
      "Bromley is the largest of the London boroughs by area, running from Beckenham and Penge out to Orpington, Chislehurst and the Kent border beyond.",
    why: "Much of it is suburban, with off-street parking and tree cover — and tree cover means sap and bird lime, which set hard and need lifting properly rather than scrubbing. Working at the address means treating it before it has time to etch.",
    areas: ["Beckenham", "Penge", "Orpington", "Chislehurst", "West Wickham", "Hayes", "Shortlands", "Biggin Hill"],
  },
  chelmsford: {
    opening:
      "Chelmsford is the county town of Essex, up the A12 from the M25, with Great Baddow, Springfield and Writtle around it and a good deal of new housing besides.",
    why: "New estates tend to mean shared parking courts and tight bays, which is where a fixed-site valet becomes a chore and a mobile one does not: the van carries its own water and power, so the car never has to leave its space.",
    areas: ["Great Baddow", "Springfield", "Writtle", "Galleywood", "Broomfield", "Danbury", "Boreham"],
  },
  cheshunt: {
    opening:
      "Cheshunt lies in the Lee Valley in Hertfordshire, on the A10 between Enfield and Broxbourne, with Waltham Cross and Goffs Oak beside it.",
    why: "The valley road carries a lot of heavy traffic, and cars kept along it pick up brake dust and road film faster than most. Dealing with that at the house, on a day that suits, is easier than finding a slot somewhere on the A10 and waiting in it.",
    areas: ["Waltham Cross", "Goffs Oak", "Broxbourne", "Turnford", "Wormley", "Hoddesdon", "Enfield"],
  },
  clapham: {
    opening:
      "Clapham sits in South-West London around the Common, between Battersea, Brixton and Balham, on streets that are mostly Victorian terraces with permit parking.",
    why: "There is no driveway to speak of here, and that is the whole point of coming to you: the work is done at the kerb where the car is already parked, so a resident's permit bay becomes the valeting bay and nobody has to move anything.",
    areas: ["Clapham Common", "Clapham North", "Battersea", "Balham", "Brixton", "Stockwell", "Wandsworth Road"],
  },
  croydon: {
    opening:
      "Croydon is the largest borough in South London, running from the town centre and its trams out to Purley, Coulsdon and the Surrey boundary.",
    why: "It is a borough of two halves — town-centre flats with allocated bays, and suburban roads with drives — and a mobile round suits both, because the only thing it needs is the space the car is already taking up.",
    areas: ["Purley", "Coulsdon", "Addiscombe", "Thornton Heath", "South Norwood", "Sanderstead", "Shirley", "Selsdon"],
  },
  "east-london": {
    opening:
      "East London covers the ground from Stratford and Hackney out through Newham, Barking and Ilford towards the Essex border, much of it rebuilt in the last twenty years.",
    why: "New-build blocks here come with underground bays and no hose, which rules out doing it yourself and makes the nearest hand wash a twenty-minute round trip. The van brings its own water and power, so the car stays in its bay.",
    areas: ["Stratford", "Hackney", "Bow", "Canary Wharf", "Barking", "Ilford", "Walthamstow", "Leyton"],
  },
  essex: {
    opening:
      "Essex runs north-east from the edge of London out to Chelmsford, Colchester and the coast, taking in Romford, Brentwood, Basildon and Harlow on the way.",
    why: "Between the estuary salt in the south and the field dust in the north, an Essex car collects a particular kind of grime, and it does it fastest on the vehicles that sit outside all week. Coming to the address is what makes it a weekday job rather than a weekend one.",
    areas: ["Chelmsford", "Brentwood", "Basildon", "Romford", "Harlow", "Colchester", "Southend-on-Sea", "Grays"],
  },
  gravesend: {
    opening:
      "Gravesend sits on the Kent bank of the Thames estuary, east of Dartford, with Northfleet beside it and the A2 and M2 running behind.",
    why: "It is an estuary town, and estuary air is salt air: it finds its way into door shuts, wheel arches and every seam that has already lost its protection. That is worth treating where the car lives, and worth protecting afterwards.",
    areas: ["Northfleet", "Dartford", "Swanscombe", "Higham", "Meopham", "Istead Rise", "Ebbsfleet"],
  },
  guildford: {
    opening:
      "Guildford sits in the Surrey hills on the A3, about half an hour south-west of the M25, with the Hog's Back to the west and a great deal of woodland around it.",
    why: "Lanes under trees are lovely to drive and hard on paint — sap in summer, leaf mould in autumn, and grit thrown up from unmade edges all year. Dealing with it at the house, before it has set, is the difference between a clean and a correction.",
    areas: ["Godalming", "Woking", "Cranleigh", "Merrow", "Burpham", "Shalford", "Ripley", "Farnham"],
  },
  harlow: {
    opening:
      "Harlow is an Essex new town beside the M11, north of Epping, laid out in neighbourhoods with their own parking courts and green wedges between them.",
    why: "Those courts are shared, unmetered and nowhere near a tap, which is exactly the situation a mobile service is for. The van arrives self-contained, works in the bay the car already occupies, and leaves nothing behind.",
    areas: ["Old Harlow", "Church Langley", "Potter Street", "Sawbridgeworth", "Epping", "Roydon", "Nazeing"],
  },
  "hemel-hempstead": {
    opening:
      "Hemel Hempstead sits in west Hertfordshire at junction 8 of the M1, a new town of wide roads and roundabouts with Boxmoor, Adeyfield and Leverstock Green around it.",
    why: "A lot of what is parked here does motorway miles daily, and motorway miles are the ones that bake tar and fly onto a front end. It is easier to have that lifted on the drive than to add another trip to the week.",
    areas: ["Boxmoor", "Adeyfield", "Leverstock Green", "Bovingdon", "Berkhamsted", "Kings Langley", "Apsley"],
  },
  hertfordshire: {
    opening:
      "Hertfordshire sits immediately north of London, taking in Watford, St Albans, Hemel Hempstead and Hertford, with the M1, M25 and A1(M) all crossing it.",
    why: "It is commuter country, and a commuter car has a hard life: motorway grime through the week, a station car park through the day, and no time at the weekend to deal with either. Bringing the work to the address is what puts it back in the week.",
    areas: ["Watford", "St Albans", "Hemel Hempstead", "Hertford", "Rickmansworth", "Borehamwood", "Stevenage", "Cheshunt"],
  },
  "high-wycombe": {
    opening:
      "High Wycombe sits in a Chiltern valley in Buckinghamshire, on the M40 between London and Oxford, with Marlow, Beaconsfield and Hazlemere around it.",
    why: "The hills either side mean steep, wooded approaches and a lot of chalk dust and leaf debris on the roads, which settles into the places a quick rinse never reaches. Working at your address means there is time to get into them properly.",
    areas: ["Marlow", "Beaconsfield", "Hazlemere", "Bourne End", "Flackwell Heath", "Downley", "Loudwater"],
  },
  hornchurch: {
    opening:
      "Hornchurch sits in Havering, on the eastern edge of London where it meets Essex, with Upminster, Elm Park and Romford around it.",
    why: "It is a suburb of long front gardens and driveways, so there is usually space beside the car to work properly. That is all a mobile round needs — the van brings everything else with it.",
    areas: ["Upminster", "Elm Park", "Romford", "Rainham", "Emerson Park", "Cranham", "Gidea Park"],
  },
  hounslow: {
    opening:
      "Hounslow sits in West London under the Heathrow approach, running from Chiswick and Brentford out through Isleworth to Feltham.",
    why: "Living under a flight path has a cost the brochures do not mention: a fine, gritty film that settles on everything parked outside and does not rinse off cleanly. It wants lifting properly, and it wants doing where the car is.",
    areas: ["Chiswick", "Brentford", "Isleworth", "Feltham", "Osterley", "Heston", "Cranford", "Bedfont"],
  },
  ilford: {
    opening:
      "Ilford sits in Redbridge in East London, on the A12 between Stratford and Romford, with Barkingside, Seven Kings and Gants Hill around it.",
    why: "Much of the parking here is on-street and permit-controlled, and the nearest hand wash usually means a queue. A mobile round skips both: the work happens in the space the car is already in, at a time that was going to be free anyway.",
    areas: ["Barkingside", "Seven Kings", "Gants Hill", "Goodmayes", "Woodford", "Wanstead", "Chadwell Heath"],
  },
  kent: {
    opening:
      "Kent runs south-east from the edge of London out through Bromley's border towns to Maidstone, Sevenoaks and the coast, with the M20 and M2 crossing it.",
    why: "Between the estuary in the north and the open country in the south, a Kent car meets salt, chalk and farm mud in the same week. None of that is difficult to deal with — it is only difficult to find the time, which is what coming to you solves.",
    areas: ["Sevenoaks", "Maidstone", "Dartford", "Gravesend", "Tonbridge", "Orpington", "Swanley", "Bexley"],
  },
  kingston: {
    opening:
      "Kingston upon Thames sits on the river in South-West London, with Surbiton, New Malden and Norbiton around it and Richmond Park on its doorstep.",
    why: "River air and park trees between them keep a car damp and dirty for most of the year, and damp dirt is the kind that marks paint if it sits. Dealing with it at the address, regularly, is what keeps it from becoming a bigger job.",
    areas: ["Surbiton", "New Malden", "Norbiton", "Chessington", "Hampton Wick", "Berrylands", "Coombe", "Tolworth"],
  },
  luton: {
    opening:
      "Luton sits in Bedfordshire at junctions 10 and 11 of the M1, about thirty miles north of London, with Dunstable beside it and the airport on its eastern edge.",
    why: "Airport parking is where paintwork goes to be forgotten — a fortnight in the open, under whatever the weather and the birds provide. It is worth dealing with on the drive before the trip and again after it, rather than hoping a jet wash will lift it later.",
    areas: ["Dunstable", "Houghton Regis", "Leagrave", "Stopsley", "Barton-le-Clay", "Caddington", "Harpenden"],
  },
  "milton-keynes": {
    opening:
      "Milton Keynes sits in north Buckinghamshire at junction 14 of the M1, laid out on grid roads with Bletchley, Wolverton and Newport Pagnell inside it.",
    why: "The grid roads are fast, open and swept by everything the weather throws across them, so cars here collect road film evenly and quickly. The upside is space: almost every address has somewhere the van can work properly beside the car.",
    areas: ["Bletchley", "Wolverton", "Newport Pagnell", "Stony Stratford", "Woburn Sands", "Olney", "Wavendon"],
  },
  reading: {
    opening:
      "Reading sits in Berkshire where the Kennet meets the Thames, on the M4 at junctions 10 to 12, about forty miles west of London.",
    why: "It is a town built around business parks and the motorway, and that mix leaves a very particular finish on a car: tar on the sills, fly on the front, and a windscreen that smears in low sun. All of it is straightforward to put right at your own address.",
    areas: ["Caversham", "Tilehurst", "Earley", "Woodley", "Winnersh", "Theale", "Shinfield", "Wokingham"],
  },
  rickmansworth: {
    opening:
      "Rickmansworth sits in south-west Hertfordshire near junction 18 of the M25, in the Three Rivers district, with Chorleywood, Croxley Green and Mill End around it.",
    why: "It is a green, wooded corner of the county, which is pleasant to live in and hard on paintwork — sap, leaf fall and lane grit in turn. Treating it where the car is parked, before it sets, is far easier than correcting it later.",
    areas: ["Chorleywood", "Croxley Green", "Mill End", "Batchworth", "Maple Cross", "Sarratt", "Watford"],
  },
  romford: {
    opening:
      "Romford sits in Havering on the eastern edge of London, on the A12 where the city runs into Essex, with Gidea Park, Collier Row and Harold Wood around it.",
    why: "It is a mix of terraces, semis and new flats, and between them the parking runs from permit bays to private drives. A mobile round does not care which — the van is self-contained, so the work happens wherever the car already is.",
    areas: ["Gidea Park", "Collier Row", "Harold Wood", "Rush Green", "Hornchurch", "Elm Park", "Chadwell Heath"],
  },
  sidcup: {
    opening:
      "Sidcup sits in Bexley in South-East London, on the A20 between Eltham and Swanley, with Foots Cray, Blackfen and Bexley village around it.",
    why: "It is a suburb where most cars sit on a drive or a hardstanding all week, which sounds harmless and is not: standing water, leaf fall and overnight damp do more to a finish than driving ever does. Regular attention at the address is what keeps ahead of it.",
    areas: ["Foots Cray", "Blackfen", "Bexley", "Albany Park", "New Eltham", "Chislehurst", "North Cray"],
  },
  slough: {
    opening:
      "Slough sits in Berkshire between junctions 5 and 7 of the M4, west of Heathrow, with Langley, Burnham and Windsor around it and one of the country's largest trading estates inside it.",
    why: "A lot of what is parked here is a work vehicle or a company car, and both do hard, high-mileage weeks. Getting them cleaned where they are parked — at the unit, the office or the house — is the only version of it that does not cost a working hour.",
    areas: ["Langley", "Burnham", "Windsor", "Datchet", "Iver", "Colnbrook", "Farnham Royal", "Stoke Poges"],
  },
  "south-london": {
    opening:
      "South London runs from Wandsworth and Lambeth out through Croydon, Bromley and Sutton to the Surrey and Kent boundaries, with the river along its northern edge.",
    why: "Inner South London is permit bays and Victorian terraces; the outer boroughs are drives and garages. A mobile service is the one arrangement that works across both, because all it needs is the space the car is already parked in.",
    areas: ["Wandsworth", "Lambeth", "Clapham", "Croydon", "Bromley", "Sutton", "Dulwich", "Streatham"],
  },
  "st-albans": {
    opening:
      "St Albans is a cathedral city in Hertfordshire between the M1 and the M25, about twenty miles north of London, with Harpenden, London Colney and Wheathampstead around it.",
    why: "The old centre is narrow, and much of the parking is on-street and controlled, so taking a car anywhere to be cleaned costs more time than the clean does. Coming to the address is simply the sensible way round.",
    areas: ["Harpenden", "London Colney", "Wheathampstead", "Redbourn", "Bricket Wood", "Park Street", "Sandridge"],
  },
  surrey: {
    opening:
      "Surrey sits south-west of London, from the boroughs on the M25 out through Guildford, Woking and Epsom to the Sussex border, much of it wooded.",
    why: "Tree cover is the defining thing here: sap in summer, leaf mould in autumn, and lane grit whenever it rains. All of it marks paint if it is left, and none of it is a problem if the car is seen to regularly where it stands.",
    areas: ["Guildford", "Woking", "Epsom", "Esher", "Weybridge", "Reigate", "Leatherhead", "Staines"],
  },
  sutton: {
    opening:
      "Sutton sits at the southern edge of London where it meets Surrey, with Carshalton, Cheam, Wallington and Worcester Park around it.",
    why: "It is a borough of suburban streets and off-street parking, which means most cars here can be worked on exactly where they live. That is the whole arrangement: the van arrives with its own water and power, and the car never moves.",
    areas: ["Carshalton", "Cheam", "Wallington", "Worcester Park", "Belmont", "Hackbridge", "Banstead"],
  },
  "welwyn-garden-city": {
    opening:
      "Welwyn Garden City sits in Hertfordshire on the A1(M), north of Hatfield, laid out with wide verges, tree-lined roads and a great deal of green between its neighbourhoods.",
    why: "Those trees are the reason the town looks the way it does and the reason cars here need more than a rinse — sap and leaf fall get into panel gaps and around trim and stay there. It is a job worth doing thoroughly, at the address.",
    areas: ["Hatfield", "Welwyn", "Digswell", "Oaklands", "Woolmer Green", "Knebworth", "Hertford"],
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
  },
  borehamwood: {
    opening:
      "Borehamwood sits in Hertfordshire just outside the M25 at junction 23, north of Barnet, with Elstree beside it and the film studios that gave both their name.",
    why: "It is a town of estates and station parking, where most cars sit still all week and collect whatever the weather leaves on them. Dealing with that at the address turns it into a job that fits around the week rather than one that eats a Saturday.",
    areas: ["Elstree", "Shenley", "Radlett", "Barnet", "Mill Hill", "Potters Bar", "Bushey"],
  },
  "central-london": {
    opening:
      "Central London is the ground inside the Congestion Charge zone and the streets just outside it — the City, Holborn, Soho, Marylebone, Westminster and the West End.",
    why: "Almost nothing here has a driveway, and driving a car anywhere to be cleaned means paying to do it. The van comes to the bay, the mews or the office car park instead, carrying its own water and power, so the car never moves and never pays.",
    areas: ["The City", "Holborn", "Soho", "Marylebone", "Fitzrovia", "Covent Garden", "Clerkenwell", "Bloomsbury"],
  },
  chelsea: {
    opening:
      "Chelsea runs along the north bank of the Thames between Battersea Bridge and Sloane Square, with the King’s Road through the middle of it and Kensington above.",
    why: "Parking is permit-controlled and tight, and the streets are narrow enough that a car leaving to be cleaned may not find its space again. Working at the kerb where it already stands is the arrangement that actually fits the postcode.",
    areas: ["Sloane Square", "King’s Road", "World’s End", "Brompton", "South Kensington", "Pimlico", "Battersea"],
  },
  chingford: {
    opening:
      "Chingford sits at the northern end of Waltham Forest, on the edge of Epping Forest, with Highams Park and Woodford beside it and the Lee Valley to the west.",
    why: "Living beside the forest means sap in summer and leaf mould through autumn, both of which mark paint if they sit. The advantage is space: most addresses here have a drive or a wide kerb, which is all the van needs.",
    areas: ["Highams Park", "Woodford Green", "Walthamstow", "Waltham Abbey", "Buckhurst Hill", "Loughton", "South Chingford"],
  },
  chiswick: {
    opening:
      "Chiswick sits in West London on a bend of the Thames, between Hammersmith and Brentford, with the A4 along its northern edge and the High Road through its centre.",
    why: "The A4 puts a steady film of road grime on everything parked near it, and the river keeps the mornings damp enough to hold it there. Neither is hard to deal with — it is finding a free hour that is hard, which is what coming to you removes.",
    areas: ["Turnham Green", "Grove Park", "Gunnersbury", "Brentford", "Hammersmith", "Acton Green", "Strand-on-the-Green"],
  },
  ealing: {
    opening:
      "Ealing sits in West London between Acton and Hanwell, a borough of wide avenues and parkland that has been called the Queen of the Suburbs for a century.",
    why: "The tree-lined roads that earned it the name are also what covers the cars beneath them, and sap does not come off with a rinse. A mobile round treats it properly on the drive, before it has time to etch into the lacquer.",
    areas: ["West Ealing", "Acton", "Hanwell", "Northfields", "Perivale", "Greenford", "Southall", "Pitshanger"],
  },
  enfield: {
    opening:
      "Enfield is the northernmost of the London boroughs, running from Southgate and Palmers Green up past the town centre to the Hertfordshire boundary, with the A10 through it.",
    why: "It is mostly suburban, which means driveways, and driveways mean the van can work properly beside the car. That is the whole requirement — everything else it brings with it.",
    areas: ["Southgate", "Palmers Green", "Winchmore Hill", "Edmonton", "Bush Hill Park", "Cockfosters", "Oakwood", "Enfield Lock"],
  },
  finchley: {
    opening:
      "Finchley sits in Barnet in North London, between Golders Green and Whetstone, with the North Circular along its southern edge and the A1 running north out of it.",
    why: "A car kept on a Finchley street spends its week under plane trees and beside a busy road, which is a combination that dulls paint faster than mileage does. Regular attention where it is parked is what keeps ahead of it.",
    areas: ["North Finchley", "East Finchley", "Church End", "Whetstone", "Golders Green", "Muswell Hill", "Woodside Park"],
  },
  fulham: {
    opening:
      "Fulham sits on the north bank of the Thames between Chelsea and Putney Bridge, a grid of Victorian terraces with the Fulham Road and the New King’s Road through it.",
    why: "Every street here is permit-parked and most houses have no drive at all, so the nearest hand wash means giving up the space you queued for. The van works at the kerb instead, which is the only version of this that does not cost you the parking.",
    areas: ["Parsons Green", "Fulham Broadway", "Sands End", "West Brompton", "Putney Bridge", "Hammersmith", "Chelsea Harbour"],
  },
  hammersmith: {
    opening:
      "Hammersmith sits in West London where the A4 meets the river, with the flyover above it, Chiswick to the west and Shepherd’s Bush to the north.",
    why: "It is one of the busiest road junctions in the capital, and cars parked in the streets around it wear that traffic — brake dust, tyre film and a grit that settles overnight. All of it lifts cleanly enough if it is not left for months.",
    areas: ["Brook Green", "Shepherd’s Bush", "Ravenscourt Park", "Barons Court", "Chiswick", "Fulham", "White City"],
  },
  hayes: {
    opening:
      "Hayes sits in Hillingdon in West London, on the Uxbridge Road between Southall and Uxbridge, with the Grand Union Canal and a good deal of industry beside it.",
    why: "There are more vans and work vehicles parked here than in most of London, and a working vehicle is judged on how it looks when it arrives. Cleaning it at the yard or the house means it never loses a working hour to the trip.",
    areas: ["Hayes End", "Yeading", "Harlington", "Southall", "West Drayton", "Northolt", "Uxbridge"],
  },
  islington: {
    opening:
      "Islington runs north from the edge of the City through Angel and Upper Street to Highbury and Archway, a borough of Georgian terraces and almost no off-street parking.",
    why: "The parking here is permit-controlled and hard won, so leaving a bay to sit in a queue somewhere is a poor trade. The van comes to the bay, brings its own water and power, and the space is still yours afterwards.",
    areas: ["Angel", "Upper Street", "Highbury", "Canonbury", "Archway", "Barnsbury", "Finsbury Park", "Clerkenwell"],
  },
  kensington: {
    opening:
      "Kensington sits in west-central London around High Street Kensington and the museums, with Holland Park to the west, Notting Hill north and Chelsea south.",
    why: "Garden squares and mews mean narrow access and permit bays, and the cars kept in them are usually worth doing properly. Both point the same way: the work comes to the car, and it is done by hand where it stands.",
    areas: ["South Kensington", "Holland Park", "Notting Hill", "Earl’s Court", "Knightsbridge", "Chelsea", "Bayswater"],
  },
  knightsbridge: {
    opening:
      "Knightsbridge sits between Hyde Park and Belgravia, on the Westminster and Kensington boundary, with Sloane Street and Brompton Road running through it.",
    why: "Almost all of the parking here is underground or permit-controlled, and neither comes with a tap. A self-contained van is the only way to clean a car properly without taking it out of the building it lives in.",
    areas: ["Belgravia", "Brompton", "Hyde Park", "South Kensington", "Sloane Street", "Chelsea", "Mayfair"],
  },
  "north-london": {
    opening:
      "North London covers the ground from Camden and Islington up through Haringey and Barnet to Enfield, taking in Finchley, Highgate and Muswell Hill on the way.",
    why: "It is two kinds of parking in one half of the city — permit bays in the inner boroughs, drives further out — and a mobile round is the one arrangement that works in both, because it only needs the space the car is already in.",
    areas: ["Camden", "Islington", "Haringey", "Barnet", "Finchley", "Highgate", "Muswell Hill", "Enfield"],
  },
  "north-west-london": {
    opening:
      "North-West London runs from St John’s Wood and Kilburn out through Brent and Harrow towards Stanmore, with the A5 and the North Circular crossing it.",
    why: "The arterial roads through it carry traffic all day, and the streets either side of them collect the film that comes off it. That is a straightforward job when it is done regularly and a much bigger one when it is not.",
    areas: ["Kilburn", "Willesden", "Wembley", "Harrow", "Edgware", "Stanmore", "Hendon", "Cricklewood"],
  },
  northwood: {
    opening:
      "Northwood sits at the north-western edge of Hillingdon on the Metropolitan line, next to Rickmansworth and the Hertfordshire border, with a great deal of green around it.",
    why: "It is a commuter suburb of long drives and mature trees, which is the best possible ground for a mobile service and the worst for paintwork left alone: sap, leaf fall and a car that only moves twice a day.",
    areas: ["Northwood Hills", "Pinner", "Ruislip", "Rickmansworth", "Eastcote", "Moor Park", "Harefield"],
  },
  "notting-hill": {
    opening:
      "Notting Hill sits in west London between Holland Park and Westbourne Grove, built around Portobello Road and a run of stucco terraces and garden squares.",
    why: "Parking is permit-only and the streets are busy with market traffic for half the week, so taking a car out to be cleaned is a decision you regret on the way back. The van works in the residents’ bay instead.",
    areas: ["Portobello Road", "Holland Park", "Westbourne Grove", "Ladbroke Grove", "Kensal Green", "Bayswater", "Shepherd’s Bush"],
  },
  "park-royal": {
    opening:
      "Park Royal straddles the Brent and Ealing boundary beside the A40, one of the largest business and industrial estates in the capital, with Acton and Willesden either side.",
    why: "Most of what is parked here works for a living — vans, fleet cars and light commercials — and a working vehicle cannot spare the half day it takes to be driven somewhere and waited on. Cleaning it at the unit is the only version that costs nothing.",
    areas: ["Acton", "Willesden", "Alperton", "Harlesden", "Wembley", "Greenford", "North Acton"],
  },
  pinner: {
    opening:
      "Pinner sits in Harrow in north-west London, on the Metropolitan line between Harrow and Northwood, with a village high street and a great deal of interwar suburb around it.",
    why: "Almost every house here has a drive and a tree over it, which is a good arrangement for everything except paintwork. Treating sap and leaf fall where the car is parked, before it has set, keeps it from becoming a machine-polishing job.",
    areas: ["Hatch End", "Northwood Hills", "Rayners Lane", "Eastcote", "Harrow", "North Harrow", "Ruislip"],
  },
  preston: {
    opening:
      "Preston sits on the Brent and Harrow boundary in north-west London, around Preston Road station, between Wembley and Kenton — not the Lancashire city of the same name.",
    why: "It is a suburb of semis and short drives, close enough to the North Circular that the traffic film reaches it and far enough out that most cars sit still all week. Both are easier to deal with on the drive than anywhere else.",
    areas: ["Wembley", "Kenton", "Harrow", "Sudbury", "Northwick Park", "Kingsbury", "North Wembley"],
  },
  putney: {
    opening:
      "Putney sits on the south bank of the Thames opposite Fulham, with the High Street running down to the bridge, Putney Heath above it and Wandsworth to the east.",
    why: "River mornings keep cars damp here well into the day, and damp holds dirt against the paint rather than letting it blow off. Regular attention at the address is worth more than an occasional heavy clean.",
    areas: ["East Putney", "Roehampton", "Barnes", "Wandsworth", "Southfields", "Putney Heath", "Fulham"],
  },
  "richmond-upon-thames": {
    opening:
      "Richmond upon Thames sits on the river in south-west London, with the park above the town, Twickenham across the water and Kew and Barnes downstream.",
    why: "The park and the riverside are the reason people live here and the reason their cars are permanently under something — deer-cropped dust in summer, leaf mould in autumn, damp all winter. It is a place that rewards being seen to often.",
    areas: ["Twickenham", "Kew", "Barnes", "East Sheen", "Ham", "Petersham", "St Margarets", "Mortlake"],
  },
  ruislip: {
    opening:
      "Ruislip sits in Hillingdon in north-west London, between Northwood and Uxbridge, with Ruislip Woods on one side and the A40 within easy reach on the other.",
    why: "It is a suburb of driveways and garages backing onto woodland, so there is room to work and plenty for the work to remove. Doing it where the car lives is simply less trouble than the alternative.",
    areas: ["South Ruislip", "Ruislip Manor", "Eastcote", "Ickenham", "Northolt", "Uxbridge", "Northwood"],
  },
  stanmore: {
    opening:
      "Stanmore sits at the top of Harrow at the end of the Jubilee line, on the Hertfordshire boundary, with Belmont and Canons Park below it and open country above.",
    why: "It is the end of the line, which means station car parks full of cars that sit all day, and hillside streets under trees. Neither is a problem if the car is seen to regularly, and both compound if it is not.",
    areas: ["Canons Park", "Belmont", "Edgware", "Harrow Weald", "Bushey", "Queensbury", "Kenton"],
  },
  streatham: {
    opening:
      "Streatham sits in Lambeth in south London, strung along the A23 between Brixton and Norbury, with the common on its eastern side.",
    why: "The A23 runs through the middle of it, and the terraces either side are permit-parked with no drives to speak of. Cleaning a car at the kerb where it is parked is the only arrangement that does not cost you the space.",
    areas: ["Streatham Hill", "Streatham Common", "Norbury", "Balham", "Tulse Hill", "Brixton", "Thornton Heath"],
  },
  sudbury: {
    opening:
      "Sudbury sits in Brent in north-west London, between Wembley and Greenford, on the Harrow Road with Sudbury Hill and Sudbury Town either side of it.",
    why: "It is a suburb of semis and short drives near two busy arterial roads, so cars here collect road film steadily and quietly. There is almost always room to work beside one, which is all a mobile round asks for.",
    areas: ["Wembley", "Greenford", "Alperton", "Harrow", "Perivale", "North Wembley", "Sudbury Hill"],
  },
  twickenham: {
    opening:
      "Twickenham sits on the Middlesex bank of the Thames in south-west London, across the river from Richmond, with the stadium to the north and Strawberry Hill below.",
    why: "It is a riverside town, and riverside means damp mornings and green film on anything parked in the shade for a season. That is straightforward to remove and slow to come back once the paint has been protected.",
    areas: ["St Margarets", "Whitton", "Strawberry Hill", "Teddington", "Isleworth", "Hampton", "Richmond"],
  },
  uxbridge: {
    opening:
      "Uxbridge sits at the western edge of London in Hillingdon, at junction 1 of the M40, with Cowley and Hillingdon beside it and Buckinghamshire across the Colne.",
    why: "It is where the motorway starts, and the cars kept here do motorway miles — which means tar on the sills and fly on the front rather than ordinary dirt. Both want a proper decontamination rather than a rinse, and both can be done on the drive.",
    areas: ["Cowley", "Hillingdon", "Ickenham", "Denham", "West Drayton", "Ruislip", "Iver"],
  },
  walthamstow: {
    opening:
      "Walthamstow sits in Waltham Forest in north-east London, at the top of the Victoria line, with the marshes to the west, Chingford above and Leyton below.",
    why: "Most of it is terraced and permit-parked, with the wetlands keeping the air damp on that side of the borough. The van comes to the bay with its own water, which is the only way to do the job properly without moving the car.",
    areas: ["Walthamstow Village", "Highams Park", "Leyton", "Leytonstone", "Chingford", "Blackhorse Road", "Wood Street"],
  },
  wandsworth: {
    opening:
      "Wandsworth sits on the south bank of the Thames between Battersea and Putney, with the common to the south and the one-way system and river bridges to the north.",
    why: "It is a borough of Victorian terraces, permit bays and a great many plane trees, which between them keep cars dirty and make taking them anywhere an errand. Doing the work where the car is parked removes the errand entirely.",
    areas: ["Earlsfield", "Southfields", "Battersea", "Putney", "Balham", "Tooting", "Clapham Junction"],
  },
  watford: {
    opening:
      "Watford sits in south-west Hertfordshire between junction 5 of the M1 and junctions 19 and 20 of the M25, with Bushey, Rickmansworth and Croxley Green around it.",
    why: "It is ringed by motorway, and motorway grime is the kind that bakes on: tar along the sills, fly across the front, and a windscreen that smears in low sun. All of it is lifted properly at the address, without adding a trip to the week.",
    areas: ["Bushey", "Croxley Green", "Rickmansworth", "Abbots Langley", "Garston", "Kings Langley", "Oxhey"],
  },
  wembley: {
    opening:
      "Wembley sits in Brent in north-west London, around the stadium and the arena, with the North Circular to the south and Harrow and Sudbury either side.",
    why: "Event days fill every street and side road for a mile, and a car parked through one collects a week of grime in an afternoon. Between them, the cars here are better served by someone coming to the drive than by another queue.",
    areas: ["Wembley Park", "North Wembley", "Alperton", "Sudbury", "Preston", "Harlesden", "Kingsbury", "Tokyngton"],
  },
  westminster: {
    opening:
      "Westminster runs from the river at Millbank up through Victoria and Mayfair to Marylebone and the edge of Regent’s Park, taking in Soho and St James’s on the way.",
    why: "There is next to no off-street parking in any of it, and what exists is an underground bay with no tap and no socket. A self-contained van is the only way to have a car cleaned properly here without taking it out of the building.",
    areas: ["Mayfair", "Marylebone", "Victoria", "Soho", "St James’s", "Pimlico", "Belgravia", "Paddington"],
  },
  wimbledon: {
    opening:
      "Wimbledon sits in Merton in south-west London, with the common and the village above the town, Raynes Park to the west and Tooting to the east.",
    why: "The village and the streets around the common are all trees and gravel drives, which is pleasant to live on and hard on a finish. Treating it where the car stands, regularly, is what stops it turning into a correction job.",
    areas: ["Wimbledon Village", "Raynes Park", "South Wimbledon", "Morden", "Colliers Wood", "Southfields", "New Malden"],
  },
  windsor: {
    opening:
      "Windsor sits in Berkshire on the Thames at junction 6 of the M4, opposite Eton, with the castle above the town and the Great Park to the south.",
    why: "It is a riverside town under a great deal of parkland tree cover, so cars here meet damp mornings and sap in the same season. Both are ordinary to remove and both mark paint if they are left to sit through a summer.",
    areas: ["Eton", "Datchet", "Old Windsor", "Slough", "Ascot", "Maidenhead", "Egham", "Burnham"],
  },
};

/** The place a slug names, in the key this file uses. */
export const localKey = (slug: string) => slug.split("/").pop() ?? slug;

/** What this file knows about a slug's place, if anything. */
export const localPlace = (slug: string): LocalPlace | undefined =>
  LOCAL_PLACES[localKey(slug)];
