import { useState } from "react";

export function PasswordInput({ className = "", ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const accessibleName = props["aria-label"];

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        autoCapitalize="none"
        spellCheck={false}
        className={`w-full ${className}`.trim()}
      />
      <button
        type="button"
        aria-label={`${isVisible ? "Hide" : "Show"} password${accessibleName ? `: ${accessibleName}` : ""}`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-slate-600 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
