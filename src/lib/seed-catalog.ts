import { slugify } from "@/lib/slug";
import type { ProjectFormData } from "@/types/project";
import type { ServiceFormData } from "@/types/service";

export const starterProjects: ProjectFormData[] = [
  {
    name: "Local Cafe Website",
    slug: "local-cafe",
    description:
      "A startup business website for a local cafe — built to help a new hospitality brand look established online.",
    location: "Gurugram",
    country: "India",
    growth: "Local reach",
    focus: "Hospitality",
    target: "New cafes",
    websiteUrl: "",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "",
    category: "Local Business",
    status: "published",
  },
  {
    name: "The Corner Store",
    slug: "the-corner-store",
    description:
      "A small e-commerce site for a local retailer, with product pages and a familiar shopping flow.",
    location: "Gurugram",
    country: "India",
    growth: "Online sales",
    focus: "Retail",
    target: "Local shoppers",
    websiteUrl: "",
    tags: ["WooCommerce", "WordPress", "E-commerce"],
    image: "",
    category: "E-commerce",
    status: "published",
  },
  {
    name: "KR Global School",
    slug: "kr-global-school",
    description:
      "A school website with a clear information architecture, gallery, and motion for a more inviting first impression.",
    location: "India",
    country: "India",
    growth: "Admissions",
    focus: "Education",
    target: "Parents",
    websiteUrl: "",
    tags: ["UI/UX", "Gallery", "Animations"],
    image: "",
    category: "Education",
    status: "published",
  },
  {
    name: "Apex Cricket",
    slug: "apex-cricket",
    description:
      "A cricket academy website designed to present programmes, facilities, and enquiry paths clearly.",
    location: "India",
    country: "India",
    growth: "Enquiries",
    focus: "Sports",
    target: "Athletes",
    websiteUrl: "",
    tags: ["UI/UX", "Gallery", "Animations"],
    image: "",
    category: "Sports",
    status: "published",
  },
  {
    name: "SynergyFit",
    slug: "synergyfit",
    description:
      "A gym website with CMS-managed content, on-page SEO, and a contact path for memberships.",
    location: "India",
    country: "India",
    growth: "Memberships",
    focus: "Fitness",
    target: "Gym-goers",
    websiteUrl: "",
    tags: ["CMS", "SEO", "Contact Form"],
    image: "",
    category: "Health & Fitness",
    status: "published",
  },
  {
    name: "Shiksha Jyoti School",
    slug: "shiksha-jyoti-school",
    description:
      "A school website focused on admissions information, animations, and search-friendly structure.",
    location: "India",
    country: "India",
    growth: "Admissions",
    focus: "Education",
    target: "Families",
    websiteUrl: "",
    tags: ["Animations", "SEO", "Contact Form"],
    image: "",
    category: "Education",
    status: "published",
  },
  {
    name: "Energy in Motion",
    slug: "energy-in-motion",
    description:
      "A dance-class website with contact capture, animation, and SEO for local discovery.",
    location: "India",
    country: "India",
    growth: "Class bookings",
    focus: "Performing arts",
    target: "Students",
    websiteUrl: "",
    tags: ["SEO", "Animations", "Contact Form"],
    image: "",
    category: "Local Business",
    status: "published",
  },
];

