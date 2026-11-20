import { useState } from "react";
import { API_URL } from "../../config/constants";
import { ResearchRow } from "./ResarchRow"; // Fixed typo 'ResarchRow'
import { SummaryModal } from "./SummaryModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { PdfViewerModal } from "./PdfViewerModal";
import { HighlightedText } from "./HighlightedText";
import { apiFetch } from "../../lib/api";

const ITEMS_PER_PAGE = 5;
const SEARCH_WEIGHTS = {
  title: 6,
  authors: 5,
  abstract: 4,
  description: 4,
  adviser: 3,
  critic: 3,
  academic_year: 2,
  status: 1,
  website_url: 1,
};

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function relevanceScore(item, tokens) {
  return Object.entries(SEARCH_WEIGHTS).reduce((score, [field, weight]) => {
    if (field === "abstract" && item.status !== "Finished") return score;
    if (field === "description" && item.status === "Finished") return score;
    const value = normalizeSearchText(item[field]);
    return score + tokens.reduce((fieldScore, token) =>
      fieldScore + (value.includes(token) ? weight : 0), 0);
  }, 0);
}

export default function ResearchList({
  researchLogs,
  onResearchAdded,
  onEdit,
  canDelete = false,
  onNotify,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [academicYearFilter, setAcademicYearFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1); 
  };

  const searchTokens = normalizeSearchText(searchQuery).split(" ").filter(Boolean);
  const academicYears = [...new Set(researchLogs.map((item) => item.academic_year).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));

  const filteredLogs = researchLogs.filter((item) => {
    if (activeTab !== "All" && (item.type || "Capstone") !== activeTab) {
      return false;
    }
    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    if (academicYearFilter !== "All" && item.academic_year !== academicYearFilter) return false;

    const searchableText = normalizeSearchText(Object.keys(SEARCH_WEIGHTS)
      .filter((field) => field !== "abstract" || item.status === "Finished")
      .filter((field) => field !== "description" || item.status !== "Finished")
      .map((field) => item[field])
      .join(" "));
    return searchTokens.every((token) => searchableText.includes(token));
  }).sort((a, b) => {
    if (sortBy === "title") return String(a.title || "").localeCompare(String(b.title || ""));
    if (sortBy === "relevance" && searchTokens.length) {
      const scoreDifference = relevanceScore(b, searchTokens) - relevanceScore(a, searchTokens);
      if (scoreDifference) return scoreDifference;
    }
    const dateDifference = (Date.parse(b.created_at) || Number(b.id) || 0)
      - (Date.parse(a.created_at) || Number(a.id) || 0);
    return dateDifference;
  });

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentPageItems = filteredLogs.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const confirmDelete = async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await apiFetch(`${API_URL}/api/research/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Unable to delete the research record.");

      await res.json();
      const refreshed = onResearchAdded ? await onResearchAdded() : true;
      setDeleteId(null);
      onNotify?.({
        type: refreshed === false ? "error" : "success",
        title: refreshed === false ? "Record deleted; list could not refresh" : "Record deleted",
        message: refreshed === false
          ? "The record was removed, but the repository could not reload. Refresh the page to see the latest list."
          : "The research entry was removed successfully.",
      });

      if (currentPageItems.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error(err);
      onNotify?.({
        type: "error",
        title: "Delete failed",
        message: "The record could not be deleted. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Research Repository
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[42rem] lg:grid-cols-4">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Search all fields</span>
            <input
              type="search"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15"
              placeholder="Search title, summary, authors, adviser..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</span>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15">
              {["All", "MOR", "Part A", "Part B", "Finished"].map((status) => <option key={status} value={status}>{status === "All" ? "All statuses" : status}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Academic year</span>
            <select value={academicYearFilter} onChange={(event) => { setAcademicYearFilter(event.target.value); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15">
              <option value="All">All years</option>
              {academicYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sort by</span>
            <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15">
              <option value="newest">Newest</option>
              <option value="relevance">Relevance</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {["All", "Capstone", "Thesis"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`cursor-pointer whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-700 text-emerald-700"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {tab === "All" ? "All Formats" : tab === "Capstone" ? "Capstone Projects (IT)" : "Theses (CS)"}
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab === "All" 
                    ? researchLogs.length 
                    : researchLogs.filter(log => (log.type || "Capstone") === tab).length
                  }
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* DESKTOP VIEW TABLE */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
        <table className="min-w-[900px] text-sm lg:min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Summary</th>
              <th className="px-4 py-3 text-left">Adviser / Critic</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Assets</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((item) => (
                <ResearchRow
                  key={item.id}
                  item={item}
                  searchQuery={searchQuery}
                  canDelete={canDelete}
                  onEdit={onEdit}
                  onDelete={setDeleteId}
                  onViewSummary={setSelectedSummary}
                  onViewManuscript={(selectedItem) =>
                    setSelectedManuscript({
                      title: selectedItem.title,
                      url: `${API_URL}${selectedItem.pdf_url}`,
                    })
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                      0
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      No records match your criteria
                    </p>
                    <p className="mt-1 text-sm text-slate-500 text-center">
                      Try resetting your tab choice, updating your search query, or adding a new repository item.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS */}
      <div className="space-y-3 md:hidden">
        {currentPageItems.length > 0 ? (
          currentPageItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="wrap-break-word text-sm font-bold text-slate-900">
                      <HighlightedText text={item.title} query={searchQuery} />
                    </h3>
                    <span className={`text-[9px] font-bold px-1 rounded uppercase border shrink-0 ${
                      item.type === "Thesis" 
                        ? "bg-purple-50 text-purple-700 border-purple-200" 
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {item.type || "Capstone"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    {item.authors}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Academic year: {item.academic_year || "Not set"}</p>
                </div>
                <span className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  {item.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Adviser:</span>{" "}
                  {item.adviser || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Critic:</span>{" "}
                  {item.critic || "N/A"}
                </p>
              </div>

              {(item.status === "Finished" ? item.abstract : item.description) && (
                <button
                  type="button"
                  onClick={() => setSelectedSummary(item)}
                  className="mt-3 block cursor-pointer text-left text-xs font-medium text-emerald-700 hover:underline"
                >
                  View summary
                </button>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {item.pdf_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedManuscript({
                        title: item.title,
                        url: `${API_URL}${item.pdf_url}`,
                      })
                    }
                    className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manuscript
                  </button>
                )}
                {item.website_url && (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Website
                  </a>
                )}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="cursor-pointer rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                  >
                    Edit
                  </button>
                )}
                {canDelete && <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
              0
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No records match your criteria
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term or add a new research entry.
            </p>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:flex-none"
            >
              Previous
            </button>

            <div className="hidden sm:flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-8 w-8 cursor-pointer rounded-md border text-sm font-medium transition ${
                      currentPage === pageNumber
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex-1 cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => {
          if (!isDeleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <SummaryModal
        isOpen={selectedSummary !== null}
        summary={selectedSummary?.status === "Finished" ? selectedSummary.abstract : selectedSummary?.description}
        query={searchQuery}
        onClose={() => setSelectedSummary(null)}
      />

      <PdfViewerModal
        file={selectedManuscript}
        onClose={() => setSelectedManuscript(null)}
      />
    </div>
  );
}
