// src/components/ui/Modal.jsx
import { useEffect, useRef } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  headerActions = null,
  panelClassName = "",
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = panel?.querySelector(focusableSelector);
    (firstFocusable || panel)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = [...panel.querySelectorAll(focusableSelector)];
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
      } else if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 backdrop-blur-sm sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} className={`bg-white rounded-xl border border-emerald-100 shadow-xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto p-4 sm:max-h-[90vh] sm:p-6 ${panelClassName}`}>
        <div className="flex items-start justify-between gap-3 border-b border-emerald-100 pb-3 mb-4">
          <h2 id="modal-title" className="min-w-0 text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <button type="button" onClick={onClose} aria-label="Close dialog" className="cursor-pointer text-slate-500 text-2xl font-bold hover:text-emerald-700 transition leading-none">
              &times;
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
