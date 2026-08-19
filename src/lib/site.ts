/**
 * Every string, price and asset path here is transcribed from the live site at
 * https://medusaautodetailing.co.uk/ so the clone stays content-identical.
 */

export const BOOK_URL = "https://book.medusaautodetailing.co.uk/";
export const SITE = "https://medusaautodetailing.co.uk";

export const CONTACT = {
  phone: "02033556435",
  email: "info@medusaautodetailing.co.uk",
  facebook: "https://www.facebook.com/medusadetailing/",
  instagram: "https://www.instagram.com/medusadetailing/",
  whatsapp: "https://wa.link/vryv1g",
  appStore: "https://apps.apple.com/us/app/medusa-auto-detailing/id6743238048",
  playStore: "https://play.google.com/store/apps/details?id=com.medusaauto.c",
};

/* ── Business facts (drive the LocalBusiness structured data) ─────────────
   Transcribed from the AutoWash JSON-LD block the live site emits. */

export const BUSINESS = {
  name: "Medusa Auto Detailing",
  legalName: "Medusa Auto Detailing Ltd",
  description:
    "Looking for a high-quality mobile car wash, valeting, or detailing service in London or Hertfordshire? Medusa Auto Detailing brings top-rated, 5-star car care right to your location! Offering a range of flexible packages to suit every need, Medusa ensures that your vehicle receives professional attention—anywhere you are.",
  tagline: "Mobile Car Wash, Valeting, & Detailing in London",
  telephone: "+442033556435",
  reservationsPhone: "+44-7434649960",
  priceRange: "££",
  openingHours: "Mo-Fr 07:00-18:00 Sa-Su 09:00-17:00",
  logo: "/assets/2021/12/4-e1639638656209.webp",
  image: "/assets/2024/10/Untitled-design-2.webp",
  geo: { latitude: "51.592690", longitude: "-0.315270" },
  address: {
    streetAddress: "Alveston Ave",
    addressLocality: "Harrow",
    addressRegion: "London",
    postalCode: "HA3 8TG",
    addressCountry: "GB",
  },
};

/* ── Navigation ───────────────────────────────────────────────────────── */

/**
 * A menu entry. `href` is optional: "Services" is a label that only opens the
 * mega-menu, and five hubs in the proposed structure have no page behind them
 * yet - both render as plain text rather than a link that would 404.
 */
export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
  /** Render `children` as the six-column mega-menu instead of a drop-down. */
  mega?: boolean;
};

/**
 * The proposed navigation from the Menu update workbook, one entry per row of
 * its "Proposed navigation" tab. Seven top-level items plus the Book Now
 * button, and every service now hangs off the single Services mega-menu.
 */
export const NAV: NavItem[] = [  { label: "Home", href: "/" },
  {
    label: "Services",
    mega: true,
    children: [
      {
        label: "Car Wash",
        href: "/mobile-car-wash/",
        children: [
          { label: "Bronze Wash", href: "/mobile-car-wash/bronze-wash/" },
          { label: "Silver Wash", href: "/mobile-car-wash/silver-wash/" },
          { label: "Gold Wash", href: "/mobile-car-wash/gold-wash/" },
          { label: "Platinum Wash", href: "/mobile-car-wash/platinum-wash/" },
          { label: "Exterior Wash", href: "/mobile-car-wash/exterior-wash/" },
          { label: "Exterior Plus Wash", href: "/mobile-car-wash/exterior-plus-wash/" },
          { label: "Alloy Wheel Cleaning", href: "/mobile-car-wash/alloy-wheel-cleaning/" },
          { label: "Car Wax Service", href: "/mobile-car-wash/car-wax-service/" },
        ],
      },
      {
        label: "Car Valeting",
        href: "/car-valeting/",
        children: [
          { label: "Deep Clean Full Valet", href: "/car-valeting/deep-clean-full-valet/" },
          { label: "Mini Valet", href: "/car-valeting/mini-valet/" },
          {
            label: "Convertible Roof Cleaning",
            href: "/car-valeting/convertible-roof-cleaning/",
            children: [
              { label: "Soft Top Redye & Restoration" },
            ],
          },
          { label: "Winter Protection", href: "/car-valeting/winter-protection/" },
          { label: "Premium Full Valet", href: "/car-valeting/premium-full-valet/" },
          { label: "Summer Glow Valet", href: "/car-valeting/summer-glow-valet/" },
          { label: "Pre-Sale / End of Lease Valet", href: "/car-valeting/pre-sale-valet/" },
        ],
      },
      {
        label: "Car Detailing",
        href: "/car-detailing/",
        children: [
          { label: "Mini Car Detail", href: "/car-detailing/mini-detail/" },
          { label: "Headlight Restoration", href: "/car-detailing/headlight-restoration/" },
          { label: "Engine Bay Steam Cleaning", href: "/car-detailing/engine-bay-steam-cleaning/" },
          { label: "Car Graffiti Removal", href: "/car-detailing/car-graffiti-removal/" },
          { label: "Paint Overspray Removal", href: "/car-detailing/paint-overspray-removal/" },
        ],
      },
      {
        label: "Ceramic Coating",
        href: "/ceramic-coating/",
        children: [
          { label: "New Car Protection", href: "/ceramic-coating/new-car-protection/" },
          { label: "Paint Correction", href: "/ceramic-coating/paint-correction/" },
          { label: "Machine Polish", href: "/ceramic-coating/machine-polish/" },
          { label: "Windscreen Protection", href: "/ceramic-coating/windscreen-protection/" },
          { label: "Enhancement", href: "/ceramic-coating/enhancement-detail/" },
          { label: "Perfection", href: "/ceramic-coating/perfection-detail/" },
        ],
      },
      {
        label: "Interior Cleaning",
        children: [
          { label: "Interior Valet", href: "/car-interior-cleaning/interior-valet/" },
          { label: "Premium Interior Wash", href: "/car-interior-cleaning/premium-interior-wash/" },
          { label: "Mould Removal & Sterilisation", href: "/car-interior-cleaning/mould-removal/" },
          { label: "Car Steam Cleaning", href: "/car-interior-cleaning/steam-cleaning/" },
          { label: "Odour Removal", href: "/car-interior-cleaning/odour-removal/" },
          { label: "Leather Cleaning", href: "/car-interior-cleaning/leather-cleaning/" },
          { label: "Pet Hair Removal", href: "/car-interior-cleaning/pet-hair-removal/" },
          { label: "Flood & Water Damage", href: "/car-interior-cleaning/flooded-car-cleaning/" },
          { label: "Sickness & Biohazard Cleaning", href: "/car-interior-cleaning/vomit-cleaning/" },
        ],
      },
      {
        label: "Other Vehicles",
        children: [
          { label: "Caravan Cleaning", href: "/vehicles/caravan-cleaning/" },
          { label: "Motorhome Cleaning" },
          { label: "Motorcycle Valeting & Detailing", href: "/vehicles/motorcycle-valeting-detailing/" },
        ],
      },
    ],
  },
  {
    label: "Commercial & Fleet",
    href: "/commercial-valeting/",
    children: [
      { label: "Van Valeting" },
      { label: "Truck & HGV Cleaning", href: "/commercial-valeting/mobile-truck-cleaning/" },
      { label: "Aircraft Cleaning", href: "/commercial-valeting/aircraft-cleaning/" },
      { label: "Vehicle Signage & Vinyl Removal", href: "/commercial-valeting/car-van-stickers-removal/" },
    ],
  },
  { label: "Regular Car Cleaning", href: "/car-lovers-club/" },
  {
    label: "About",
    href: "/about-us/",
    children: [
      { label: "Blog", href: "/blog/" },
      { label: "Gift Card", href: "/gift-card/" },
      { label: "Careers & Franchising", href: "/careers-franchising/" },
      { label: "Terms And Conditions", href: "/terms-and-conditions/" },
    ],
  },
  { label: "Our Locations", href: "/our-locations/" },
  { label: "Contact Us", href: "/contact-us/" },
];


