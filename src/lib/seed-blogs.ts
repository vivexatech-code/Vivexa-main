import type { BlogFormData } from "@/types/blog";

export const starterBlogs: BlogFormData[] = [
  {
    title: "How we launch a startup website in one to two weeks",
    slug: "launch-a-startup-website-in-two-weeks",
    excerpt:
      "A realistic timeline for a landing page or portfolio site — from brief to a live, searchable page.",
    featuredImage: "",
    featuredImageAlt: "",
    category: "Process",
    tags: ["Launch", "Process"],
    author: "Vivexa Tech",
    content: `<h2>A realistic launch window</h2><p>Most of the sites we ship for new businesses are not platforms. They are a clear story, a trustworthy visual system, and a path to contact. That is why a standard landing page or portfolio can move from design to launch in about one to two weeks.</p><p>The work is sequenced on purpose: positioning and sitemap first, then visual direction, then a build that is already structured for SEO. Extra time only appears when custom functionality, deeper security, or a larger content set is required.</p><p>If you are still shaping the offer, we would rather tighten the story before we decorate the page. A fast launch is only useful if the page is saying the right thing.</p>`,
    status: "published",
    publishedAt: "2026-08-01",
    seoTitle: "How we launch a startup website in one to two weeks",
    seoDescription:
      "A realistic timeline for a landing page or portfolio site — from brief to a live, searchable page.",
    focusKeyword: "startup website launch",
    canonicalUrl: "/blog/launch-a-startup-website-in-two-weeks",
  },
  {
    title: "SEO should start in the first build, not the third redesign",
    slug: "seo-from-the-first-build",
    excerpt:
      "Why metadata, structure, and speed belong in development — especially when paid traffic is not the plan.",
    featuredImage: "",
    featuredImageAlt: "",
    category: "SEO",
    tags: ["SEO"],
    author: "Vivexa Tech",
    content: `<h2>Search belongs in the first build</h2><p>Startups often treat SEO as a later project. By then the site is slow, the headings are vague, and Google is indexing a structure nobody planned.</p><p>We implement the fundamentals during development: keyword research, titles, descriptions, and crawler-friendly markup. Speed is part of that work — a beautiful page that takes too long to open will not rank, and will not convert.</p><p>You do not need a content factory on week one. You need a site that can be found, understood, and trusted when someone finally searches for what you do.</p>`,
    status: "published",
    publishedAt: "2026-07-01",
    seoTitle: "SEO should start in the first build, not the third redesign",
    seoDescription:
      "Why metadata, structure, and speed belong in development — especially when paid traffic is not the plan.",
    focusKeyword: "startup SEO",
    canonicalUrl: "/blog/seo-from-the-first-build",
  },
  {
    title: "What web security actually means for a new business site",
    slug: "what-web-security-means-for-a-new-site",
    excerpt:
      "A plain-language look at protecting assets, visitors, and the confidence your brand needs to earn.",
    featuredImage: "",
    featuredImageAlt: "",
    category: "Security",
    tags: ["Security"],
    author: "Vivexa Tech",
    content: `<h2>Security without theatre</h2><p>Security for a young company is not a SOC 2 binder. It is making sure the website you just launched does not leak trust the moment someone inspects it, copies it, or tries to misuse it.</p><p>We apply practical protections during the build: safer defaults, attention to assets, and patterns that reduce casual source inspection. Visitors should feel they are on a real business property.</p><p>If your product later needs a heavier security posture, the marketing site should already be a clean, professional foundation rather than another risk.</p>`,
    status: "published",
    publishedAt: "2026-06-01",
    seoTitle: "What web security actually means for a new business site",
    seoDescription:
      "A plain-language look at protecting assets, visitors, and the confidence your brand needs to earn.",
    focusKeyword: "website security",
    canonicalUrl: "/blog/what-web-security-means-for-a-new-site",
  },
];
