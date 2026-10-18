import type { CountryFormData } from "@/types/country";

export const starterCountries: CountryFormData[] = [
  {
    slug: "in",
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    flagImage: "",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Gurugram web studio helping Indian startups and growing businesses launch professional, high-converting websites.",
    status: "published",
    isDefault: true,
    showOnHomepage: true,
    sortOrder: 1,
    destinationUrl: "/",
    hero: {
      eyebrow: "Gurugram web studio",
      title: "Launch your business online,",
      titleHighlight: "affordably.",
      description:
        "We help new businesses and startups in India grow with professional, attractive, and budget-friendly websites.",
      primaryCtaLabel: "Book strategy call",
      primaryCtaLink: "/contact",
      secondaryCtaLabel: "View selected work",
      secondaryCtaLink: "#work",
      highlights: [
        { label: "Typical launch", value: "1–2 weeks" },
        { label: "Built for", value: "Startups" },
        { label: "Based in", value: "Gurugram" },
      ],
    },
    currency: {
      code: "INR",
      symbol: "₹",
      name: "Indian Rupee",
    },
    pricing: {
      budgetOptions: [
        "Under ₹25,000",
        "₹25,000 – ₹75,000",
        "₹75,000 – ₹1,50,000",
        "₹1,50,000+",
      ],
      samplePricingNote: "Transparent pricing tailored for Indian founders and startups.",
    },
    contactInfo: {
      phoneDisplay: "+91 95821 94338",
      phoneHref: "tel:+919582194338",
      email: "info@vivexatech.in",
      emailHref: "mailto:info@vivexatech.in",
      officeAddress: [
        "Plot No. 13, Basement, Near Ekta Group",
        "Ashok Vihar Extension III",
        "Gurugram – 122006",
        "Haryana, India",
      ],
      mapsUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      mapsLabel: "Gurugram Studio Directions",
      serviceNote: "Headquarters & in-person consultations available by appointment.",
    },
    googleReviews: {
      enabled: true,
      profileName: "Vivexa Tech",
      placeId: "ChIJW1qW_gUVDTkR65l9jJ36aZQ",
      rating: 5.0,
      reviewCount: 38,
      reviewDestinationUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      displayLabel: "5.0 ★ on Google Reviews (Gurugram HQ)",
      note: "Genuine client reviews from verified businesses on Google Maps.",
      isCompanyFallback: false,
    },
    seo: {
      metaTitle: "Vivexa Tech — Affordable Websites for Startups in India",
      metaDescription:
        "Gurugram web studio helping Indian startups and SMEs launch professional, fast, and SEO-optimized websites.",
      ogImage: "",
      keywords: ["web design India", "Gurugram web agency", "startup websites India", "affordable web development"],
    },
    pages: {
      about: {
        eyebrow: "About Vivexa Tech",
        title: "Web design and development built for Indian startups.",
        description:
          "Vivexa Tech is a Gurugram web studio helping new businesses and startups launch professional, budget-friendly websites.",
      },
      contact: {
        eyebrow: "Contact our Gurugram studio",
        title: "Let's build a website that delivers results.",
        description:
          "Tell us about your business, timeline, and goals. We reply within one business day with transparent pricing.",
      },
      services: {
        eyebrow: "Studio services",
        title: "Everything your startup needs to launch online.",
        description:
          "From custom Next.js websites to UI/UX design, e-commerce, and SEO optimization — delivered on budget.",
      },
      faq: {
        eyebrow: "Frequently Asked Questions",
        title: "Clear answers on how we work.",
        description:
          "Everything you need to know about pricing, timelines, our process, and after-launch support in India.",
      },
    },
  },
  {
    slug: "uk",
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    flagImage: "",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Modern web design and digital engineering for ambitious UK startups, agencies, and B2B tech businesses.",
    status: "published",
    isDefault: false,
    showOnHomepage: true,
    sortOrder: 2,
    destinationUrl: "/uk",
    hero: {
      eyebrow: "UK Web Development & Design Partner",
      title: "High-impact web design for UK businesses,",
      titleHighlight: "delivered fast.",
      description:
        "We build clean, high-converting websites for British startups and SMEs with transparent GBP pricing and London business hours overlap.",
      primaryCtaLabel: "Book strategy call",
      primaryCtaLink: "/contact",
      secondaryCtaLabel: "Explore UK work",
      secondaryCtaLink: "#work",
      highlights: [
        { label: "Typical launch", value: "1–2 weeks" },
        { label: "Built for", value: "UK Startups" },
        { label: "Timezone", value: "GMT/BST overlap" },
      ],
    },
    currency: {
      code: "GBP",
      symbol: "£",
      name: "British Pound",
    },
    pricing: {
      budgetOptions: [
        "Under £1,000",
        "£1,000 – £3,000",
        "£3,000 – £6,000",
        "£6,000+",
      ],
      samplePricingNote: "Fixed GBP quotes with milestone delivery. No hidden agency retainers.",
    },
    contactInfo: {
      phoneDisplay: "+91 95821 94338",
      phoneHref: "tel:+919582194338",
      email: "info@vivexatech.in",
      emailHref: "mailto:info@vivexatech.in",
      officeAddress: [
        "Vivexa Tech International Client Desk",
        "London & UK Business Hours Alignment (GMT/BST)",
        "Global Delivery Studio",
      ],
      mapsUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      mapsLabel: "Vivexa Tech Global Profile",
      serviceNote: "Serving UK clients remotely with dedicated Slack channel and Zoom/Google Meet collaboration.",
    },
    googleReviews: {
      enabled: true,
      profileName: "Vivexa Tech — Global Services",
      placeId: "",
      rating: 5.0,
      reviewCount: 38,
      reviewDestinationUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      displayLabel: "5.0 ★ Rated by Verified Clients on Google",
      note: "Ratings sourced from Vivexa Tech's verified Google Business profile.",
      isCompanyFallback: true,
    },
    seo: {
      metaTitle: "Vivexa Tech UK — High-Converting Web Design for UK Startups",
      metaDescription:
        "Partner with Vivexa Tech for affordable, fast, and high-impact web design tailored for UK businesses and startups.",
      ogImage: "",
      keywords: ["web design UK", "UK startup website", "affordable web design London", "Next.js agency UK"],
    },
    pages: {
      about: {
        eyebrow: "About Vivexa Tech UK",
        title: "Reliable web studio partner for British businesses & startups.",
        description:
          "We help UK businesses, founders, and agencies ship high-converting Next.js websites with transparent GBP pricing and GMT/BST alignment.",
      },
      contact: {
        eyebrow: "UK Client Desk",
        title: "Start your project with our UK-dedicated desk.",
        description:
          "Get in touch for a fixed GBP quote, rapid turnaround, and clear collaboration aligned with UK working hours.",
      },
      services: {
        eyebrow: "Services for UK Clients",
        title: "Fast, modern web engineering tailored for the UK market.",
        description:
          "Next.js web development, custom UI/UX, B2B landing pages, and technical SEO designed for UK growth.",
      },
      faq: {
        eyebrow: "UK Client FAQ",
        title: "How we collaborate with UK businesses.",
        description:
          "Answers about GBP billing, timezone overlap, contracts, delivery timelines, and ongoing maintenance.",
      },
    },
  },
  {
    slug: "us",
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    flagImage: "",
    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "World-class web design and engineering for US startups, founders, and scaling businesses at competitive rates.",
    status: "published",
    isDefault: false,
    showOnHomepage: true,
    sortOrder: 3,
    destinationUrl: "/us",
    hero: {
      eyebrow: "US Web Design & Next.js Studio",
      title: "Scale your American startup online,",
      titleHighlight: "without agency overhead.",
      description:
        "High-performance landing pages, custom web apps, and SEO-first builds for US founders with East and West Coast timezone alignment.",
      primaryCtaLabel: "Schedule a call",
      primaryCtaLink: "/contact",
      secondaryCtaLabel: "View portfolio",
      secondaryCtaLink: "#work",
      highlights: [
        { label: "Turnaround", value: "7–14 days" },
        { label: "Stack", value: "Next.js / React" },
        { label: "Pricing", value: "Transparent USD" },
      ],
    },
    currency: {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
    },
    pricing: {
      budgetOptions: [
        "Under $1,500",
        "$1,500 – $4,000",
        "$4,000 – $8,000",
        "$8,000+",
      ],
      samplePricingNote: "Competitive USD rates designed for self-funded and venture-backed founders.",
    },
    contactInfo: {
      phoneDisplay: "+91 95821 94338",
      phoneHref: "tel:+919582194338",
      email: "info@vivexatech.in",
      emailHref: "mailto:info@vivexatech.in",
      officeAddress: [
        "Vivexa Tech US Client Division",
        "EST / CST / PST Timezone Coordination",
        "Global Engineering Studio",
      ],
      mapsUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      mapsLabel: "Vivexa Tech Google Profile",
      serviceNote: "Direct async Slack collaboration and weekly video check-ins for US founders.",
    },
    googleReviews: {
      enabled: true,
      profileName: "Vivexa Tech — Global Services",
      placeId: "",
      rating: 5.0,
      reviewCount: 38,
      reviewDestinationUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      displayLabel: "5.0 ★ Rated by Verified Clients on Google",
      note: "Authentic Google Reviews from worldwide tech founders and partners.",
      isCompanyFallback: true,
    },
    seo: {
      metaTitle: "Vivexa Tech USA — Fast & Affordable Web Design for US Startups",
      metaDescription:
        "Premium Next.js web development and conversion-focused web design for US businesses and startups without Silicon Valley agency markups.",
      ogImage: "",
      keywords: ["web development USA", "US startup web design", "Next.js web agency US", "B2B tech website"],
    },
    pages: {
      about: {
        eyebrow: "About Vivexa Tech US",
        title: "Engineering high-growth web experiences for US founders.",
        description:
          "We help American founders and startups launch fast, SEO-driven websites with zero agency overhead and timezone alignment.",
      },
      contact: {
        eyebrow: "US Client Desk",
        title: "Schedule a strategy call for your US startup.",
        description:
          "Direct async Slack collaboration, transparent USD milestone pricing, and 7–14 day launch timelines.",
      },
      services: {
        eyebrow: "Services for US Startups",
        title: "Modern Next.js web development & conversion design.",
        description:
          "High-performance marketing websites, SaaS landing pages, and custom web applications for US businesses.",
      },
      faq: {
        eyebrow: "US Client FAQ",
        title: "Common questions from US founders.",
        description:
          "Insights on USD payments, async sprints, intellectual property, and speed of delivery.",
      },
    },
  },
  {
    slug: "ca",
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    flagImage: "",
    image: "https://images.unsplash.com/photo-1517935703635-2717090c2210?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Tailored web design and branding for Canadian startups, small businesses, and tech companies across Toronto, Vancouver, and beyond.",
    status: "published",
    isDefault: false,
    showOnHomepage: true,
    sortOrder: 4,
    destinationUrl: "/ca",
    hero: {
      eyebrow: "Canadian Startup Web Partner",
      title: "Launch your Canadian business with a site that",
      titleHighlight: "converts.",
      description:
        "Clean typography, mobile-first performance, and rapid delivery for Canadian entrepreneurs in Toronto, Vancouver, Montreal, and Calgary.",
      primaryCtaLabel: "Book strategy call",
      primaryCtaLink: "/contact",
      secondaryCtaLabel: "See our work",
      secondaryCtaLink: "#work",
      highlights: [
        { label: "Launch in", value: "1–2 weeks" },
        { label: "Built for", value: "Canadian SMEs" },
        { label: "Currency", value: "CAD (C$)" },
      ],
    },
    currency: {
      code: "CAD",
      symbol: "C$",
      name: "Canadian Dollar",
    },
    pricing: {
      budgetOptions: [
        "Under C$2,000",
        "C$2,000 – C$5,000",
        "C$5,000 – C$10,000",
        "C$10,000+",
      ],
      samplePricingNote: "Direct CAD invoicing with clear deliverables and fast iterations.",
    },
    contactInfo: {
      phoneDisplay: "+91 95821 94338",
      phoneHref: "tel:+919582194338",
      email: "info@vivexatech.in",
      emailHref: "mailto:info@vivexatech.in",
      officeAddress: [
        "Vivexa Tech Canada Client Support",
        "Eastern & Pacific Hours Coverage",
        "Global Delivery Studio",
      ],
      mapsUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      mapsLabel: "Vivexa Tech Global Profile",
      serviceNote: "Dedicated remote support for Canadian businesses with bilingual-ready site architectures.",
    },
    googleReviews: {
      enabled: true,
      profileName: "Vivexa Tech — Global Services",
      placeId: "",
      rating: 5.0,
      reviewCount: 38,
      reviewDestinationUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      displayLabel: "5.0 ★ Rated by Verified Clients on Google",
      note: "Verified Google reviews reflecting genuine client satisfaction.",
      isCompanyFallback: true,
    },
    seo: {
      metaTitle: "Vivexa Tech Canada — Modern Web Design for Canadian Startups",
      metaDescription:
        "Fast, reliable web development for Canadian businesses. Professional Next.js websites built to convert.",
      ogImage: "",
      keywords: ["web design Canada", "Toronto web development", "Vancouver website design", "Canadian startup agency"],
    },
    pages: {
      about: {
        eyebrow: "About Vivexa Tech Canada",
        title: "Web design & digital engineering for Canadian innovators.",
        description:
          "Supporting Canadian startups, SMEs, and tech businesses across Toronto, Vancouver, and Montreal with high-performing websites.",
      },
      contact: {
        eyebrow: "Canadian Client Desk",
        title: "Connect with our Canadian client team.",
        description:
          "Get a clear CAD estimate and project timeline tailored to your Canadian business requirements.",
      },
      services: {
        eyebrow: "Services for Canada",
        title: "Responsive, accessible, and fast websites for Canadian businesses.",
        description:
          "Bilingual-ready Next.js architectures, modern UI/UX design, and SEO engineered for Canadian search discovery.",
      },
      faq: {
        eyebrow: "Canadian Client FAQ",
        title: "Frequently asked questions for Canadian clients.",
        description:
          "Details on CAD billing, Eastern/Pacific time coverage, and our agile delivery model.",
      },
    },
  },
  {
    slug: "au",
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    flagImage: "",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Reliable web design partner for Australian entrepreneurs, tradies, startups, and expanding businesses in Sydney, Melbourne, and Brisbane.",
    status: "published",
    isDefault: false,
    showOnHomepage: true,
    sortOrder: 5,
    destinationUrl: "/au",
    hero: {
      eyebrow: "Australian Web Studio Partner",
      title: "Build a standout web presence for your Aussie business,",
      titleHighlight: "on budget.",
      description:
        "Modern websites built for Australian businesses with AEST/AEDT timezone overlap, clean code, and transparent AUD pricing.",
      primaryCtaLabel: "Book a strategy call",
      primaryCtaLink: "/contact",
      secondaryCtaLabel: "Explore projects",
      secondaryCtaLink: "#work",
      highlights: [
        { label: "Turnaround", value: "1–2 weeks" },
        { label: "Timezone", value: "AEST overlap" },
        { label: "Currency", value: "AUD (A$)" },
      ],
    },
    currency: {
      code: "AUD",
      symbol: "A$",
      name: "Australian Dollar",
    },
    pricing: {
      budgetOptions: [
        "Under A$2,000",
        "A$2,000 – A$5,000",
        "A$5,000 – A$10,000",
        "A$10,000+",
      ],
      samplePricingNote: "Clear AUD proposals with fixed scope and direct collaboration.",
    },
    contactInfo: {
      phoneDisplay: "+91 95821 94338",
      phoneHref: "tel:+919582194338",
      email: "info@vivexatech.in",
      emailHref: "mailto:info@vivexatech.in",
      officeAddress: [
        "Vivexa Tech Australia Desk",
        "AEST / AWST Overlap Support",
        "Global Engineering Studio",
      ],
      mapsUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      mapsLabel: "Vivexa Tech Global Profile",
      serviceNote: "Serving clients in Sydney, Melbourne, Brisbane, and Perth with daily progress updates.",
    },
    googleReviews: {
      enabled: true,
      profileName: "Vivexa Tech — Global Services",
      placeId: "",
      rating: 5.0,
      reviewCount: 38,
      reviewDestinationUrl: "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      displayLabel: "5.0 ★ Rated by Verified Clients on Google",
      note: "Authentic Google Reviews from verified international business clients.",
      isCompanyFallback: true,
    },
    seo: {
      metaTitle: "Vivexa Tech Australia — Web Design & Development for Aussie Startups",
      metaDescription:
        "Affordable, high-performing websites for Australian startups and businesses. Built with Next.js, SEO-optimized, and conversion-ready.",
      ogImage: "",
      keywords: ["web design Australia", "Sydney web development", "Melbourne startup websites", "affordable web design AU"],
    },
    pages: {
      about: {
        eyebrow: "About Vivexa Tech Australia",
        title: "Dedicated digital web partner for Aussie businesses.",
        description:
          "Delivering modern, conversion-focused websites for Australian startups, tradies, and SMEs with AEST/AEDT timezone alignment.",
      },
      contact: {
        eyebrow: "Australia Client Desk",
        title: "Start a conversation with our Australia desk.",
        description:
          "Request a transparent AUD proposal and discover how we can build or revamp your web presence quickly.",
      },
      services: {
        eyebrow: "Services for Australia",
        title: "High-impact web design & development for Australian brands.",
        description:
          "Fast-loading Next.js sites, clean UI/UX, mobile optimization, and search rankings in the Australian market.",
      },
      faq: {
        eyebrow: "Australia Client FAQ",
        title: "Everything Aussie businesses need to know.",
        description:
          "Answers regarding AUD invoicing, AEST business hours overlap, and website maintenance plans.",
      },
    },
  },
];
