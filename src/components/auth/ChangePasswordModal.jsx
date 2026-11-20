import { useState } from "react";
import { API_URL } from "../../config/constants";
import { apiFetch } from "../../lib/api";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "./PasswordInput";

export function ChangePasswordModal({ isOpen, onClose, onNotify }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetAndClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/api/auth/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to change password.");
      onNotify?.({ type: "success", title: "Password changed", message: "Your password has been updated." });
      resetAndClose();
    } catch (changeError) {
      setError(changeError.message || "Unable to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Change password" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">Current password</span><PasswordInput autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-md border border-slate-300 pl-3 pr-14 py-2 text-sm" /></label>
        <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">New password</span><PasswordInput autoComplete="new-password" minLength={12} maxLength={256} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-md border border-slate-300 pl-3 pr-14 py-2 text-sm" /><span className="block text-xs text-slate-500">Use at least 12 characters.</span></label>
        <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">Confirm new password</span><PasswordInput autoComplete="new-password" minLength={12} maxLength={256} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded-md border border-slate-300 pl-3 pr-14 py-2 text-sm" /></label>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={isSaving} onClick={resetAndClose} className="rounded border border-slate-300 px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isSaving} className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "Saving..." : "Change password"}</button></div>
      </form>
    </Modal>
  );
}
