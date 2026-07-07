import React from "react";

type NavItem = {
  href: string;
  label: string;
};

const matchesPath = (currentPath: string, href: string) =>
  currentPath === href || currentPath === href.replace(/\/$/, "");

export default function MobileRadialMenu({
  items,
  open,
  currentPath,
  onClose,
}: {
  items: NavItem[];
  open: boolean;
  currentPath: string;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="mobile-radial-overlay" data-mobile-radial-menu>
      <button
        aria-label="关闭菜单"
        className="mobile-radial-backdrop"
        onClick={onClose}
        type="button"
      />

      <div className="mobile-radial-shell">
        <button
          aria-label="关闭导航"
          className="mobile-radial-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        {items.map((item, index) => {
          const angle = (index / items.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 116;
          const y = Math.sin(angle) * 116;
          const active = matchesPath(currentPath, item.href);

          return (
            <a
              className={`mobile-radial-link${active ? " is-active" : ""}`}
              href={item.href}
              key={item.href}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
