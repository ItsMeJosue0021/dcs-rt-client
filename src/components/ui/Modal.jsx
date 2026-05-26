// src/components/ui/Modal.jsx
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  headerActions = null,
  panelClassName = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-xl border border-emerald-100 shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 ${panelClassName}`}>
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3 mb-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <button onClick={onClose} className="cursor-pointer text-slate-500 text-2xl font-bold hover:text-emerald-700 transition leading-none">
              &times;
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