/* ── Hero ─────────────────────────────────────────────────────────────── */

export const HERO = {
  title: "Professional Mobile Valeting, Car Wash & Detailing in London",
  /** The same words, split for the staged headline wipe. Join with a space
   *  and you get `title` back verbatim — the rendered h1 text is identical. */
  titleLines: [
    "Professional Mobile Valeting,",
    "Car Wash & Detailing",
    "in London",
  ],
  /** Evidence shown along the bottom edge of the hero. */
  proof: [
    { icon: "shield", label: "£1,000,000 auto liability insured" },
    { icon: "clock", label: "On time, every time" },
    { icon: "spark", label: "Auto Finesse accredited detailers" },
  ] as const,
  intro:
    "We provide a wide range of valeting, detailing, and car wash services to customers across London without them ever having to leave the house. We bring all the equipment and expertise we need to deliver a first-class service directly to your door. Book a time and place that works for you, and we promise to arrive on time, every time.",
  ticks: [
    "Accredited Valeting and Detailing Professionals",
    "Rated 5 Stars on Google & Trustpilot",
    "Effortless Online Booking with Instant Confirmation",
  ],
  buttons: [
    { label: "BOOK NOW", href: BOOK_URL },
    { label: "VALETING PACKAGES", href: "/car-valeting/" },
    { label: "DETAILING PACKAGES", href: "/car-detailing/" },
    { label: "COMPARE OUR PACKAGES", href: "#services" },
  ],
  video: "/assets/2024/04/Medusa-Detailing-Promotional-Video.mov",
  poster: "/assets/2020/10/pexels-jae-park-37156701.webp",
  youtube:
    "https://www.youtube.com/watch?v=aLaoqoHtoCE&ab_channel=MedusaAutoDetailingLtd",
};

/* ── Why choose us ────────────────────────────────────────────────────── */

export const WHY = {
  heading: "Why Choose Medusa Auto Detailing?",
  intro:
    "There are plenty of reasons to choose us as your local mobile car wash, valeting, and detailing service in London. These are some of the most popular ones, based on extensive feedback from our satisfied customers:",
  phone: "/assets/2024/04/phone_14_01_Converted__14-ezgif.com-optimize.webp",
  items: [
    {
      icon: "/assets/2021/12/car-parts-icon-24-21.webp",
      title: "Your Local Car Care Experts",
      body: "We have been cleaning, valeting, and detailing cars across London and Hertfordshire for many years, and we bring that expertise to every job we take on.",
    },
    {
      icon: "/assets/2021/12/car-parts-icon-24-23.webp",
      title: "Ready When You Are",
      body: "At Medusa Auto Detailing, we work to your schedule—simply name a date and time when booking your appointment, and we guarantee a punctual arrival.",
    },
    {
      icon: "/assets/2021/12/car-parts-icon-24-20.webp",
      title: "A Name You Can Trust",
      body: "We are a well-established and well-reviewed company with a reputation for excellence few others can match.",
    },
    {
      icon: "/assets/2020/10/car-parts-icon-24-07.webp",
      title: "No Risk Services",
      body: "All our services are covered by our £1,000,000 auto liability insurance for your added peace of mind.",
    },
    {
      icon: "/assets/2021/12/car-parts-icon-24-08.webp",
      title: "The Right Team for the Job",
      body: "Our Auto Finesse-accredited, fully uniformed detailers bring everything they need to complete the work in a timely and efficient manner.",
    },
  ],
};

/* ── The app row ──────────────────────────────────────────────────────── */

export const APP = {
  heading: "THE APP THAT CLEANS YOUR CAR",
  phone: "/assets/2025/03/unnamed-removebg-preview.webp",
  features: [
    {
      icon: "/assets/2025/03/download-40.png",
      title: "Book Instantly",
      sub: "No more quotes",
    },
    {
      icon: "/assets/2025/03/download-41.png",
      title: "Skip the car-wash",
      sub: "We come to you",
    },
    {
      icon: "/assets/2025/03/download-42.png",
      title: "Reliable Service",
      sub: "99.6%",
    },
  ],
  badges: {
    play: "/assets/2025/03/Google-Play-Store-Button-768x252-1.webp",
    apple: "/assets/2025/03/Download_on_the_App_Store_Badge.svg-1-1.webp",
  },
  strip: "Book your car detailing online — fast, easy, and instant!",
};

/* ── Car sizes (the price carousel inside each package card) ──────────── */

