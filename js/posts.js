/*
 * AeroNotes — yazılar burada.
 * Yeni yazı eklemek için: siteden "Write" sayfasını açın, formu doldurun,
 * oluşan kodu kopyalayıp aşağıdaki POSTS listesinin EN ÜSTÜNE yapıştırın.
 * İçerik (content) basit Markdown destekler: ## başlık, **kalın**, *italik*, - liste, > alıntı, [link](url)
 */

const SITE = {
  name: "AeroNotes",
  tagline: "A Student Blog on Aerospace & Space",
  author: "Umutcan Bakırcı",
  repo: "umut190316/aeronotes" // örn: "kullaniciadi/aeronotes" — Write sayfasındaki GitHub düzenleme linki için
};

const CATEGORIES = ["Aviation", "Space", "Propulsion", "Aerodynamics", "Sustainability", "Technology"];

const POSTS = [
  {
    id: "morphing-winglets",
    title: "Morphing Winglets: A Path to More Efficient Aviation",
    excerpt: "How adaptive wingtip systems can reduce drag and improve performance in varying flight conditions.",
    category: "Aviation",
    tag: "Aerospace",
    date: "2026-11-16",
    readTime: 6,
    cover: "assets/wing.webp",
    featured: true,
    content: `
Every commercial airliner flies through a wide range of conditions on a single trip: a heavy climb-out, a long cruise, and a slow, high-lift approach. Yet the wingtip — the region that decides a large share of **induced drag** — is usually a fixed piece of carbon fibre designed for one compromise point. Morphing winglets try to remove that compromise.

## Why wingtips matter

A lifting wing creates a pressure difference between its lower and upper surfaces. At the tip, air spills around from high to low pressure and rolls up into a trailing vortex. That vortex tilts the local lift vector backwards, and the backward component is what we call induced drag. On a typical airliner in cruise it accounts for roughly 40% of total drag, and during take-off it can be even more dominant.

Classic winglets reduce the strength of this vortex by effectively increasing the wing's span loading without increasing the physical span as much. The problem is that the optimum cant and toe angles at cruise are not the optimum angles at take-off or in turbulent air.

## What "morphing" means

A morphing winglet changes its geometry in flight. Research concepts include:

- **Variable cant angle** — the winglet rotates about a hinge line, from near-vertical to near-horizontal.
- **Variable toe (twist)** — the winglet's incidence changes to re-distribute load.
- **Compliant trailing edges** — flexible skins that change camber without discrete hinges.

> The goal is not only lower fuel burn, but also using the winglet as an active control surface for gust and manoeuvre load alleviation.

## The structural side

Bending moment at the wing root is a hard constraint. A larger, more efficient winglet increases root bending, which means a heavier wing box. By actively unloading the tip during gusts, a morphing winglet can keep the peak loads low while still flying the efficient shape in calm cruise. That is where the real benefit lies: aerodynamic and structural gains are coupled.

## Challenges

Actuators add mass, power demand and failure modes. Certification authorities need to see that a jammed winglet still leaves the aircraft safe and controllable. Icing, lightning strike protection and maintenance access are also non-trivial at the very tip of the wing.

## Outlook

Studies suggest fuel savings in the range of 1–3% beyond a fixed winglet, which is significant over the 25-year life of an airliner. With folding wingtips already in service on new wide-bodies, the hardware for moving wingtips is no longer science fiction — the next step is making them move *smartly*.
`
  },
  {
    id: "reusable-launch-vehicles",
    title: "Reusable Launch Vehicles: Current Status and Future Outlook",
    excerpt: "From propulsive landings to rapid turnaround — where reusability stands today and what comes next.",
    category: "Space",
    date: "2026-11-10",
    readTime: 7,
    cover: "assets/rocket.webp",
    content: `
For most of the space age, rockets were thrown away after a single flight. Imagine scrapping an airliner after each trip — that was the economics of access to orbit. Reusability changes the equation by turning the most expensive hardware into an asset rather than a consumable.

## Where we are

Propulsively landed first stages are now routine. Boosters return to land or to a drone ship, are inspected, refurbished and flown again — some of them well over twenty times. Fairing recovery has also become standard practice.

## The hard part: the upper stage

The first stage separates at a relatively low speed (around Mach 6–10). The upper stage, however, reaches orbital velocity of about 7.8 km/s and must survive a full re-entry. That requires:

- A **thermal protection system** that can be reused without lengthy repair
- Enough propellant margin for a landing burn, which directly cuts payload
- Structures that tolerate repeated thermal cycles

## Turnaround time

Reusability only pays off when refurbishment is cheaper and faster than building new. The target for next-generation vehicles is airline-like operations: land, refuel, fly again within hours. That is as much a ground operations problem as a vehicle design problem.

## Outlook

Fully reusable two-stage systems are in active testing, and several companies around the world are developing reusable medium-lift launchers. If full reuse works, cost per kilogram to orbit could drop by another order of magnitude — enabling large constellations, orbital refuelling and, eventually, crewed missions beyond the Moon.
`
  },
  {
    id: "sustainable-aviation-fuel",
    title: "Sustainable Aviation Fuel (SAF): From Concept to Operations",
    excerpt: "What SAF is, how it is produced, and why it is the most realistic near-term lever for aviation's emissions.",
    category: "Propulsion",
    date: "2026-11-07",
    readTime: 5,
    cover: "assets/engine.webp",
    content: `
Electric and hydrogen aircraft get most of the headlines, but for long-haul flights in the next two decades the most realistic decarbonisation tool is **Sustainable Aviation Fuel**.

## What is SAF?

SAF is a drop-in replacement for conventional Jet A-1. "Drop-in" means it can be blended with fossil kerosene and used in existing engines and fuel infrastructure without modification. Today, certified blends of up to 50% are permitted, and 100% SAF test flights have already been carried out.

## Production pathways

- **HEFA** — hydroprocessed esters and fatty acids, made from used cooking oil and animal fats. Mature, but feedstock-limited.
- **Alcohol-to-Jet** — converts ethanol or isobutanol into jet fuel.
- **Fischer–Tropsch** — gasifies biomass or waste into syngas, then synthesises hydrocarbons.
- **Power-to-Liquid (e-fuels)** — combines green hydrogen with captured CO₂. Very scalable in theory, but energy-intensive and currently expensive.

## Life-cycle emissions

SAF still releases CO₂ when burned. The reduction comes from the *life cycle*: the carbon was recently absorbed from the atmosphere, either by plants or by direct capture. Depending on the pathway, life-cycle reductions of 50–80% compared to fossil jet fuel are reported.

## The bottleneck

Cost (two to five times conventional fuel) and production volume are the main barriers. Blending mandates in Europe and incentive programmes elsewhere are creating demand — now production capacity needs to catch up.
`
  },
  {
    id: "small-satellites-earth-observation",
    title: "The Role of Small Satellites in Earth Observation",
    excerpt: "CubeSats and smallsats are changing how often — and how cheaply — we can image our planet.",
    category: "Space",
    date: "2026-11-03",
    readTime: 6,
    cover: "assets/satellite.webp",
    content: `
Earth observation used to be the domain of large, expensive satellites built over a decade. Today, constellations of small satellites image the entire land surface of the planet every day.

## Why small?

Small satellites — from 1U CubeSats (10 × 10 × 10 cm) to spacecraft of a few hundred kilograms — benefit from commercial electronics, standardised buses and rideshare launches. Lower cost per unit makes it possible to launch *many*, which is the key to high **revisit rates**.

## What they can do

- **Optical imaging** for agriculture, urban planning and disaster response
- **Synthetic Aperture Radar (SAR)** that sees through clouds and at night
- **Hyperspectral sensing** for crop health, mineral mapping and pollution monitoring
- **AIS and RF monitoring** for tracking ships and signals

## Limitations

Physics still applies: a smaller aperture limits resolution, and small platforms have limited power and downlink capacity. Many missions now process data on board with machine learning so that only useful information is sent down.

## Outlook

The trend is toward tasking on demand, on-orbit processing and data fusion across optical, radar and RF sensors. For students, CubeSats are also one of the best hands-on ways to get into space engineering.
`
  },
  {
    id: "airfoil-basics-lift",
    title: "Airfoils 101: How Lift Really Works",
    excerpt: "Beyond the equal-transit-time myth: pressure, circulation and the Kutta condition explained simply.",
    category: "Aerodynamics",
    date: "2026-10-28",
    readTime: 8,
    cover: "assets/airfoil.webp",
    content: `
Almost everyone has heard that air over the top of a wing "has to travel further, so it goes faster". It is a tidy explanation — and it is wrong. Let's look at what actually happens.

## The equal-transit-time myth

There is no physical law that forces two air particles split at the leading edge to meet again at the trailing edge. In fact, wind-tunnel smoke visualisations show that air over the upper surface arrives at the trailing edge *much earlier* than air underneath.

## Pressure is the real story

Lift is the net result of the pressure distribution around the airfoil. The upper surface sees lower pressure than the lower surface; integrate that difference over the wing area and you get lift. Faster flow and lower pressure go together (Bernoulli), but the *cause* of the speed difference is the airfoil's shape and angle of attack turning the flow.

## Circulation and the Kutta condition

A sharp trailing edge forces the flow to leave the airfoil smoothly — this is the **Kutta condition**. To satisfy it, the flow field develops a net circulation Γ around the airfoil. The Kutta–Joukowski theorem then gives lift per unit span:

> L′ = ρ · V∞ · Γ

## Newton is also right

Equivalently, the wing deflects air downward (downwash). By Newton's third law, the air pushes the wing up. Pressure and momentum views are two descriptions of the same physics.

## Takeaways

- Lift comes from pressure differences, produced by flow turning
- Equal transit time is a myth
- Circulation, Bernoulli and Newton are consistent descriptions — not competing theories
`
  }
];
