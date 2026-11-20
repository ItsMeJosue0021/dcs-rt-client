import { useEffect, useRef, useState } from "react";

export function AccountMenu({ currentUser, onOpenAdmin, onBack, onChangePassword, onSignOut, adminPage = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const runAction = (action) => {
    setIsOpen(false);
    action?.();
  };
  const displayName = currentUser?.name?.trim() || "admin";

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <span>{displayName}</span>
        <span className="text-xs font-normal text-slate-500">{currentUser.role}</span>
        <span aria-hidden="true" className="text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div role="menu" aria-label="Account actions" className="absolute right-0 z-40 mt-2 min-w-52 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {adminPage ? (
            <button type="button" role="menuitem" onClick={() => runAction(onBack)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Back to repository</button>
          ) : currentUser.role === "admin" && (
            <button type="button" role="menuitem" onClick={() => runAction(onOpenAdmin)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Users &amp; audit log</button>
          )}
          <button type="button" role="menuitem" onClick={() => runAction(onChangePassword)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Change password</button>
          <button type="button" role="menuitem" onClick={() => runAction(onSignOut)} className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50">Sign out</button>
        </div>
      )}
    </div>
  );
}