export const CAR_SIZES = [
  { label: "Small Car", icon: "/assets/2021/12/car-parts-icon-24-01.png" },
  { label: "Medium Car", icon: "/assets/2021/12/car-parts-icon-24-02.png" },
  { label: "Large Car", icon: "/assets/2021/12/car-parts-icon-24-03.png" },
  { label: "XL Car", icon: "/assets/2021/12/car-parts-icon-24-04.png" },
] as const;

/* ── "What's included" popups ─────────────────────────────────────────── */

export type Included = {
  title: string;
  subtitle?: string;
  scope?: string;
  price?: string;
  body: string[];
  groups: { heading?: string; items: string[] }[];
};

export const INCLUDED: Record<string, Included> = {
  pandora: {
    title: "Pandora – Bronze",
    subtitle: "MAINTAINANCE VALET",
    scope: "Interior & Exterior",
    price: "From £65 – Approximately 2 hours",
    body: [
      "Need a really clean car quickly? Pandora – Bronze is the perfect package for you. Designed to provide a light clean of the interior and exterior of your car, this package allows you to conveniently book a wash to your doorstep where our fully qualified technicians will clean all of the general areas of your car with care. We still use the fluffiest micro fibre cloths, premium lambs wool mitts as well as the industry's leading products for this service.",
    ],
    groups: [
      {
        heading: "Exterior",
        items: [
          "Tyres & Arches deep clean",
          "Alloy wheels deep clean",
          "Citrus pre wash/ PH neutral snow foam & rinse",
          "Safe wash – 2-bucket method with lambswool mitt",
          "Plush towel dried",
          "Dry all door shuts & boot shut",
          "Exterior mirrors & glass clean",
          "Tyre's dressed",
          "Spray wax",
        ],
      },
      {
        heading: "Interior",
        items: [
          "Ashtrays and door bins emptied & rubbish removed",
          "General interior vacuum",
          "Mats removed, further agitated & hoovered",
          "Roof lining vacuum",
          "Basic interior wipe down",
          "Rubber mats cleaned, dried & protected",
          "Interior windows & mirror cleaned",
          "Air freshener of your choice",
        ],
      },
    ],
  },
  zeus: {
    title: "Zeus – Silver",
    subtitle: "STANDARD VALET",
    scope: "Interior & Exterior",
    price: "From £140 – Approximately 4 hours",
    body: [
      "The Zeus – Silver valet is designed to give a professional clean of both your vehicles exterior & interior. The Wheel & Alloy Detail ensures an extensive clean targeting not only the tires but also your alloy barrel removing tar build-up in the difficult to reach areas.",
      "The objective of the interior detail stage is to target dust & bacteria inside the vehicle. Our technicians are trained detailers and know it is the crevices that often go unnoticed. This service provides a deep-clean of the interior cabin in preparation for the surfaces to be treated. Our premium surface treatment protects interior surfaces from fading, discolouration, damage from UV rays and is also a repellent against spillages ensuring that your vehicles interior stays cleaner for longer.",
    ],
    groups: [
      {
        heading: "Exterior",
        items: [
          "Tyres & Arches deep clean",
          "Alloy wheels deep clean",
          "Citrus pre wash/ PH neutral snow foam & rinse",
          "Badges, Grills, Door shuts, Window rubbers, Lights, Panel gaps, Door handles, Inner fuel flap and surround's de-greased and cleaned",
          "Safe wash – 2-bucket method with lambswool mitt",
          "High pressure rinse with purified water",
          "Plush towel dried",
          "Crevices high pressure air blowout",
          "Dry all door shuts & boot shut",
          "Paste wax application – Up to 12 Months protection",
          "Exterior mirrors & glass clean",
          "Exterior plastic and rubber trim dressing",
          "Tyre's dressed",
          "Wheel arch dressing",
          "Quick Detailing spray applied to give your pride that extra glow",
          "Spray wax",
        ],
      },
      {
        heading: "Interior",
        items: [
          "Ashtrays and door bins emptied & rubbish removed",
          "Detailed interior vacuum",
          "General interior vacuum",
          "Air vents, buttons & crevices brushed with various detailing brushes",
          "Carpets, seats further agitated & hoovered",
          "Mats removed, further agitated & hoovered",
          "Boot liner further agitated & hoovered",
          "Roof lining vacuum",
          "Detailed clean of door pockets, sun visors, ashtrays, glovebox & cup holders",
          "Detailed interior wipe down",
          "Basic interior wipe down",
          "Minor stain removal from seats",
          "Leather interior cleaned",
          "Rubber mats cleaned, dried & protected",
          "Air vents cleaned with glue gum gel & treated",
          "Interior plastics & facias dressed",
          "Interior windows & mirror cleaned",
          "Air freshener of your choice",
        ],
      },
    ],
  },
  medusa: {
    title: "Medusa – Gold",
    subtitle: "FULL VALET",
    scope: "Interior & Exterior",
    price: "From £230 – Approximately 6 hours",
    body: [
      "Our most popular package, Medusa – Gold is designed to give an extensive, professional clean of your vehicle's interior, exterior and upholstery.",
      "We use non-abrasive cleaning methods on your vehicles exterior when removing dirt and grime ensuring a scratch and swirl mark free wash with paint work protected for months to come from elements.",
      "The service also includes a specialised detail of your vehicle's car seats, carpets and mats removing any odours or staining from the fabric or cleaning, conditioning and protecting your leather seats to restore the suppleness and prevent any further damage or cracking.",
    ],
    groups: [
      {
        heading: "Exterior",
        items: [
          "Entry level engine bay clean",
          "Tyres & Arches deep clean",
          "Alloy wheels deep clean",
          "Citrus pre wash/ PH neutral snow foam & rinse",
          "Badges, Grills, Door shuts, Window rubbers, Lights, Panel gaps, Door handles, Inner fuel flap and surround's de-greased and cleaned",
          "Safe wash – 2-bucket method with lambswool mitt",
          "Tar spot removal",
          "Iron and Fallout Remover",
          "High pressure rinse with purified water",
          "Clay bar treatment",
          "Plush towel dried",
          "Crevices high pressure air blowout",
          "Dry all door shuts & boot shut",
          "Pre wax cleanser for paintwork",
          "Synthetic sealant/ 2 in 1 Hand polish application",
          "Paste wax application – Up to 12 Months protection",
          "Polish grills, silver & chrome trims",
          "Exterior mirrors & glass clean",
          "Exterior mirrors & glass polish",
          "Glass sealant application to exterior mirrors & glass",
          "Exterior plastic and rubber trim dressing",
          "Wheel wax application",
          "Tyre's dressed",
          "Engine bay dressing",
          "Treat boot & door rubber seals",
          "Wheel arch dressing",
          "Exhaust tip polished",
          "Quick Detailing spray applied to give your pride that extra glow",
          "Spray wax",
        ],
      },
      {
        heading: "Interior",
        items: [
          "Ashtrays and door bins emptied & rubbish removed",
          "Detailed interior vacuum",
          "General interior vacuum",
          "Air vents, buttons & crevices brushed with various detailing brushes",
          "Carpets, seats further agitated & hoovered",
          "Mats removed, further agitated & hoovered",
          "Boot liner further agitated & hoovered",
          "Roof lining vacuum",
          "Roof lining minor stain removal",
          "Detailed clean of door pockets, sun visors, ashtrays, glovebox & cup holders",
          "Detailed interior wipe down",
          "Basic interior wipe down",
          "Steam clean surfaces",
          "Minor stain removal from seats",
          "Upholstery seats & mats shampoo + extract",
          "Upholstery seats & mats protected",
          "Leather interior cleaned",
          "Leather interior conditioned & protected",
          "Rubber mats cleaned, dried & protected",
          "Air vents cleaned with glue gum gel & treated",
          "Interior plastics & facias dressed",
          "Interior windows & mirror cleaned",
          "Air freshener of your choice",
        ],
      },
    ],
  },
  triton: {
    title: "Triton – Interior Valet",
    subtitle: "Superior Interior Detail",
    price: "From £100 – Approximately 3 hours",
    body: [
      "The interior valet is there for people who are not as worried about the exterior of the car but like to have the interior fresh, clean and hygienic.",
      "Our Interior Only Detail will leave your vehicles interior revitalized, sanitized, protected and perfected. We raise every surface of the interior to the highest level of perfection we can while paying close attention to every detail, surface and knob. We leave no area untouched! Your vehicle will thank you and will be in better condition than when you got it!",
    ],
    groups: [
      {
        items: [
          "Ashtrays and door bins emptied & rubbish removed",
          "Detailed interior vacuum",
          "General interior vacuum",
          "Air vents, buttons & crevices brushed with various detailing brushes",
          "Carpets, seats further agitated & hoovered",
          "Mats removed, further agitated & hoovered",
          "Boot liner further agitated & hoovered",
          "Roof lining vacuum",
          "Roof lining minor stain removal",
          "Detailed clean of door pockets, sun visors, ashtrays, glovebox & cup holders",
          "Detailed interior wipe down",
          "Basic interior wipe down",
          "Steam clean surfaces",
          "Minor stain removal from seats",
          "Leather interior cleaned",
          "Rubber mats cleaned, dried & protected",
          "Air vents cleaned with glue gum gel & treated",
          "Interior plastics & facias dressed",
          "Interior windows & mirror cleaned",
          "Air freshener of your choice",
        ],
      },
    ],
  },
  neptune: {
    title: "Neptune – Exterior Valet",
    subtitle: "Superior Exterior Detail",
    price: "From £100 – Approximately 3 hours",
    body: [
      "The elements can be rough on a vehicles exterior, especially living in London, from salt/grit and road contaminates to UV damage from the sun. Our Exterior Only Detail is a professional spa-like treatment for your vehicles exterior! We deep clean, decontaminate and add long-term protection leaving you with a showroom quality shine and gloss your ride deserves and needs! We recommend this service bi-annually.",
    ],
    groups: [
      {
        items: [
          "Entry level engine bay clean",
          "Tyres & Arches deep clean",
          "Alloy wheels deep clean",
          "Citrus pre wash/ PH neutral snow foam & rinse",
          "Badges, Grills, Door shuts, Window rubbers, Lights, Panel gaps, Door handles, Inner fuel flap and surround's de-greased and cleaned",
          "Safe wash – 2-bucket method with lambswool mitt",
          "Tar spot removal",
          "Iron and Fallout Remover",
          "High pressure rinse with purified water",
          "Plush towel dried",
          "Crevices high pressure air blowout",
          "Dry all door shuts & boot shut",
          "Paste wax application – Up to 12 Months protection",
          "Polish grills, silver & chrome trims",
          "Exterior mirrors & glass clean",
          "Exterior mirrors & glass polish",
          "Glass sealant application to exterior mirrors & glass",
          "Exterior plastic and rubber trim dressing",
          "Wheel wax application",
          "Tyre's dressed",
          "Engine bay dressing",
          "Treat boot & door rubber seals",
          "Wheel arch dressing",
          "Exhaust tip polished",
          "Quick Detailing spray applied to give your pride that extra glow",
          "Spray wax",
        ],
      },
    ],
  },
  deepvalet: {
    title: "DEEP CLEAN VALET – Deep Interior & Exterior Valet",
    body: [
      "For vehicles that haven't been cleaned in a while or that are looking to be deep cleaned after new ownership, giving your used car a new lease of life.",
    ],
    groups: [
      {
        heading: "Exterior",
        items: [
          "Exterior rinsed",
          "Alloy Wheels and Tyres cleaned",
          "Wheel arches cleaned and flushed",
          "Body soaked in citrus pre wash and rinsed",
          "Door shuts cleaned",
          "Intricate areas including grilles, petrol filler area cleaned",
          "Vehicle cleaned with premium shampoo",
          "Tar and Iron fallout chemical decontamination",
          "Body given final rinse with filtered water",
          "Exterior dried with luxury drying towel",
          "Trapped water blown out of gaps with warm air blower",
          "IPA panel wipe before Ceramic spray sealant applied",
          "Ceramic spray sealant – Up to 3 months protection",
          "Glass cleaned",
          "Tyres and arch liners dressed",
        ],
      },
      {
        heading: "Interior",
        items: [
          "Rubbish removed and personal items placed in bag",
          "Car mats removed and vacuumed",
          "Car mats shampoo & wet vacuum extracted (where req)",
          "Rubber car mats removed and pressure washed",
          "Carpets, fabric seats and boot area vacuumed",
          "Fabric seats shampoo & wet vacuum extracted (where req)",
          "Leather seats deep cleaned",
          "Vents, gear sticks, cup holders, clocks & gauges, buttons, etc – detail cleaned",
          "Dashboard and interior plastics deep cleaned with sanitiser spray",
          "Interior steam cleaned (where req)",
          "Steering wheel deep cleaned",
          "Dashboard and interior plastics protected with interior detailer",
          "Glass cleaned",
          "Air freshener applied ( if requested )",
        ],
      },
    ],
  },
  presale: {
    title: "ULTIMATE PRE SALE VALET / END OF LEASE VALET",
    body: [
      "Avoid potential lease penalties or enhance the resale value of your car.",
    ],
    groups: [
      {
        heading: "Exterior",
        items: [
          "Snow foam two-bucket hand wash.",
          "Wheels fully decontaminated including the inner rim.",
          "Tar deposits chemically removed from the paintwork.",
          "Door shuts and sills cleaned with detail spray.",
          "Paintwork hand polished/ hand waxed/ Hand glazed – This temporarily fills in any minor scratches and swirl marks that make even the cleanest car look tired",
          "Micro scratch & scruff removal – Correct the paintwork on two panels of your choice.",
          "Engine bay deep cleaned and dressed.",
          "Tyres dressed.",
          "Windows polished.",
          "Plastic trim dressed.",
          "Chrome polished.",
        ],
      },
      {
        heading: "Interior",
        items: [
          "Litter and loose dirt removed",
          "Mats removed and shampooed",
          "Interior vacuum, including all surfaces, seats and boot",
          "Dashboard and door cards cleaned",
          "Leather seats deep cleaned and treated, or",
          "Fabric seats shampooed and wet vac'd",
          "Plastic trims dressed",
          "Odour neutraliser spray to leave a fresh fragrance",
        ],
      },
    ],
  },
  mould: {
    title: "MOULD SANITISATION & STERILISATION SERVICE",
    body: [
      "Specifically designed to provide a thorough and complete sanitization of your vehicle's interior and mould removal.",
    ],
    groups: [
      {
        items: [
          "Vaporized decontamination",
          "Microbes (Viruses, Bacteria, Mould)",
          "Interior Vacuum",
          "Windows interior",
          "Dashboard Cleanse",
          "Mould & Mildew Removal",
          "Upholstery Shampoo",
          "Deep Vacuum",
        ],
      },
    ],
  },
  softtop: {
    title: "CONVERTIBLE SOFT TOP CLEAN & REPROOFING",
    body: [
      "Restore the beauty of your convertible with our soft top clean service.",
      "**Exterior Wash** — A thorough exterior wash to remove all that loose and stubborn dirt including the bodywork, wheel, and roof. All our Valeters carry all the equipment needed so you don't need to worry about providing water or electricity!",
      "**Mould & Mildew removal** — Softly massaging the fabric with specialist brushes and detergents. Your valeter will gently lift and remove and contaminants.",
      "**Rinse** — Thoroughly rinsing the fabric will expel all the dirt and leave the hood contaminant free.",
      "**Reproofing & Sealant** — Using Fabsil soft top fabric sealant, your valeter will make sure every inch of your soft top is completely reproofed and ready for any weather. This fabric sealant ensures that the water absorption is kept to a minimum by creating a hydrophobic layer.",
    ],
    groups: [],
  },
};

