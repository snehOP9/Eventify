export const categories = [
  {
    id: "design",
    label: "Design",
    tagline: "Brand, product, motion, and immersive interface craft",
    icon: "Sparkles",
    accent: "from-sky-400/25 via-cyan-500/20 to-emerald-400/10"
  },
  {
    id: "startup",
    label: "Startup",
    tagline: "Investor rooms, GTM labs, and founder networking",
    icon: "Rocket",
    accent: "from-fuchsia-500/25 via-violet-500/20 to-sky-500/10"
  },
  {
    id: "technology",
    label: "Technology",
    tagline: "AI, engineering, cloud, and data experiences",
    icon: "Cpu",
    accent: "from-cyan-500/25 via-sky-500/20 to-indigo-500/10"
  },
  {
    id: "music",
    label: "Culture",
    tagline: "Night sessions, creators, live sound, and stage energy",
    icon: "Headphones",
    accent: "from-amber-400/20 via-rose-500/20 to-fuchsia-500/10"
  }
];

export const featuredStats = [
  { label: "Curated events", value: 320, suffix: "+" },
  { label: "Happy attendees", value: 18000, suffix: "+" },
  { label: "Cities activated", value: 42, suffix: "" },
  { label: "Avg. fill rate", value: 96, suffix: "%" }
];

export const testimonials = [
  {
    id: 1,
    name: "Sana Arora",
    role: "Product Designer, Northstar Labs",
    quote:
      "The booking flow feels like a luxury product. Every interaction is calm, confident, and fast.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Rohan Mehta",
    role: "Founder, Velocity Works",
    quote:
      "We switched our flagship summit to this experience and saw registrations jump in the first week.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Community Lead, Frame & Flow",
    quote:
      "It has the polish of a top-tier SaaS product while still feeling incredibly easy for attendees.",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80"
  }
];

