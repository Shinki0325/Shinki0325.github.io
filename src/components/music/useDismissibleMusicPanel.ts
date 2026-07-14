import { useEffect } from "react";
import type { RefObject } from "react";

export function useDismissibleMusicPanel(options: {
  open: boolean;
  panelRef: RefObject<HTMLElement>;
  triggerRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
}) {
  const { onClose, open, panelRef, triggerRef } = options;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open, panelRef, triggerRef]);
}