/* ── Valeting packages ────────────────────────────────────────────────── */

export type Package = {
  title: string;
  subtitle: string;
  prices: [number, number, number, number]; // small, medium, large, xl
  style: "gold" | "white";
  included: keyof typeof INCLUDED;
  badge?: string;
  /** The named bronze/silver/gold ladder, shown as the lead tier. The rest
   *  are single-purpose valets and read better as a compact board. */
  featured?: boolean;
};

export const VALETING_INTRO = {
  heading: "MOBILE VALETING",
  body: "Valeting is a full deep-clean of your car and, like our mobile car wash service, can include the exterior or interior of the vehicle, or both. The process involves cleaning, polishing, and waxing the bodywork until it looks as good as new, as well as cleaning the wheels, dressing the tyres and exterior plastics, polishing the glass, and more. We offer a variety of packages, each offering a more thorough valeting service than the one before, so there is something for every budget. Click on one of the images below to learn more about what is included:",
};

export const VALETING: Package[] = [
  {
    title: "PANDORA – BRONZE",
    subtitle: "Maintenance Valet",
    prices: [70, 75, 85, 90],
    style: "gold",
    included: "pandora",
    featured: true,
  },
  {
    title: "ZEUS – SILVER",
    subtitle: "Full Valet",
    prices: [130, 140, 150, 160],
    style: "white",
    included: "zeus",
    badge: "MOST POPULAR",
    featured: true,
  },
  {
    title: "MEDUSA – GOLD",
    subtitle: "Interior & Exterior Valet",
    prices: [220, 245, 270, 280],
    style: "white",
    included: "medusa",
    badge: "POPULAR",
    featured: true,
  },
  {
    title: "MINI VALET",
    subtitle: "Mobile Valet",
    prices: [55, 60, 65, 70],
    style: "gold",
    included: "pandora",
  },
  {
    title: "TRITON",
    subtitle: "Superior Interior Valet",
    prices: [115, 125, 135, 145],
    style: "gold",
    included: "triton",
  },
  {
    title: "NEPTUNE",
    subtitle: "Superior Exterior Valet",
    prices: [115, 125, 135, 140],
    style: "gold",
    included: "neptune",
  },
  {
    title: "DEEP CLEAN VALET",
    subtitle: "Deep Interior & Exterior Valet",
    prices: [175, 185, 195, 205],
    style: "white",
    included: "deepvalet",
  },
  {
    title: "ULTIMATE PRE SALE VALET",
    subtitle: "END OF LEASE VALET",
    prices: [225, 250, 285, 295],
    style: "white",
    included: "presale",
  },
  {
    title: "MOULD SANITISATION",
    subtitle: "STERILISATION SERVICE",
    prices: [180, 210, 220, 230],
    style: "white",
    included: "mould",
  },
  {
    title: "CONVERTIBLE SOFT TOP CLEAN",
    subtitle: "REPROOFING",
    prices: [115, 115, 115, 115],
    style: "white",
    included: "softtop",
  },
];