export const events = [
  {
    id: "neo-summit-2026",
    title: "Neo Summit 2026",
    category: "technology",
    categoryLabel: "AI & Engineering",
    city: "Bangalore",
    location: "Skyline Convention Center",
    venue: "Hall A, Skyline Convention Center",
    organizer: "Eventify Originals",
    date: "2026-05-21T09:00:00",
    time: "09:00 AM - 07:30 PM",
    seatsLeft: 48,
    capacity: 480,
    priceFrom: 2499,
    mode: "Hybrid",
    featured: true,
    heroTag: "Flagship Experience",
    poster:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "A cinematic one-day summit for builders shaping the next era of product, AI, and culture.",
    description:
      "Neo Summit blends keynotes, founder rooms, immersive showcases, and quiet collaboration zones into one high-signal day built for modern operators.",
    about:
      "Step into a future-facing experience where AI founders, product leaders, and creative technologists unpack how meaningful digital products are designed, funded, and scaled. From keynote arcs to intimate breakout labs, every segment is choreographed for momentum.",
    tags: ["AI", "Product", "Founders", "Networking"],
    ticketTiers: [
      {
        id: "neo-general",
        title: "General Access",
        price: 2499,
        perks: ["Main stage entry", "Networking lounges", "Coffee bar access"]
      },
      {
        id: "neo-premium",
        title: "Premium Circle",
        price: 5499,
        perks: ["Priority seating", "Workshop access", "Premium dinner session"]
      },
      {
        id: "neo-vip",
        title: "VIP Afterglow",
        price: 8999,
        perks: ["Founder dinner", "Speaker meetups", "Concierge check-in"]
      }
    ],
    timeline: [
      { time: "09:00", title: "Arrival and sensory check-in", detail: "Immersive welcome tunnel and coffee ritual." },
      { time: "10:00", title: "Keynote: Designing credible AI products", detail: "Lessons from product teams shipping daily." },
      { time: "13:30", title: "Founder roundtables", detail: "Small-group strategy sessions with operators and investors." },
      { time: "17:30", title: "Future showcase", detail: "Live demos of tools, hardware, and visual experiences." }
    ],
    speakers: [
      {
        name: "Aanya Kapoor",
        role: "Chief Product Officer, Hyperlane",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Vikram Sen",
        role: "Founder, Neural Bridge",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Leah Tan",
        role: "Experience Director, Panorama Studio",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
      }
    ],
    faqs: [
      {
        question: "Is the event suitable for students and early builders?",
        answer:
          "Yes. Sessions are curated for a wide range of experience levels, and the workshop tracks are especially beginner-friendly."
      },
      {
        question: "Will recordings be available after the event?",
        answer:
          "Premium Circle and VIP Afterglow passes include 30-day replay access for keynote and panel sessions."
      }
    ]
  },
  {
    id: "aurora-design-lab",
    title: "Aurora Design Lab",
    category: "design",
    categoryLabel: "Product Design",
    city: "Mumbai",
    location: "The Loft at Nariman Point",
    venue: "Studio Atrium, Nariman Point",
    organizer: "Frame & Flow",
    date: "2026-04-28T14:00:00",
    time: "02:00 PM - 08:00 PM",
    seatsLeft: 22,
    capacity: 180,
    priceFrom: 1899,
    mode: "In Person",
    featured: true,
    heroTag: "Hands-On Masterclass",
    poster:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "An intimate craft-focused workshop on visual systems, motion language, and emotional UI design.",
    description:
      "Learn how world-class interfaces are staged, critiqued, and refined with real examples from product teams and motion designers.",
    about:
      "Aurora Design Lab is built for designers who care about precision, memorability, and modern product polish. Expect live teardowns, system thinking, and motion critique sessions designed to sharpen your eye.",
    tags: ["Design Systems", "Motion", "UI", "Craft"],
    ticketTiers: [
      {
        id: "aurora-standard",
        title: "Studio Pass",
        price: 1899,
        perks: ["Workshop seat", "Critique deck", "Refreshment service"]
      },
      {
        id: "aurora-pro",
        title: "Critique Pass",
        price: 3299,
        perks: ["Portfolio review", "Exclusive templates", "Networking session"]
      }
    ],
    timeline: [
      { time: "14:00", title: "Opening visual keynote", detail: "Designing for emotional clarity and depth." },
      { time: "15:30", title: "Live interface teardown", detail: "Dissecting premium product interactions in real time." },
      { time: "17:00", title: "System workshop", detail: "Color, spacing, motion, and type alignment." }
    ],
    speakers: [
      {
        name: "Mira Patel",
        role: "Design Lead, Skygrid",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Daniel Wu",
        role: "Motion Director, Null Studio",
        avatar:
          "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80"
      }
    ],
    faqs: [
      {
        question: "Should I bring a laptop?",
        answer: "Yes. You will get time for guided exploration and portfolio refinement."
      }
    ]
  },
  {
    id: "velocity-founder-mixer",
    title: "Velocity Founder Mixer",
    category: "startup",
    categoryLabel: "Startup Growth",
    city: "Delhi",
    location: "Orbit Rooftop Lounge",
    venue: "Orbit Rooftop Lounge",
    organizer: "Velocity Works",
    date: "2026-05-03T18:30:00",
    time: "06:30 PM - 10:30 PM",
    seatsLeft: 64,
    capacity: 260,
    priceFrom: 1499,
    mode: "In Person",
    featured: false,
    heroTag: "Networking Night",
    poster:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "A founder-first gathering for candid conversations on GTM, fundraising, and partnerships.",
    description:
      "Meet operators, angel investors, product leaders, and sharp startup talent in a high-intent evening format.",
    about:
      "Not every event needs a stage. Velocity Founder Mixer keeps energy high and friction low with curated introductions, lightning circles, and a relaxed skyline setting.",
    tags: ["Founders", "Networking", "Growth", "Capital"],
    ticketTiers: [
      {
        id: "velocity-entry",
        title: "Mixer Pass",
        price: 1499,
        perks: ["Entry", "Curated intros", "Welcome beverages"]
      }
    ],
    timeline: [
      { time: "18:30", title: "Golden hour networking", detail: "Founder intros and warm networking." },
      { time: "20:00", title: "Lightning insight circle", detail: "Six operators, six tactical lessons." }
    ],
    speakers: [],
    faqs: [
      {
        question: "Will investors be attending?",
        answer: "Yes. A smaller set of active angels and operators will join the curated networking session."
      }
    ]
  },
  {
    id: "quantum-commerce-forum",
    title: "Quantum Commerce Forum",
    category: "technology",
    categoryLabel: "Commerce & Data",
    city: "Hyderabad",
    location: "Nova Civic Hall",
    venue: "Nova Civic Hall",
    organizer: "Pulse Commerce Guild",
    date: "2026-06-12T10:00:00",
    time: "10:00 AM - 05:00 PM",
    seatsLeft: 82,
    capacity: 400,
    priceFrom: 2199,
    mode: "Hybrid",
    featured: false,
    heroTag: "Industry Forum",
    poster:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "An industry forum on modern commerce systems, loyalty engines, and intelligent fulfillment.",
    description:
      "Explore what high-performing commerce teams are doing with pricing intelligence, data products, and AI-assisted operations.",
    about:
      "Quantum Commerce Forum blends operator playbooks, real dashboards, and platform lessons across checkout, retention, and supply chain intelligence.",
    tags: ["Commerce", "Data", "Operations", "AI"],
    ticketTiers: [
      {
        id: "quantum-standard",
        title: "Forum Pass",
        price: 2199,
        perks: ["All sessions", "Networking lounge", "Replay access"]
      }
    ],
    timeline: [
      { time: "10:00", title: "Opening pulse briefing", detail: "Macro trends and commerce shifts." },
      { time: "11:30", title: "Retention architecture", detail: "Designing systems that compound revenue." }
    ],
    speakers: [],
    faqs: []
  },
  {
    id: "signal-ai-retreat",
    title: "Signal AI Builders Retreat",
    category: "technology",
    categoryLabel: "Builders Retreat",
    city: "Goa",
    location: "Tidal Bay Residency",
    venue: "Tidal Bay Residency",
    organizer: "Signal Network",
    date: "2026-07-04T08:00:00",
    time: "08:00 AM - 09:00 PM",
    seatsLeft: 19,
    capacity: 120,
    priceFrom: 12999,
    mode: "In Person",
    featured: true,
    heroTag: "Retreat Experience",
    poster:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "A premium retreat for technical founders and senior builders to think, prototype, and connect.",
    description:
      "Part residency, part summit, part collaborative lab. Designed for fewer people and deeper signal.",
    about:
      "Signal AI Builders Retreat compresses strategy, product thinking, and meaningful community into a one-day oceanfront format with private sessions and structured quiet time.",
    tags: ["Retreat", "AI", "Strategy", "Prototype"],
    ticketTiers: [
      {
        id: "signal-retreat",
        title: "Retreat Pass",
        price: 12999,
        perks: ["Oceanfront sessions", "Chef-led dining", "Retreat materials"]
      }
    ],
    timeline: [
      { time: "08:00", title: "Sunrise ideation deck", detail: "Guided strategy session by the coast." },
      { time: "12:00", title: "Prototype sprints", detail: "Rapid concept build and review." },
      { time: "19:00", title: "Fireside dinner", detail: "Curated conversations and reflection." }
    ],
    speakers: [],
    faqs: []
  },
  {
    id: "skyline-stage-festival",
    title: "Skyline Stage Festival",
    category: "music",
    categoryLabel: "Culture & Live Shows",
    city: "Pune",
    location: "Helix Grounds",
    venue: "Helix Grounds",
    organizer: "Echo House",
    date: "2026-05-30T16:00:00",
    time: "04:00 PM - 11:00 PM",
    seatsLeft: 110,
    capacity: 1200,
    priceFrom: 999,
    mode: "In Person",
    featured: false,
    heroTag: "Live Festival",
    poster:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "A high-energy culture festival featuring live acts, spotlight performances, and creator installations.",
    description:
      "For people who want the atmosphere of a premium concert with the organization of a best-in-class product.",
    about:
      "Skyline Stage Festival combines live music, creator booths, and visual installations into a polished night event with premium hospitality zones and clean stage flow.",
    tags: ["Festival", "Music", "Culture", "Nightlife"],
    ticketTiers: [
      {
        id: "skyline-regular",
        title: "General Entry",
        price: 999,
        perks: ["Festival entry", "Creator market access"]
      },
      {
        id: "skyline-lounge",
        title: "Lounge Access",
        price: 2499,
        perks: ["Premium viewing deck", "Fast-track entry", "Lounge service"]
      }
    ],
    timeline: [
      { time: "16:00", title: "Gates open", detail: "Installations, market, and warm-up sets." },
      { time: "19:30", title: "Headline performance", detail: "Main stage live set under the skyline." }
    ],
    speakers: [],
    faqs: []
  }
];

