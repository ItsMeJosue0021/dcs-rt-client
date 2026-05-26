// src/components/ui/Select.jsx
export function Select({ options, className = "", ...props }) {
  return (
    <select 
      className={`w-full border border-slate-300 p-2 rounded focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${className}`} 
      {...props}
    >
      {options.map((opt) => (
        <option 
          key={opt.value} 
          value={opt.value}
          disabled={opt.disabled}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