/* ── Extra services strip ─────────────────────────────────────────────── */

export const EXTRA_SERVICES = [
  {
    title: "Autoglym HD Wax",
    body: "Our skilled professionals meticulously apply the wax to ensure maximum coverage and durability, giving your car a lasting protective layer and an exceptional shine. Autoglym HD Wax—for those who want the very best for their vehicle's care.",
    image:
      "/assets/2024/10/bf24ca41-deff-4cfe-a8ce-ea5ce4aa0220.__CR00300300_PT0_SX300_V1___.webp",
    href: "/mobile-car-wash/car-wax-service/",
  },
  {
    title: "Engine bay cleaning",
    body: "Discover more about our Engine Bay Steam Cleaning service below, and see how we can help your vehicle shine from the inside out, making a lasting impression both under the hood and with potential buyers.",
    image: "/assets/2024/10/wipping-car-engine-080520210315.webp",
    href: "/car-detailing/engine-bay-steam-cleaning/",
  },
  {
    title: "OZONE Odour Removal",
    body: "When conventional methods fall short, an ozone treatment may be your best option. At Medusa Auto Detailing, we bring the ozone treatment directly to you!",
    image: "/assets/2024/10/car-ozon-600x400-1.webp",
    href: "/car-interior-cleaning/odour-removal/",
  },
  {
    title: "Pet Hair Removal",
    body: "Our specialized techniques and keen attention to detail make us the top choice for pet hair removal, leaving your car looking and smelling as good as new. With our expert services, you can enjoy a fresh interior without the hassle of pet-related messes!",
    image: "/assets/2024/10/dog-hair-remover.webp",
    href: "/car-interior-cleaning/pet-hair-removal/",
  },
];

