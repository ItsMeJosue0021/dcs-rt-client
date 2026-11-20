import { useState } from "react";
import { API_URL } from "../../config/constants";
import { PasswordInput } from "./PasswordInput";

export function LoginPage({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      onAuthenticated(result.user, result.csrfToken);
    } catch (signInError) {
      setError(signInError.message || "Unable to sign in.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <img src="/logo.png" alt="Cavite State University logo" className="mx-auto mb-4 h-16 w-16 object-contain" />
        <h1 className="text-center text-2xl font-bold text-slate-900">DCS Research Repository</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Sign in with an account created by a repository administrator.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <PasswordInput autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-md border border-slate-300 pl-3 pr-14 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={isSigningIn} className="w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{isSigningIn ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">Ask an administrator to create your account if you do not have one.</p>
      </section>
    </main>
  );
}
