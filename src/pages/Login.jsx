import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
        role_target: "admin"
      });

      // Double-check: backend should enforce this, but verify on client too
      if (res.data.role !== "admin") {
        setError("Akses Ditolak: Halaman ini adalah area terlarang khusus Administrator.");
        localStorage.clear();
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Kredensial tidak valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-950 font-sans selection:bg-slate-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url('/rice_field_bg.png')` }}
        >
          <div className="absolute inset-0 bg-slate-950/85"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
        </div>
      </div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-4 sm:py-12">
        {/* Admin Login Card - Dark Theme */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden relative transition-all duration-500 p-6 sm:p-10 w-full ring-1 ring-white/5">

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500"></div>

          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block">
              <img src="/logosipentar.png" alt="Logo Sipentar" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto object-cover shadow-lg mb-4 sm:mb-5 ring-2 ring-amber-500/30 ring-offset-2 ring-offset-slate-900" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <h2 className="font-outfit text-2xl font-extrabold tracking-tight text-white">Portal Administrator</h2>
            <p className="text-xs font-bold mt-1.5 uppercase tracking-[0.2em] text-amber-400/80">
              Sistem Pelaporan Desa Terpadu
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 py-2.5 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-[11px] font-bold text-slate-400 tracking-wide">Area Terlarang — Khusus Aparatur Desa</span>
          </div>

          {error && (
            <div className="border-l-4 p-4 rounded-r-lg mb-6 flex items-start bg-red-950/50 border-red-500">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-bold text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1.5 pl-1 text-slate-300">
                Alamat Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="admin@sipentar.desa.id"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl outline-none transition font-medium text-white placeholder-slate-500 shadow-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5 pl-1 text-slate-300">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl outline-none transition font-medium text-white placeholder-slate-500 shadow-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-extrabold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-600/20 disabled:opacity-50 transform active:scale-95"
            >
              {loading ? "Memverifikasi Akses..." : "Masuk ke Dashboard Admin"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 font-medium tracking-wide flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Akses terbatas hanya untuk petugas berwenang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;