/* ── Detailing ────────────────────────────────────────────────────────── */

export const DETAILING_INTRO = {
  heading: "MOBILE DETAILING",
  body: "While valeting ensures your vehicle looks like it has just rolled off the forecourt, detailing takes things to a whole new level. It includes the same high-end cleaning process as our valeting service, topped off with specialist techniques to remove even the slightest scratches, swirls, and blemishes from your bodywork. We use the latest equipment to polish your paintwork to retain its original deep lustre and then apply a variety of finishes to offer greater protection moving forward. Just like our valeting service, our detailing packages provide a range of options for our London customers, depending on their individual needs. Click on an icon below to learn more about what we offer:",
};

export const DETAILING = [
  {
    title: "LEVEL 1",
    subtitle: "NEW CAR / PROTECTION",
    prices: [349, 399, 449, 499] as [number, number, number, number],
    href: "/ceramic-coating/new-car-protection/",
  },
  {
    title: "LEVEL 2",
    subtitle: "MINI CAR DETAIL",
    prices: [300, 325, 350, 375] as [number, number, number, number],
    href: "/car-detailing/mini-detail/",
  },
  {
    title: "LEVEL 3",
    subtitle: "ENHANCEMENT",
    prices: [450, 500, 550, 600] as [number, number, number, number],
    href: "/ceramic-coating/enhancement-detail/",
  },
  {
    title: "LEVEL 4",
    subtitle: "CORRECTION",
    prices: [600, 650, 700, 750] as [number, number, number, number],
    href: "/ceramic-coating/paint-correction/",
  },
  {
    title: "LEVEL 5",
    subtitle: "PERFECTION",
    prices: [1200, 1400, 1500, 1600] as [number, number, number, number],
    href: "/ceramic-coating/perfection-detail/",
  },
];

/* ── Mobile car wash ──────────────────────────────────────────────────── */

export const CARWASH_INTRO = {
  heading: "MOBILE CAR WASH",
  body: "This quick and easy mobile car washing service is for drivers who keep their vehicle nice and clean and want it to stay that way. It's the perfect solution for customers looking for a regular cleaning routine for their car—one that gets rid of the day-to-day dirt that comes with driving around a big city. We offer an exterior and interior car wash service for lightly soiled vehicles that keeps your car looking good. For more ground-in dirt and grime, we recommend one of our mobile valeting packages.",
};

