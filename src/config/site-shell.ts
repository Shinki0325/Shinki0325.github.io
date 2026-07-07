import homePageConfigSource from "./pages/home.json";

export const siteShell = {
  brand: homePageConfigSource.brand,
  hero: homePageConfigSource.hero,
  profile: homePageConfigSource.profile,
  social: homePageConfigSource.social,
  search: homePageConfigSource.search,
  announcements: homePageConfigSource.announcements,
  navItems: [
    { href: "/", label: "首页" },
    { href: "/articles/", label: "文稿" },
    { href: "/references/", label: "资料库" },
    { href: "/notes/", label: "笔记" },
    { href: "/topics/", label: "专题" },
    { href: "/about/", label: "关于" },
  ],
  backgroundImages: homePageConfigSource.backgroundImages,
  music: homePageConfigSource.music,
} as const;

export type SiteShell = typeof siteShell;
