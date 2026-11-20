import { useEffect, useState } from "react";
import { API_URL } from "../../config/constants";
import { apiFetch } from "../../lib/api";
import { FeedbackPopup } from "../ui/FeedbackPopup";
import { AccountMenu } from "../auth/AccountMenu";
import { PasswordInput } from "../auth/PasswordInput";

export function AdminPanel({ currentUser, onBack, onChangePassword, onLogout, onNotify, feedback, onCloseFeedback }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "viewer", password: "" });

  useEffect(() => {
    let isActive = true;
    Promise.all([
      apiFetch(`${API_URL}/api/users`).then(async (response) => {
        const result = await response.json().catch(() => []);
        if (!response.ok) throw new Error(result.error || "Unable to load users.");
        return result;
      }),
      apiFetch(`${API_URL}/api/users/audit-logs`).then(async (response) => {
        const result = await response.json().catch(() => []);
        if (!response.ok) throw new Error(result.error || "Unable to load audit history.");
        return result;
      }),
    ]).then(([userRows, logRows]) => {
      if (isActive) {
        setUsers(userRows);
        setLogs(logRows);
      }
    }).catch((loadError) => {
      if (isActive) setError(loadError.message || "Unable to load administration data.");
    }).finally(() => {
      if (isActive) setIsLoading(false);
    });
    return () => { isActive = false; };
  }, []);

  const updateDraft = (id, changes) => {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, ...changes } : user));
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to create account.");
      setUsers((current) => [...current, result].sort((a, b) => a.name.localeCompare(b.name)));
      setNewUser({ name: "", email: "", role: "viewer", password: "" });
      onNotify?.({ type: "success", title: "Account created", message: `${result.email} can now sign in.` });
      const refreshedLogs = await apiFetch(`${API_URL}/api/users/audit-logs`).then((res) => res.json());
      setLogs(refreshedLogs);
    } catch (createError) {
      setError(createError.message || "Unable to create account.");
    }
  };

  const saveUser = async (user) => {
    setSavingId(user.id);
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: user.role,
          is_active: Boolean(user.is_active),
          ...(user.passwordDraft ? { password: user.passwordDraft } : {}),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to update user access.");
      setUsers((current) => current.map((item) => item.id === user.id ? { ...result, passwordDraft: "" } : item));
      onNotify?.({ type: "success", title: "Access updated", message: `Updated access for ${user.email}.` });
      const refreshedLogs = await apiFetch(`${API_URL}/api/users/audit-logs`).then((res) => res.json());
      setLogs(refreshedLogs);
    } catch (saveError) {
      setError(saveError.message || "Unable to update user access.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User roles and change history</h1>
          </div>
          <AccountMenu currentUser={currentUser} adminPage onBack={onBack} onChangePassword={onChangePassword} onSignOut={onLogout} />
        </div>

        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">Users</h2>
            <p className="mt-1 text-sm text-slate-500">Create accounts directly and assign their access role. Share initial passwords securely.</p>
          </div>
          <form onSubmit={createUser} className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <input aria-label="Name" placeholder="Name" required maxLength={255} value={newUser.name} onChange={(event) => setNewUser((user) => ({ ...user, name: event.target.value }))} className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label="Email" type="email" placeholder="Email" required maxLength={255} value={newUser.email} onChange={(event) => setNewUser((user) => ({ ...user, email: event.target.value }))} className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <select aria-label="Role" value={newUser.role} onChange={(event) => setNewUser((user) => ({ ...user, role: event.target.value }))} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select>
            <PasswordInput aria-label="Initial password" autoComplete="new-password" placeholder="Initial password (12+ chars)" minLength={12} maxLength={256} required value={newUser.password} onChange={(event) => setNewUser((user) => ({ ...user, password: event.target.value }))} className="rounded border border-slate-300 pl-3 pr-14 py-2 text-sm" />
            <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Create account</button>
          </form>
          {isLoading ? <p className="p-6 text-sm text-slate-500">Loading users...</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Last sign-in</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3"><div className="font-semibold text-slate-800">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                      <td className="px-4 py-3"><select value={user.role} disabled={user.id === currentUser.id} onChange={(event) => updateDraft(user.id, { role: event.target.value })} className="rounded border border-slate-300 bg-white px-2 py-1.5 capitalize disabled:opacity-60"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select></td>
                      <td className="px-4 py-3"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={Boolean(user.is_active)} disabled={user.id === currentUser.id} onChange={(event) => updateDraft(user.id, { is_active: event.target.checked })} /><span>{user.is_active ? "Active" : "Inactive"}</span></label></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}</td>
                      <td className="min-w-64 px-4 py-3"><div className="flex flex-col gap-2"><PasswordInput aria-label={`Reset password for ${user.email}`} autoComplete="new-password" placeholder="Reset password (optional)" minLength={12} maxLength={256} value={user.passwordDraft || ""} onChange={(event) => updateDraft(user.id, { passwordDraft: event.target.value })} className="rounded border border-slate-300 pl-2 pr-14 py-1.5 text-xs" /><button type="button" disabled={savingId === user.id} onClick={() => saveUser(user)} className="self-start rounded bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800 disabled:opacity-50">{savingId === user.id ? "Saving..." : "Save access"}</button></div></td>
                    </tr>
                  ))}
                  {!users.length && !isLoading && <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">Audit history</h2>
            <p className="mt-1 text-sm text-slate-500">Latest 200 changes, including who made each change and before/after values.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <details key={log.id} className="px-4 py-4 sm:px-6">
                <summary className="cursor-pointer list-none">
                  <span className="font-semibold capitalize text-slate-800">{log.action} {log.entity_type}</span>
                  <span className="text-slate-600"> - {log.entity_label}</span>
                  <span className="block text-xs text-slate-500">By {log.actor_email} - {new Date(log.created_at).toLocaleString()}</span>
                </summary>
                <pre className="mt-3 overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(log.details, null, 2)}</pre>
              </details>
            ))}
            {!logs.length && !isLoading && <p className="px-4 py-8 text-center text-sm text-slate-500">No changes have been recorded yet.</p>}
          </div>
        </section>
      </div>
      <FeedbackPopup feedback={feedback} onClose={onCloseFeedback} />
    </main>
  );
}
