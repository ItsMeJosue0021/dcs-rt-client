// src/App.jsx
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config/constants";
import { AccountModal } from "./components/auth/AccountModal";
import { LoginPage } from "./components/auth/LoginPage";
import ResearchFormModal from "./components/research/ResearchFormModal";
import ResearchList from "./components/research/ResearchList";
import { FeedbackPopup } from "./components/ui/FeedbackPopup";
import {
  clearStoredToken,
  getAuthHeaders,
  getStoredToken,
  storeToken,
} from "./utils/auth";

export default function App() {
  const [researchLogs, setResearchLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [authToken, setAuthToken] = useState(() => getStoredToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const showLoadError = () => {
    setFeedback({
      type: "error",
      title: "Unable to load records",
      message: "Please check the API connection and refresh the page.",
    });
  };

  const handleLogout = useCallback(() => {
    clearStoredToken();
    setAuthToken(null);
    setCurrentUser(null);
    setResearchLogs([]);
    setIsAccountOpen(false);
  }, []);

  const loadResearch = useCallback(async (token = authToken) => {
    const res = await fetch(`${API_URL}/api/research`, {
      headers: getAuthHeaders(token),
    });

    if (res.status === 401 || res.status === 403) {
      handleLogout();
      throw new Error("Authentication expired.");
    }

    if (!res.ok) throw new Error("Unable to load research entries.");

    return res.json();
  }, [authToken, handleLogout]);

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
    if (!authToken) return undefined;

    let isActive = true;

    fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders(authToken),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          throw new Error("Authentication expired.");
        }
        if (!res.ok) throw new Error("Unable to verify session.");
        return res.json();
      })
      .then((data) => {
        if (isActive) setCurrentUser(data.user);
        return loadResearch(authToken);
      })
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
  }, [authToken, handleLogout, loadResearch]);

  const handleLogin = ({ token, user }) => {
    storeToken(token);
    setAuthToken(token);
    setCurrentUser(user);
  };

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

  if (!authToken) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b border-emerald-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 lg:px-0 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

          <div className="flex w-full items-center justify-between gap-3 bg-white sm:w-auto sm:justify-end">
            <div className="min-w-0 text-left sm:text-right ">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs sm:tracking-[0.16em]">
                Department of Computer Studies
              </p>
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                Research Repository System
              </p>
            </div>
            
            <div className="relative rounded-lg border border-emerald-100 bg-white p-2">
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:border-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                aria-label="Open account menu"
              >
                {(currentUser?.name || currentUser?.email || "A").trim().charAt(0).toUpperCase()}
              </button>
              <AccountModal
                isOpen={isAccountOpen}
                user={currentUser}
                onClose={() => setIsAccountOpen(false)}
                onLogout={handleLogout}
              />
            </div>
            
          </div>
        </div>
      </header>

      <main className="p-4 pb-28 sm:p-6 sm:pb-24 lg:p-10 lg:pb-24">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
          
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight sm:text-3xl">
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
            className="cursor-pointer inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-700/25 focus:ring-offset-2 sm:w-auto"
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
            authToken={authToken}
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
        authToken={authToken}
      />

      <FeedbackPopup feedback={feedback} onClose={() => setFeedback(null)} />

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-100 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-10">
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
