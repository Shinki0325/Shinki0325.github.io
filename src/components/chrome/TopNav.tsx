import React, { useEffect, useRef, useState } from "react";
import { siteShell } from "../../config/site-shell";
import MobileRadialMenu from "./MobileRadialMenu";

const matchesPath = (currentPath: string, href: string) =>
  currentPath === href || currentPath === href.replace(/\/$/, "");

export default function TopNav({ currentPath }: { currentPath: string }) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const nextY = window.scrollY;
      setHidden(nextY > lastY.current && nextY > 80);
      lastY.current = nextY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`top-nav-shell${hidden ? " is-hidden" : ""}`} data-top-nav>
        <div className="top-nav-inner">
          <a className="top-nav-brand" href="/">
            <span>{siteShell.brand.title}</span>
            <span className="brand-separator">{siteShell.brand.suffix}</span>
            <span>{siteShell.brand.after}</span>
          </a>

          <nav aria-label="主导航" className="top-nav-links">
            {siteShell.navItems.map((item) => {
              const active = matchesPath(currentPath, item.href);
              return (
                <a
                  className={active ? "is-active" : undefined}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <button
            aria-label="打开导航"
            className="top-nav-mobile-trigger"
            data-mobile-nav-trigger
            onClick={() => setOpen(true)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <MobileRadialMenu
        currentPath={currentPath}
        items={siteShell.navItems}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
}