export const CARWASH = [
  {
    title: "BRONZE WASH",
    time: "(40-60 Mins)",
    price: "£37-£48",
    image:
      "/assets/2025/02/young-man-washing-car-on-carwash-station-outdoor-2023-11-27-05-27-22-utc-1-1.webp",
    href: "/mobile-car-wash/bronze-wash/",
    features: ["Wash", "Buff", "In/Out Glass Shine", "Light Vacuum", "Dashboard"],
  },
  {
    title: "SILVER WASH",
    time: "(60-90 Mins)",
    price: "£48-£60",
    image:
      "/assets/2025/02/car-cleaning-with-high-pressure-in-exterior-carwas-2023-11-27-05-35-22-utc-1.webp",
    href: "/mobile-car-wash/silver-wash/",
    features: [
      "Wash",
      "Wax",
      "Tyre Shine",
      "Plastic Dressing",
      "Buff",
      "Spare Tyre Area",
      "In/Out Glass Shine",
      "Vacuum",
      "Dashboard",
    ],
  },
  {
    title: "GOLD WASH",
    time: "(120-180 Mins)",
    price: "£110-£140",
    image:
      "/assets/2025/02/professional-car-wash-with-high-pressure-washer-an-2023-11-27-05-33-04-utc-e1720860612612.webp",
    href: "/mobile-car-wash/gold-wash/",
    features: [
      "Thorough Exterior Wash",
      "Paste Wax",
      "Tyre Shine",
      "Trim Conditioner",
      "Buff",
      "Upholstery Clean",
      "Leather Treatment",
      "In/Out Glass Shine",
      "Deep Vacuum",
      "Dashboard",
      "Spare Tyre Area",
    ],
  },
  {
    title: "PLATINUM WASH",
    time: "(150-210 Mins)",
    price: "£170-£225",
    image:
      "/assets/2025/02/professional-cleaning-process-for-leather-car-seat-2023-11-27-05-05-14-utc-e1720861019858.webp",
    href: "/mobile-car-wash/platinum-wash/",
    features: [
      "Thorough Exterior Wash",
      "Hybrid Ceramic Wax - SiO2 Paint Protection",
      "Buff",
      "Interior Detailed Clean",
      "Deep Vacuum",
      "Leather Conditioner",
      "Upholstery Shampoo & Sealant",
      "Tyre Dressing",
      "Trim Conditioner",
      "In/Out Glass Shine",
      "Dashboard",
      "Wheel Arches Deep Clean",
    ],
  },
  {
    title: "PREMIUM INTERIOR WASH",
    time: "(60-120 Mins)",
    price: "£90-£120",
    image:
      "/assets/2025/02/professional-car-cleaning-cleaning-the-steering-w-2023-11-27-05-30-02-utc-e1720860904413.webp",
    href: "/car-interior-cleaning/premium-interior-wash/",
    features: [
      "The Ultimate Interior Clean",
      "Deep Vacuum",
      "Upholstery Shampoo",
      "Upholstery Conditioner",
      "Door Shuts Wiped & Cleaned",
      "Dashboard Cleanse",
      "Spare Tyre Area",
    ],
  },
  {
    title: "EXTERIOR WASH",
    time: "(30-50 Mins)",
    price: "£35-£42",
    image: "/assets/2025/02/car-wash-2023-11-27-05-28-52-utc-e1720860749845.webp",
    href: "/mobile-car-wash/exterior-wash/",
    features: ["Wash", "Buff & Dry", "Wheels", "Tyres", "Exterior Glass"],
  },
  {
    title: "EXTERIOR PLUS WASH",
    time: "(45-75 Mins)",
    price: "£41-£52",
    image: "/assets/2025/02/water-2023-11-27-05-35-50-utc-1-e1720862985495-1.webp",
    href: "/mobile-car-wash/exterior-plus-wash/",
    features: [
      "Thorough Exterior Wash",
      "Buff & Dry",
      "Paste Wax",
      "Tyre Dressing",
      "Plastic Dressing",
      "Wheels & Arches",
      "Exterior Glass",
    ],
  },
];

/* ── Portfolio (Instagram feed) ───────────────────────────────────────── */

export const PORTFOLIO = [
  "/assets/spotlight-insta/17856226038264508-s-80-400.jpg",
  "/assets/spotlight-insta/17843992917352687-s-80-400.jpg",
  "/assets/spotlight-insta/18144437407356291-s-80-400.jpg",
  "/assets/spotlight-insta/18206174335292595-s-80-400.jpg",
  "/assets/spotlight-insta/18047421869008357-s-80-400.jpg",
  "/assets/spotlight-insta/18005772500502141-s-80-400.jpg",
  "/assets/spotlight-insta/17930702138950519-s-80-400.jpg",
  "/assets/spotlight-insta/18042879295908651-s-80-400.jpg",
  "/assets/spotlight-insta/17922838169886586-s-80-400.jpg",
];

/* ── Testimonials ─────────────────────────────────────────────────────── */

export const TESTIMONIALS = [
  "Guys showed up right at 8am when they said they would. Very professional and did an amazing job. My car looks better now than it did leaving the dealership over a year ago!!! Definitely found a repeat customer!!",
  "I don't often do reviews, but these guys are awesome and deserve all 5 stars. Took my filthy 03 Subaru outback n made it shine brighter than when I bought it. Wish I had done a before n after. Good job guys...very pleased. ..very",
  "You are amazing guys. I called them for two cars to be washed and detailed even, engine cleaning. All services were done very well. One of the cars was new and it looks so much better than when i got it. Also the guys came on time they clean my car absolutely amazing, price was very good, they are very experienced and friendly and you will receive a personal attention for sure. Highly recommend them!",
  "This is the best car wash and detail I've ever had. He's in a mobile van and can come to your home or office. He really takes his time and ensures not one speck of dust or dirt is on your car. His prices are very affordable and he is VERY through. Best mobile car detailing service provider in London. Highly recommend!",
];

export const REVIEW_BADGES = [
  { icon: "/assets/2020/10/002-google-maps.webp", label: "5/5 Stars" },
  { icon: "/assets/2020/10/001-facebook.webp", label: "5/5 Stars" },
  { icon: "/assets/2020/10/index1-e1602289165470.webp", label: "5/5 Stars" },
];

/* ── Club / areas / FAQ ───────────────────────────────────────────────── */

export const CLUB = {
  kicker: "LOOKING TO SET UP SOMETHING MORE REGULAR?",
  title: "The Car Lovers Club",
  body: "Elevate your car care routine with our subscription service. Enjoy the luxury of regular vehicle maintenance tailored to your schedule—weekly, fortnightly, or monthly. Maintain your vehicle's pristine condition, enhance its longevity, and enjoy the peace of mind that comes with professional care at your convenience.",
  cta: { label: "FIND OUT MORE", href: "/car-lovers-club/" },
  bg: "/assets/2022/01/brad-starkey-eP8h7YVhFHk-unsplash-min-scaled.webp",
};

export const AREAS_INTRO = {
  heading: "MOBILE CAR WASH, VALETING, & DETAILING NEAR YOU",
  body: [
    "From our office in Harrow, our team of technicians travels across much of the capital and into Hertfordshire. This includes North London, North West London, West London, Central London, and, of course, Greater London. Wherever your car is located in our service area, we promise a prompt and punctual arrival to every mobile car wash, valeting, and detailing job.",
    "All areas we cover in London are highlighted on the map, if your location isn't covered, and you wish to book a mobile car wash, just get in touch, and we'll try our best to work something out.",
  ],
  map: "https://www.google.com/maps/d/embed?mid=1rKqYRwrmA9TEVpwaWyLFM5AYZUATtJk&ehbc=2E312F",
};

