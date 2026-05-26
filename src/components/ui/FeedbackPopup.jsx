import { useEffect } from "react";

const styles = {
  success: {
    icon: "✓",
    iconClass: "bg-emerald-100 text-emerald-700",
    borderClass: "border-emerald-200",
  },
  error: {
    icon: "!",
    iconClass: "bg-red-100 text-red-700",
    borderClass: "border-red-200",
  },
};

export function FeedbackPopup({ feedback, onClose }) {
  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [feedback, onClose]);

  if (!feedback) return null;

  const variant = styles[feedback.type] || styles.success;

  return (
    <div className="fixed right-3 top-3 z-[60] w-[calc(100%-1.5rem)] max-w-sm sm:right-4 sm:top-4 sm:w-[calc(100%-2rem)]">
      <div
        className={`flex items-start gap-3 rounded-xl border ${variant.borderClass} bg-white p-4 shadow-lg`}
        role="status"
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${variant.iconClass}`}
        >
          {variant.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{feedback.title}</p>
          {feedback.message && (
            <p className="mt-1 text-sm text-slate-600">{feedback.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md px-2 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close feedback"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
