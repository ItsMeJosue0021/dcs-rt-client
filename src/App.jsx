// src/App.jsx
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config/constants";
import { apiFetch, setCsrfToken } from "./lib/api";
import { LoginPage } from "./components/auth/LoginPage";
import { AccountMenu } from "./components/auth/AccountMenu";
import { ChangePasswordModal } from "./components/auth/ChangePasswordModal";
import { AdminPanel } from "./components/admin/AdminPanel";
import ResearchFormModal from "./components/research/ResearchFormModal";
import ResearchList from "./components/research/ResearchList";
import { FeedbackPopup } from "./components/ui/FeedbackPopup";

export default function App() {
  const [researchLogs, setResearchLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const showLoadError = useCallback(() => {
    setFeedback({
      type: "error",
      title: "Unable to load records",
      message: "Please check the API connection and refresh the page.",
    });
  }, []);

  const loadResearch = useCallback(async () => {
    const res = await apiFetch(`${API_URL}/api/research`);
    if (!res.ok) throw new Error("Unable to load research entries.");

    return res.json();
  }, []);

  const fetchResearch = useCallback(async () => {
    try {
      const data = await loadResearch();
      setResearchLogs(data);
      return true;
    } catch (err) {
      console.error("Database sync runtime failure:", err);
      showLoadError();
      return false;
    }
  }, [loadResearch, showLoadError]);

  const handleAuthenticated = useCallback((user, csrfToken) => {
    setCsrfToken(csrfToken);
    setCurrentUser(user);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await apiFetch(`${API_URL}/api/auth/logout`, { method: "POST" });
    } catch (error) {
      console.error("Sign out request failed:", error);
    } finally {
      setCsrfToken(null);
      setCurrentUser(null);
      setIsAdminPanelOpen(false);
      setIsPasswordModalOpen(false);
      setResearchLogs([]);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    apiFetch(`${API_URL}/api/auth/me`)
      .then(async (res) => {
        const result = await res.json().catch(() => ({}));
        return res.ok ? result : null;
      })
      .then((result) => {
        if (!isActive || !result?.user) return;
        setCsrfToken(result.csrfToken);
        setCurrentUser(result.user);
      })
      .catch((error) => console.error("Session check failed:", error))
      .finally(() => { if (isActive) setAuthReady(true); });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) return undefined;
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
  }, [authReady, currentUser, loadResearch, showLoadError]);

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

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking your session...</div>;
  }
  if (!currentUser) return <LoginPage onAuthenticated={handleAuthenticated} />;
  if (isAdminPanelOpen && currentUser.role === "admin") {
    return (
      <>
        <AdminPanel currentUser={currentUser} onBack={() => setIsAdminPanelOpen(false)} onChangePassword={() => setIsPasswordModalOpen(true)} onLogout={handleSignOut} onNotify={setFeedback} feedback={feedback} onCloseFeedback={() => setFeedback(null)} />
        <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onNotify={setFeedback} />
      </>
    );
  }

  const canEdit = ["admin", "editor"].includes(currentUser.role);

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

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs sm:tracking-[0.16em]">
              Department of Computer Studies
            </p>
            <p className="text-xs font-medium text-slate-600 sm:text-sm">
              Research Repository System
            </p>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-3 px-4 pb-3 text-sm sm:px-6 lg:px-0">
          <AccountMenu currentUser={currentUser} onOpenAdmin={() => setIsAdminPanelOpen(true)} onChangePassword={() => setIsPasswordModalOpen(true)} onSignOut={handleSignOut} />
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

          {canEdit && <button
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
          </button>}
        </div>

        <div className="max-w-7xl mx-auto">
          <ResearchList
            researchLogs={researchLogs}
            onResearchAdded={fetchResearch}
            onEdit={canEdit ? handleEdit : undefined}
            canDelete={currentUser.role === "admin"}
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
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onNotify={setFeedback} />

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