export const AREAS = [
  {
    title: "Mobile Car Valeting",
    body: "North West London: Brent, Colindale, Edgware, Golders Green, Harrow, Hendon, Mill Hill, Northwood, Pinner, Preston, Stanmore, Sudbury, Wembley West London: Chiswick, Ealing, Eastcote, Hillingdon, Hounslow, Park Royal, Ruislip, Twickenham, Notting Hill, Uxbridge, Central London: Chelsea, Earls Court, Hammersmith, Kensington, Knightsbridge, West Brompton, Westminster North London: Barnet, Enfield, Finchley, Friern Barnet, Islington Greater London: Hayes Slough East London: Chingford, Ilford, Hertfordshire: Watford, St Albans, Borehamwood",
  },
  {
    title: "Mobile Car Detailing",
    body: "North West London: Brent, Colindale, Edgware, Golders Green, Harrow, Hendon, Mill Hill, Northwood, Pinner, Preston, Stanmore, Sudbury, Wembley West London Chiswick, Ealing, Eastcote, Hillingdon, Hounslow, Kingston Park Royal, Ruislip, Twickenham, Notting Hill, Uxbridge Central London: Belgravia Chelsea, Earls Court, Hammersmith, Kensington, Knightsbridge, West Brompton, Westminster North London: Barnet, Enfield, Fulham, Finchley, Friern Barnet, Islington, Greater London, Hayes, Slough East London: Chingford, Ilford Hertfordshire: Watford, St Albans, Borehamwood",
  },
  {
    title: "Mobile Car Wash",
    body: "North West London: Brent, Colindale, Edgware, Golders Green, Harrow, Hendon, Mill Hill, Northwood, Pinner, Preston, Stanmore, Sudbury, Wembley West London: Chiswick, Ealing, Eastcote, Fulham, Hillingdon, Hounslow, Kingston, Park Royal, Ruislip, Twickenham, Notting Hill, Uxbridge Central London: Belgravia, Chelsea, Earls Court, Hammersmith, Kensington, Knightsbridge, West Brompton, Westminster North London: Barnet, Enfield, Finchley, Friern Barnet, Islington Greater London: Ilford Hayes Slough Hertfordshire: Watford, St Albans, Borehamwood",
  },
];

export const FAQ = [
  {
    q: "Are you a hand car wash?",
    a: ["We provide mobile car wash services across London, including hand car washing. Additionally, we offer a range of premium valeting and detailing packages to suit your needs."],
  },
  {
    q: "How do I make a booking?",
    a: ["Booking is quick and easy. Simply select the package that fits your requirements, click “Book Now,” and choose a convenient date and time. The entire process takes less than 60 seconds, and payment is only required once the service is complete."],
  },
  {
    q: "What payment methods do you accept?",
    a: ["To secure your booking, we perform a debit or credit card pre-authorisation of £1.00, which will be released within 5 working days. On the day of service, you can choose to pay in cash or via the pre-authorised card—just inform the valeter when they arrive."],
  },
  {
    q: "How can I contact you?",
    a: [
      "You can reach us through the following channels:",
      "Phone: Call us directly at 02033556435.",
      "Email: Send enquiries to info@medusaautodetailing.co.uk.",
      "Website: Use our contact form or booking tool.",
      "Social Media: Message us on our social media platforms.",
      "We're here to assist with any questions or special requests.",
    ],
  },
  {
    q: "Is Medusa Auto Detailing insured?",
    a: ["Yes, Medusa Auto Detailing Ltd is fully insured, providing comprehensive coverage to protect your vehicle during all valeting and detailing services."],
  },
  {
    q: "Where can you wash my car?",
    a: ["We offer mobile services at your home, workplace, or any suitable location. Your car can be parked on a driveway, street, or even in an underground car park. We only need a parking space within 15 meters of your vehicle for our van."],
  },
  {
    q: "Do you provide water and electricity?",
    a: ["Yes, our vans are equipped with a 250L tank of ultra-pure water and Honda generators to supply electricity. If you're able to provide access to electricity, it helps reduce emissions and noise, but this is completely optional."],
  },
  {
    q: "What cleaning products do you use?",
    a: [
      "We use premium products from Autoglym, a leading UK car care brand. Our team is highly trained to ensure these products are applied effectively for outstanding results.",
      "We use premium car valeting products from Autoglym, the UK's leading car care brand. Our team is highly trained and experienced in applying these products for the best results.",
    ],
  },
  {
    q: "Do I need to empty my car before the valet?",
    a: ["To help us deliver the best results within the scheduled time, please remove any personal items from your vehicle before our team arrives."],
  },
  {
    q: "What happens if it rains or snows on the day of my appointment?",
    a: ["In the event of severe weather, such as heavy rain, snow, or extreme conditions, we will contact you to reschedule. For light rain, our team is fully prepared to provide top-quality service regardless of the weather."],
  },
  {
    q: "Can you remove odours such as cigarette smoke, milk, vomit, or pet smells?",
    a: ["Yes, we specialise in eliminating tough odours. For the best results, we recommend our Odour and Mould Sanitisation package."],
  },
  {
    q: "Can I get a receipt or VAT invoice?",
    a: ["Although we are not VAT registered, we can provide a detailed invoice via email upon request after the service has been completed and paid for."],
  },
];

/* ── Footer ───────────────────────────────────────────────────────────── */

export const FOOTER = {
  logo: "/assets/2020/10/b-112.png",
  legalName: "Medusa Auto Detailing Ltd",
  registration: "Registered N° 12890876",
  note: "Congestion Charge & out of area surcharges may be applicable.",
  quickLinks: [
    {
      label: "Commercial Valeting and Detailing",
      href: "/commercial-valeting/",
    },
    { label: "Careers & Franchising", href: "/careers-franchising/" },
    { label: "Our Partners", href: "/our-partners/" },
    { label: "Caravan Valeting", href: "/vehicles/caravan-cleaning/" },
    { label: "Blog", href: "/blog/" },
  ],
  legal: [
    { label: "Privacy Policy & Cookies", href: "/privacy-policy-cookies/" },
    { label: "Terms & Conditions", href: "/terms-and-conditions/" },
  ],
  timings: [
    "Open 7 Days a week",
    "Mon-Fri : 07 am – 06 pm",
    "Sat-Sun : 09 am – 05 pm",
    "After hours appointments by special request",
  ],
  copyright: "© 2026 Mobile Car Detailing & Valeting.",
};