export const userDashboard = {
  profile: {
    name: "Arjun Kapoor",
    role: "Product Builder",
    plan: "Premium Attendee",
    memberSince: "2024",
    city: "Bangalore"
  },
  notifications: [
    { id: 1, title: "Ticket released", detail: "Your QR pass for Neo Summit 2026 is ready.", tone: "info" },
    { id: 2, title: "Schedule update", detail: "Aurora Design Lab added a live teardown session.", tone: "success" },
    { id: 3, title: "Seats filling fast", detail: "Only 19 spots left for Signal AI Builders Retreat.", tone: "warning" }
  ],
  activity: [
    { id: 1, title: "Registered for Neo Summit 2026", timestamp: "2 hours ago" },
    { id: 2, title: "Saved Aurora Design Lab to wishlist", timestamp: "Yesterday" },
    { id: 3, title: "Downloaded Skyline Stage Festival pass", timestamp: "3 days ago" }
  ]
};

export const organizerDashboard = {
  overview: [
    { id: "rev", label: "Revenue", value: 1284000, prefix: "INR " },
    { id: "att", label: "Attendance", value: 4712, suffix: "" },
    { id: "fill", label: "Fill Rate", value: 92, suffix: "%" },
    { id: "growth", label: "MoM Growth", value: 18, suffix: "%" }
  ],
  chartSeries: [62, 78, 84, 71, 96, 114, 128],
  recentActivities: [
    "Neo Summit 2026 crossed 90% capacity",
    "Aurora Design Lab waitlist opened",
    "New partnership request received from Frame & Flow"
  ]
};
