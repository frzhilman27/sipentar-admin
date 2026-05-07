import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();
    const [nik, setNik] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Data Kependudukan Tambahan
    const [rt, setRt] = useState("01");
    const [rw, setRw] = useState("01");
    const [tempatLahir, setTempatLahir] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [agama, setAgama] = useState("");
    const [pekerjaan, setPekerjaan] = useState("");
    const [noHp, setNoHp] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (nik.length !== 16) {
            setError("NIK harus persis 16 digit angka.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await api.post("/auth/register", { 
                nik, name, email, password,
                rt, rw, tempat_lahir: tempatLahir, tanggal_lahir: tanggalLahir,
                jenis_kelamin: jenisKelamin, agama, pekerjaan, no_hp: noHp
            });
            alert("Pendaftaran berhasil, silakan login menggunakan NIK Anda.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Gagal membuat identitas. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-900 font-sans selection:bg-blue-200 py-12 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat fixed transform scale-105"
                style={{ backgroundImage: `url('/rice_field_bg.png')` }}
            >
                {/* Premium Dark Tint Overlay */}
                <div className="absolute inset-0 bg-slate-900/60"></div>
                {/* Glassmorphism subtle blur layer */}
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 py-8 sm:px-4 sm:py-12">
                {/* Register Card - Formal Solid White */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-10 relative overflow-hidden w-full">

                    <div className="text-center mb-6 sm:mb-8 font-jakarta">
                        <img src="/logosipentar.png" alt="Logo Sipentar" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto object-cover shadow-md mb-4 sm:mb-5 ring-2 ring-white ring-offset-2 ring-offset-blue-50" />
                        <h2 className="font-outfit text-2xl font-extrabold text-slate-900 tracking-tight">Registrasi Warga</h2>
                        <p className="text-xs font-bold text-sipentar-blue mt-1.5 uppercase tracking-widest">Aktivasi Identitas Sipentar</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 flex items-start">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm text-red-800 font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Kiri: Data Login & Identitas Dasar */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Akun</h3>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Nomor Induk Kependudukan (NIK)</label>
                                    <input
                                        type="number"
                                        placeholder="16 Digit NIK KTP Resmi..."
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={nik}
                                        onChange={(e) => setNik(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Nama Lengkap (Sesuai KTP)</label>
                                    <input
                                        type="text"
                                        placeholder="Misal: Bapak Ahmad"
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Email Aktif</label>
                                    <input
                                        type="email"
                                        placeholder="ahmad@domain.com"
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Buat Kata Sandi</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Nomor HP/WhatsApp Aktif</label>
                                    <input
                                        type="tel"
                                        placeholder="08123456789"
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={noHp}
                                        onChange={(e) => setNoHp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Kanan: Data Kependudukan Tambahan */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Data Kependudukan</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">RT</label>
                                        <select
                                            value={rt}
                                            onChange={(e) => setRt(e.target.value)}
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 outline-none transition bg-white shadow-sm font-medium"
                                        >
                                            {[...Array(27)].map((_, i) => {
                                                const val = String(i + 1).padStart(2, '0');
                                                return <option key={val} value={val}>{val}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">RW</label>
                                        <select
                                            value={rw}
                                            onChange={(e) => setRw(e.target.value)}
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 outline-none transition bg-white shadow-sm font-medium"
                                        >
                                            {[...Array(9)].map((_, i) => {
                                                const val = String(i + 1).padStart(2, '0');
                                                return <option key={val} value={val}>{val}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Tempat Lahir</label>
                                        <input
                                            type="text"
                                            placeholder="Kota Lahir"
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                            value={tempatLahir}
                                            onChange={(e) => setTempatLahir(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Tanggal Lahir</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 outline-none transition bg-white shadow-sm font-medium"
                                            value={tanggalLahir}
                                            onChange={(e) => setTanggalLahir(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Jenis Kelamin</label>
                                        <select
                                            value={jenisKelamin}
                                            onChange={(e) => setJenisKelamin(e.target.value)}
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 outline-none transition bg-white shadow-sm font-medium"
                                            required
                                        >
                                            <option value="" disabled>Pilih</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Agama</label>
                                        <select
                                            value={agama}
                                            onChange={(e) => setAgama(e.target.value)}
                                            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 outline-none transition bg-white shadow-sm font-medium"
                                            required
                                        >
                                            <option value="" disabled>Pilih</option>
                                            <option value="Islam">Islam</option>
                                            <option value="Kristen">Kristen</option>
                                            <option value="Katolik">Katolik</option>
                                            <option value="Hindu">Hindu</option>
                                            <option value="Buddha">Buddha</option>
                                            <option value="Konghucu">Konghucu</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5 pl-1">Pekerjaan</label>
                                    <input
                                        type="text"
                                        placeholder="Misal: Pegawai Negeri, Wiraswasta"
                                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-sipentar-blue/20 focus:border-sipentar-blue text-slate-900 placeholder-slate-400 outline-none transition bg-white shadow-sm font-medium"
                                        value={pekerjaan}
                                        onChange={(e) => setPekerjaan(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-sipentar-blue hover:bg-sipentar-blue-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-700/30 disabled:opacity-50 transform active:scale-95"
                        >
                            {loading ? "Memproses Data..." : "Aktivasi Akun Sekarang"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-600 font-medium">
                            Sudah punya identitas?{' '}
                            <Link to="/login" className="text-sipentar-blue font-bold hover:text-sipentar-blue-dark hover:underline transition">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
