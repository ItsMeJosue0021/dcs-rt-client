// src/App.jsx
import { useEffect, useState } from "react";
import { API_URL } from "./config/constants";
import ResearchFormModal from "./components/research/ResearchFormModal";
import ResearchList from "./components/research/ResearchList";
import { FeedbackPopup } from "./components/ui/FeedbackPopup";

export default function App() {
  const [researchLogs, setResearchLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showLoadError = () => {
    setFeedback({
      type: "error",
      title: "Unable to load records",
      message: "Please check the API connection and refresh the page.",
    });
  };

  const loadResearch = async () => {
    const res = await fetch(`${API_URL}/api/research`);
    if (!res.ok) throw new Error("Unable to load research entries.");

    return res.json();
  };

  const fetchResearch = async () => {
    try {
      const data = await loadResearch();
      setResearchLogs(data);
    } catch (err) {
      console.error("Database sync runtime failure:", err);
      showLoadError();
    }
  };

  useEffect(() => {
    let isActive = true;

    loadResearch()
      .then((data) => {
        if (isActive) setResearchLogs(data);
      })
      .catch((err) => {
        console.error("Database sync runtime failure:", err);
        if (isActive) showLoadError();
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleEdit = (item) => {
    setSelectedResearch(item);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedResearch(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b border-emerald-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Cavite State University logo"
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                Cavite State University
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#60755f]">
                Bacoor City Campus
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Department of Computer Studies
            </p>
            <p className="text-sm font-medium text-slate-600">
              Research Repository System
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 pb-24 lg:p-10 lg:pb-24">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            DCS Research Repository
          </h1>
          <p className="text-sm text-emerald-700 font-medium mt-1">
            Centralized archive for DCS student research projects
          </p>
        </div>

        <button
          onClick={() => {
            setIsEdit(false);
            setSelectedResearch(null);
            setIsModalOpen(true);
          }}
          className="cursor-pointer inline-flex items-center gap-2.5 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-700/25 focus:ring-offset-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-base leading-none">
            +
          </span>
          Add Research Entry
        </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <ResearchList
            researchLogs={researchLogs}
            onResearchAdded={fetchResearch}
            onEdit={handleEdit}
            onNotify={setFeedback}
          />
        </div>
      </main>

      <ResearchFormModal
        key={selectedResearch?.id || "new"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onResearchAdded={fetchResearch}
        editData={selectedResearch}
        isEdit={isEdit}
        onNotify={setFeedback}
      />

      <FeedbackPopup feedback={feedback} onClose={() => setFeedback(null)} />

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-100 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 px-6 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-10">
          <p className="text-xs font-medium text-slate-600">
            DCS Research Repository System
          </p>
          <p className="text-xs text-slate-500">
            Developed by{" "}
            <span className="font-semibold text-emerald-700">Dhan Belgica</span>
            {" "}and{" "}
            <span className="font-semibold text-emerald-700">
              Joshua Salceda
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
