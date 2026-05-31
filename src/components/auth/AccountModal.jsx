export function AccountModal({ isOpen, user, onClose, onLogout }) {
  if (!isOpen) return null;

  const initial = (user?.name || user?.email || "A").trim().charAt(0).toUpperCase();

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Close account menu"
      />
      <div
        className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-emerald-100 bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.name || "Admin"}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {user?.email || "Administrator"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded px-2 text-2xl font-bold leading-none text-slate-500 transition hover:text-emerald-700"
            aria-label="Close account menu"
          >
            &times;
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full cursor-pointer rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Log out
        </button>
      </div>
    </>
  );
}
