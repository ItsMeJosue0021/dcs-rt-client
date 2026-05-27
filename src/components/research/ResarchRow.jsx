export function ResearchRow({
  item,
  onEdit,
  onDelete,
  onViewAbstract,
  onViewManuscript,
}) {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Finished": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Part B": return "bg-teal-100 text-teal-800 border-teal-200";
      case "Part A": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <tr className="hover:bg-emerald-50/40 transition">
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">{item.title}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider border ${
            item.type === "Thesis" 
              ? "bg-purple-50 text-purple-700 border-purple-200" 
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {item.type || "Capstone"}
          </span>
        </div>
        <div className="text-xs text-emerald-700 font-medium mt-0.5">{item.authors}</div>
      </td>

      <td className="px-4 py-3">
        <button
          onClick={() => onViewAbstract(item.abstract)}
          className="cursor-pointer text-xs text-slate-600 hover:text-emerald-700 text-left block max-w-xs group"
        >
          <span className="line-clamp-2 group-hover:underline">
            {item.abstract}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">Click to view full abstract</span>
        </button>
      </td>

      <td className="px-4 py-3 text-xs space-y-1 text-slate-700">
        <div><b>Adviser:</b> {item.adviser}</div>
        <div><b>Critic:</b> {item.critic}</div>
      </td>

      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusBadgeColor(item.status)}`}>
          {item.status}
        </span>
      </td>

      <td className="px-4 py-3 space-y-1">
        {item.pdf_url && (
          <button
            type="button"
            onClick={() => onViewManuscript(item)}
            className="block cursor-pointer text-left text-xs text-emerald-700 hover:underline"
          >
            Manuscript
          </button>
        )}
        {item.website_url && (
          <a href={item.website_url} target="_blank" rel="noreferrer" className="block cursor-pointer text-xs text-emerald-700 hover:underline">
            Website
          </a>
        )}
      </td>

      <td className="px-4 py-3 text-xs">
        <div className="flex gap-1.5">
          {onEdit && (
            <button onClick={() => onEdit(item)} className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded transition">
              Edit
            </button>
          )}
          <button onClick={() => onDelete(item.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded transition">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}