export const starterServices: ServiceFormData[] = [
  {
    name: "Website Development",
    slug: "web-dev",
    eyebrow: "Core service",
    shortDescription:
      "Fast, secure, and fully responsive websites tailored to your business, across every device.",
    detailedDescription:
      "Vivexa Tech was founded to make professional, high-quality websites affordable for new businesses.\n\nWe build responsive marketing sites and custom pages that look established from day one — clean structure, fast loads, and a path to enquiry that is easy to trust.",
    image: "",
    category: "Core Services",
    features: [
      "Responsive websites for startups and local businesses",
      "Clean, crawler-friendly code",
      "Typical landing pages launch in about 1–2 weeks",
    ],
    status: "published",
    sortOrder: 1,
  },
  {
    name: "Website Design",
    slug: "website-design",
    eyebrow: "Core service",
    shortDescription:
      "Visual systems that make a new business look as considered as the work behind it.",
    detailedDescription:
      "Design is how the market reads your ambition. We shape layout, type, color, and motion so your brand feels sharp without looking theatrical.\n\nEvery composition is built to convert: clear hierarchy, generous spacing, and calls to action that feel inevitable rather than loud.",
    image: "",
    category: "Design",
    features: [
      "Brand-aligned visual language",
      "Desktop and mobile compositions",
      "A design system your site can grow with",
    ],
    status: "published",
    sortOrder: 2,
  },
  {
    name: "UI/UX Design",
    slug: "ux-ui",
    eyebrow: "Product design",
    shortDescription:
      "Intuitive, visually appealing interfaces that help people understand and act.",
    detailedDescription:
      "We create interfaces that enhance user experience, boost engagement, and leave a lasting impression.\n\nWe map how someone arrives, understands, and acts — then design screens that reduce friction at every step, on every device.",
    image: "",
    category: "Design",
    features: [
      "User flows and clear page hierarchy",
      "High-fidelity UI",
      "Accessible interaction patterns",
    ],
    status: "published",
    sortOrder: 3,
  },
  {
    name: "Digital Marketing & SEO",
    slug: "seo",
    eyebrow: "Core service",
    shortDescription:
      "Search fundamentals baked into the build so new businesses can be found, not retrofitted later.",
    detailedDescription:
      "We optimize websites and implement SEO from the development phase — keyword research, titles, descriptions, speed, and a crawler-friendly structure.\n\nThe goal is durable organic reach for startups that cannot buy every click.",
    image: "",
    category: "Growth",
    features: [
      "On-page SEO and metadata",
      "Technical structure and speed",
      "Keyword-informed page copy",
    ],
    status: "published",
    sortOrder: 4,
  },
  {
    name: "Website Maintenance",
    slug: "website-maintenance",
    eyebrow: "Support",
    shortDescription:
      "Ongoing support, updates, and security monitoring so your site stays fast and reliable.",
    detailedDescription:
      "A launched website still needs care. We provide ongoing support, updates, and security monitoring to keep your website running smoothly, safely, and efficiently.\n\nThis is the practical follow-through after launch — not a separate agency you have to find later.",
    image: "",
    category: "Support",
    features: [
      "Updates and routine checks",
      "Security monitoring",
      "Help keeping content and forms working",
    ],
    status: "published",
    sortOrder: 5,
  },
  {
    name: "Web Security",
    slug: "security",
    eyebrow: "Core service",
    shortDescription:
      "Practical hardening so visitors can trust the site and owners have fewer obvious risks.",
    detailedDescription:
      "Web security is one of our priorities. We apply hardening practices during build and launch so pages are safer by default.\n\nThat includes protecting assets, reducing casual source inspection, and keeping the browsing experience clean for your users.",
    image: "",
    category: "Core Services",
    features: [
      "Secure defaults at launch",
      "Asset and source-code protections",
      "Safer visitor experience",
    ],
    status: "published",
    sortOrder: 6,
  },
  {
    name: "Branding",
    slug: "branding",
    eyebrow: "Growth",
    shortDescription:
      "Identity work that helps a new business feel coherent across the website, decks, and social.",
    detailedDescription:
      "We build identities that can live on a landing page today and a product tomorrow — distinctive without becoming theatrical.\n\nThe work includes positioning language, logo usage, color, type, and the small rules that keep a young brand from looking improvised.",
    image: "",
    category: "Design",
    features: [
      "Logo and identity direction",
      "Color, type, and usage guidance",
      "Website-ready brand application",
    ],
    status: "published",
    sortOrder: 7,
  },
  {
    name: "Landing Pages",
    slug: "landing-page",
    eyebrow: "Growth",
    shortDescription:
      "Single-page sites that explain the offer clearly, then make the next step easy.",
    detailedDescription:
      "A landing page should do one job with elegance: make the offer obvious and the next step easy.\n\nWe write and design around that job, then build a fast page you can typically launch in about one to two weeks.",
    image: "",
    category: "Growth",
    features: [
      "Campaign and launch pages",
      "Clear offer hierarchy",
      "Fast, mobile-first builds",
    ],
    status: "published",
    sortOrder: 8,
  },
];

export function ensureSlug<T extends { name: string; slug: string }>(item: T): T {
  return { ...item, slug: slugify(item.slug || item.name) };
}
