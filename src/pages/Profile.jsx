import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { compressImageToBase64 } from "../utils/imageUtils";

function Profile({ isEmbedded = false }) {
    const [user, setUser] = useState({ name: "", role: "", email: "", nik: "" });
    const navigate = useNavigate();

    // State Profil Dasar (Email, Kelamin, No HP) & Unggah Foto
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [fotoProfilLocal, setFotoProfilLocal] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [noHp, setNoHp] = useState("");
    const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
    const [loadingProfile, setLoadingProfile] = useState(false);

    // State Password Form
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
    const [loadingPassword, setLoadingPassword] = useState(false);

    // State Tab & Delete Account
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "ringkasan";

    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName });
    };
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const BASE_URL = API_URL.replace(/\/api\/?$/, "");

    // Determine the correct user photo URL based on if it's base64 or a relative path
    const userPhotoUrl = fotoProfilLocal
        ? (fotoProfilLocal.startsWith('data:image') || fotoProfilLocal.startsWith('http'))
            ? fotoProfilLocal
            : `${BASE_URL}${fotoProfilLocal.startsWith('/') ? '' : '/'}${fotoProfilLocal}`
        : null;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data);
            setNewEmail(res.data.email || "");
            setJenisKelamin(res.data.jenis_kelamin || "");
            setNoHp(res.data.no_hp || "");
            setFotoProfilLocal(res.data.foto_profil || "");
            setImagePreview(null);
            setSelectedImage(null);
            setRemovePhoto(false);
        } catch (err) {
            console.error("Gagal mengambil profil:", err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setRemovePhoto(false);
        }
    };

    const handleUpdateProfileInfo = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: "", text: "" });

        setLoadingProfile(true);
        try {
            let base64Image = null;
            if (selectedImage && !removePhoto) {
                base64Image = await compressImageToBase64(selectedImage, 800, 800, 0.7);
            }

            const payload = {
                newEmail: newEmail,
                jenis_kelamin: jenisKelamin,
                no_hp: noHp,
                remove_photo: removePhoto,
                foto_profil: base64Image
            };

            const res = await api.put("/auth/profile/info", payload);

            setProfileMessage({ type: "success", text: res.data.message });
            setIsEditingProfile(false);
            fetchProfile(); // Segarkan pasca simpan
        } catch (err) {
            setProfileMessage({ type: "error", text: err.response?.data?.message || "Terjadi kesalahan sistem saat memperbarui profil." });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: "", text: "" });

        if (!oldPassword || !newPassword || !confirmPassword) {
            return setPasswordMessage({ type: "error", text: "Mohon lengkapi semua isian sandi." });
        }

        if (newPassword !== confirmPassword) {
            return setPasswordMessage({ type: "error", text: "Konfirmasi Kata Sandi Baru tidak cocok." });
        }

        setLoadingPassword(true);
        try {
            const res = await api.put("/auth/profile/password", {
                oldPassword,
                newPassword
            });
            setPasswordMessage({ type: "success", text: res.data.message });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPasswordMessage({ type: "error", text: err.response?.data?.message || "Terjadi kesalahan sistem saat mengubah sandi." });
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDeleteMessage({ type: "", text: "" });

        if (!deletePassword) {
            return setDeleteMessage({ type: "error", text: "Kata sandi diperlukan untuk menghapus akun." });
        }

        setLoadingDelete(true);
        try {
            const res = await api.delete("/auth/profile", {
                data: { password: deletePassword }
            });
            alert(res.data.message || "Akun berhasil dihapus.");
            localStorage.clear();
            window.location.href = "/login";
        } catch (err) {
            setDeleteMessage({ type: "error", text: err.response?.data?.message || "Gagal memusnahkan akun." });
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const handleBackNavigation = () => {
        if (activeTab === 'ringkasan') {
            navigate('/dashboard');
        } else if (activeTab === 'profil') {
            if (isEditingProfile) setIsEditingProfile(false);
            else handleTabChange('ringkasan');
        } else if (activeTab === 'pengaturan_akun') {
            handleTabChange('pengaturan');
        } else if (activeTab === 'pengaturan_sandi' || activeTab === 'pengaturan_hapus') {
            handleTabChange('pengaturan_akun');
        } else {
            handleTabChange('ringkasan');
        }
    };

    const isUser = user.role === "user";

    // Theme configurations
    const themeParams = {
        primaryColor: isUser ? "emerald" : "amber",
        primaryBg: isUser ? "bg-sipentar-green-dark" : "bg-amber-600",
        primaryHover: isUser ? "hover:bg-emerald-800" : "hover:bg-amber-700",
        textHighlight: isUser ? "text-sipentar-green-dark" : "text-amber-700",
        bgLight: isUser ? "bg-sipentar-green-100" : "bg-amber-100",
        bgBadge: isUser ? "bg-sipentar-green-50" : "bg-amber-50",
        ringColor: isUser ? "focus:ring-sipentar-green/30" : "focus:ring-amber-500/30",
        borderColor: isUser ? "focus:border-emerald-500" : "focus:border-amber-500"
    };

    return (
        <div className={`font-sans transition-colors duration-500 ${isEmbedded ? 'pb-8' : 'min-h-screen bg-slate-50 relative pb-16'}`}>

            <div className="relative z-10 w-full h-full">
                {/* Header Formal - only if not embedded */}
                {!isEmbedded && (
                    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-all">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBackNavigation}
                                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all focus:outline-none flex-shrink-0"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className={`flex items-center gap-3 w-full transition-colors ${activeTab === 'ringkasan' ? 'pl-2 border-l border-slate-200' : ''}`}>
                                    {activeTab === 'ringkasan' ? (
                                        <>
                                            {userPhotoUrl ? (
                                                <img src={userPhotoUrl} alt="Profil Atas" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border border-slate-200 shadow-sm ${themeParams.bgLight} ${themeParams.textHighlight}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">{user.name}</h1>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${themeParams.textHighlight} uppercase tracking-wider`}>{isUser ? 'Warga' : 'Admin'}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">&bull;&nbsp; {isUser ? `NIK: ${user.nik}` : 'Sipentar Sistem'}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <h1 className="font-outfit text-[17px] font-bold text-slate-800 tracking-wide border-l border-slate-200 pl-4">
                                            {activeTab === 'profil' ? (isEditingProfile ? 'Ubah Profil' : 'Profil') :
                                                activeTab === 'pengaturan' ? 'Pengaturan' :
                                                    activeTab === 'pengaturan_akun' ? 'Akun' :
                                                        activeTab === 'pengaturan_sandi' ? 'Mengubah Sandi' :
                                                            activeTab === 'pengaturan_hapus' ? 'Hapus Akun' : ''}
                                        </h1>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                <main className={`w-full mx-auto px-4 sm:px-6 lg:px-8 mb-4 ${isEditingProfile ? 'mt-4' : (isEmbedded ? 'mt-0' : 'mt-8')} ${isEmbedded ? 'max-w-7xl' : 'max-w-4xl'}`}>
                    <div className="flex flex-col items-center w-full">

                        {/* VIEW: MENU NAVIGASI GRID (DEFAULT "Ringkasan") */}
                        {activeTab === "ringkasan" && (
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                                {/* Profil Card Formal */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all duration-500 mb-10 relative overflow-hidden group">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 mb-4 sm:mb-6 relative z-10 transition-transform duration-500 group-hover:scale-105">
                                        {userPhotoUrl ? (
                                            <img src={userPhotoUrl} alt="Profil Atas" className="w-full h-full rounded-full object-cover border-[4px] border-white shadow-md relative z-10" />
                                        ) : (
                                            <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-700 shadow-md border-[4px] border-white bg-slate-100 relative z-10`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-outfit text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 relative z-10 tracking-tight">Halo, <span className={`${themeParams.textHighlight}`}>{user.name || "Kawan"}</span>!</h3>
                                    <p className="text-slate-500 max-w-lg leading-relaxed relative z-10 text-xs sm:text-sm md:text-base font-medium">
                                        Pusat Identitas Sipentar. Kelola identitas dan privasi profil Anda dengan aman dan terpadu.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
                                    {/* Kelola Profil Button */}
                                    <button
                                        onClick={() => { handleTabChange("profil"); setProfileMessage({ type: '', text: '' }); }}
                                        className="group flex items-center justify-between w-full px-5 sm:px-6 py-4 sm:py-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sipentar-green/10"
                                    >
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:text-sipentar-green group-hover:border-emerald-200 border border-slate-200 shadow-sm transition-colors shrink-0">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <span className="text-base sm:text-[17px] font-bold text-slate-700 group-hover:text-sipentar-green-dark transition-colors text-left">Kelola Identitas Profil</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-sipentar-green transition-all duration-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>

                                    {/* Pengaturan Button */}
                                    <button
                                        onClick={() => { handleTabChange("pengaturan"); setPasswordMessage({ type: '', text: '' }); setDeleteMessage({ type: '', text: '' }); }}
                                        className="group flex items-center justify-between w-full px-5 sm:px-6 py-4 sm:py-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    >
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:text-indigo-600 group-hover:border-indigo-200 border border-slate-200 shadow-sm transition-colors shrink-0">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <span className="text-base sm:text-[17px] font-bold text-slate-700 group-hover:text-indigo-700 transition-colors text-left">Keamanan & Privasi</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all duration-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="group flex items-center justify-between w-full px-5 sm:px-6 py-4 sm:py-5 bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50 shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 mt-2 sm:mt-4"
                                    >
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:text-red-600 group-hover:border-red-200 border border-slate-200 shadow-sm transition-colors shrink-0">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            </div>
                                            <span className="text-base sm:text-[17px] font-bold text-slate-700 group-hover:text-red-700 transition-colors text-left">Keluar dari Akun (Logout)</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-red-600 transition-all duration-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW: AREA KONTEN PENUH */}
                        <div className={`w-full max-w-2xl mx-auto ${activeTab === 'ringkasan' ? 'hidden' : 'block'}`}>

                            {/* VIEW: KELOLA PROFIL (Dual-Mode: Read vs Edit) */}
                            {activeTab === "profil" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500 transition-all relative">

                                    {isEditingProfile && (
                                        <div className="px-6 md:px-10 py-7 border-b border-slate-200 relative z-10 bg-slate-50/50">
                                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ubah Profil</h3>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">Mutakhirkan informasi identitas resmi Anda.</p>
                                        </div>
                                    )}

                                    <div className="p-0 relative z-10">
                                        {profileMessage.text && (
                                            <div className={`m-6 p-4 rounded-xl flex items-center text-sm shadow-sm border ${profileMessage.type === 'success' ? 'bg-sipentar-green-50 text-sipentar-green-dark border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <p className="font-bold">{profileMessage.text}</p>
                                            </div>
                                        )}

                                        {!isEditingProfile ? (
                                            /* ================= READ MODE ================= */
                                            <div className="flex flex-col animate-in fade-in duration-500 pt-8">
                                                <div className="flex flex-col items-center justify-center pb-8 px-6 text-center">
                                                    <div className="w-28 h-28 mb-5 relative group cursor-default">
                                                        {userPhotoUrl ? (
                                                            <img src={userPhotoUrl} alt="Profil" className="w-[105px] h-[105px] rounded-full object-cover border-[3px] border-white shadow-md relative z-10" />
                                                        ) : (
                                                            <div className={`w-[105px] h-[105px] rounded-full flex items-center justify-center text-[40px] font-black text-slate-700 shadow-md border-[3px] border-white bg-slate-100 relative z-10`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h2 className="text-xl font-black tracking-widest uppercase text-slate-900 mb-2">{user.name}</h2>
                                                    <p className={`text-sm font-bold ${themeParams.textHighlight} tracking-widest mb-1.5 uppercase`}>{isUser ? 'Warga Masyarakat' : 'Panel Administrator'}</p>
                                                    <p className="text-xs font-medium text-slate-500 tracking-wide mb-4">{isUser ? 'Pelapor Terdaftar' : 'Sistem Kontrol'}</p>
                                                    <div className={`inline-flex px-4 py-1.5 rounded-full ${themeParams.bgLight} ${themeParams.textHighlight} text-[10px] font-bold tracking-widest`}>
                                                        TERVERIFIKASI
                                                    </div>
                                                </div>

                                                <div className="px-6 md:px-10 pb-10 space-y-4">
                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex align-middle justify-between">
                                                        <div>
                                                            <span className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">Email / Surel</span>
                                                            <span className="block text-[15px] font-bold text-slate-900">{user.email}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex align-middle justify-between">
                                                        <div>
                                                            <span className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">Jenis Kelamin</span>
                                                            <span className="block text-[15px] font-bold text-slate-900">{jenisKelamin || "Belum diatur"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex align-middle justify-between">
                                                        <div>
                                                            <span className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">Nomor Handphone</span>
                                                            <span className="block text-[15px] font-bold text-slate-900">{noHp ? `+62 ${noHp.replace(/^\+?62/, '')}` : "Belum diatur"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6">
                                                        <button
                                                            onClick={() => setIsEditingProfile(true)}
                                                            className={`w-full ${themeParams.primaryBg} ${themeParams.primaryHover} text-white font-black uppercase tracking-widest text-sm py-4 px-4 rounded-xl shadow-sm transition-all duration-300`}
                                                        >
                                                            Ubah Data Profil
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ================= EDIT MODE ================= */
                                            <form onSubmit={handleUpdateProfileInfo} className="px-5 md:px-10 py-6 md:py-8 animate-in fade-in slide-in-from-top-2 duration-500 relative z-10 flex flex-col gap-6 w-full">
                                                <div className="flex flex-col items-center justify-center mb-4 relative z-10 pt-2">
                                                    <div className="relative group/photo">
                                                        {(!removePhoto && (imagePreview || userPhotoUrl)) ? (
                                                            <img src={imagePreview || userPhotoUrl} alt="Preview" className="w-[105px] h-[105px] rounded-full object-cover border-[3px] border-white shadow-md relative z-10" />
                                                        ) : (
                                                            <div className={`w-[105px] h-[105px] rounded-full flex items-center justify-center text-[40px] font-black text-slate-700 bg-slate-100 shadow-md border-[3px] border-white relative z-10`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}

                                                        {(!removePhoto && (imagePreview || userPhotoUrl)) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); setRemovePhoto(true); setImagePreview(null); setSelectedImage(null); }}
                                                                className="absolute top-0 -right-2 w-8 h-8 bg-white border border-slate-200 text-rose-500 shadow-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-50 transition-all z-30"
                                                                title="Hapus Foto Profil"
                                                            >
                                                                <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        )}

                                                        <label className="absolute bottom-0 -right-2 w-9 h-9 bg-white border border-slate-200 text-sipentar-green shadow-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors z-20">
                                                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8V6a2 2 0 012-2h1.5l1.65-2h5.7l1.65 2H18a2 2 0 012 2v2M4 8h16M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8m-9 9a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Nama Lengkap</label>
                                                        <input
                                                            type="text"
                                                            className="appearance-none bg-slate-100 border border-slate-200 text-slate-500 text-[15px] font-medium rounded-xl block w-full px-5 py-4 cursor-not-allowed shadow-inner"
                                                            value={user.name}
                                                            readOnly
                                                            disabled
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Email</label>
                                                        <input
                                                            type="email"
                                                            required
                                                            className={`appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-[15px] font-medium rounded-xl focus:bg-white focus:ring-4 ${themeParams.ringColor} ${themeParams.borderColor} block w-full px-5 py-4 outline-none transition-all`}
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Jenis Kelamin</label>
                                                        <select
                                                            className={`appearance-none bg-white border border-slate-300 text-slate-900 text-[15px] font-medium rounded-xl focus:ring-4 ${themeParams.ringColor} ${themeParams.borderColor} block w-full px-5 py-4 outline-none transition-all cursor-pointer`}
                                                            value={jenisKelamin}
                                                            onChange={(e) => setJenisKelamin(e.target.value)}
                                                        >
                                                            <option value="" className="text-slate-500">-- Pilih --</option>
                                                            <option value="Laki-laki">Laki-laki</option>
                                                            <option value="Perempuan">Perempuan</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Nomor Handphone</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-[15px] font-bold text-slate-500 pointer-events-none">+62</div>
                                                            <input
                                                                type="tel"
                                                                className={`appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-[15px] font-medium rounded-xl focus:bg-white focus:ring-4 ${themeParams.ringColor} ${themeParams.borderColor} block w-full pl-14 pr-5 py-4 outline-none transition-all`}
                                                                value={noHp.replace(/^\+?62/, '')}
                                                                placeholder="000 0000 0000 0000"
                                                                onChange={(e) => setNoHp(e.target.value)}
                                                                maxLength={15}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={loadingProfile}
                                                        className={`w-full py-4 text-sm font-black text-white uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 ${themeParams.primaryBg} ${themeParams.primaryHover} shadow-sm flex items-center justify-center`}
                                                    >
                                                        {loadingProfile ? "Memproses..." : "Simpan Pembaruan"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* VIEW: PENGATURAN (MAIN MENU) */}
                            {activeTab === "pengaturan" && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500">
                                    <button
                                        onClick={() => handleTabChange("pengaturan_akun")}
                                        className="group flex items-center justify-between w-full px-6 py-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-sipentar-green/10 shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sipentar-green-dark transition-colors shadow-sm">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <span className="text-[17px] font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">Manajemen Sandi & Akun</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-sipentar-green transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* VIEW: PENGATURAN -> AKUN */}
                            {activeTab === "pengaturan_akun" && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500 space-y-4">
                                    <button
                                        onClick={() => handleTabChange("pengaturan_sandi")}
                                        className="group flex items-center justify-between w-full px-6 py-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-amber-600 group-hover:border-amber-200 transition-colors shadow-sm">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            </div>
                                            <span className="text-[17px] font-bold text-slate-700 group-hover:text-amber-700 transition-colors">Ubah Kunci Akses</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange("pengaturan_hapus")}
                                        className="group flex items-center justify-between w-full px-6 py-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-rose-500/10 shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-rose-600 group-hover:border-rose-200 transition-colors shadow-sm">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </div>
                                            <span className="text-[17px] font-bold text-slate-700 group-hover:text-rose-700 transition-colors">Pemutusan Ekosistem Definitif</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* VIEW: GANTI SANDI FORM */}
                            {activeTab === "pengaturan_sandi" && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500 relative">
                                    <div className="px-6 md:px-10 py-7 border-b border-slate-200 bg-slate-50/50">
                                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Keamanan Lanjut</h3>
                                        <p className="text-sm font-medium text-slate-500 mt-1.5">Ubah kunci kriptografik akses harian Anda.</p>
                                    </div>
                                    <div className="p-0 relative z-10">
                                        {passwordMessage.text && (
                                            <div className={`m-6 p-4 rounded-xl flex items-center text-sm border ${passwordMessage.type === 'success' ? 'bg-sipentar-green-50 text-sipentar-green-dark border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <p className="font-bold">{passwordMessage.text}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleUpdatePassword} className="p-6 md:p-10 space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Sandi Konfirmasi Saat Ini</label>
                                                <input
                                                    type="password"
                                                    required
                                                    className="appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-[15px] font-medium rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 block w-full px-5 py-4 outline-none transition-all placeholder-slate-400"
                                                    placeholder="Sandi saat ini..."
                                                    value={oldPassword}
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Sandi Baru</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="appearance-none bg-slate-50 border border-amber-300/50 text-slate-900 text-[15px] font-medium rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 block w-full px-5 py-4 outline-none transition-all placeholder-slate-400"
                                                        placeholder="Sandi baru..."
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1 mb-2">Konfirmasi Sandi Baru</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="appearance-none bg-slate-50 border border-amber-300/50 text-slate-900 text-[15px] font-medium rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 block w-full px-5 py-4 outline-none transition-all placeholder-slate-400"
                                                        placeholder="Ulangi kembali..."
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={loadingPassword}
                                                    className="w-full py-4 text-sm font-black text-white uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] shadow-sm flex items-center justify-center"
                                                >
                                                    {loadingPassword ? "Memvalidasi..." : "Terapkan Sandi Baru"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* VIEW: HAPUS AKUN FORM */}
                            {activeTab === "pengaturan_hapus" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-rose-200 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500 relative">
                                    <div className="px-6 md:px-10 py-7 border-b border-rose-200 bg-rose-50 flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Protokol Kehancuran</h3>
                                            <p className="text-sm font-medium text-slate-500 mt-1.5">Pemusnahan absolut identitas digital Anda.</p>
                                        </div>
                                    </div>

                                    <div className="p-0 relative z-10">
                                        {deleteMessage.text && (
                                            <div className="m-6 p-4 rounded-xl flex items-center text-sm border bg-red-50 text-red-700 border-red-200 shadow-sm">
                                                <p className="font-bold">{deleteMessage.text}</p>
                                            </div>
                                        )}

                                        <div className="px-6 md:px-10 py-8">
                                            <div className="bg-slate-50 p-5 rounded-xl border border-rose-200 mb-8 border-l-4 border-l-rose-500 shadow-sm">
                                                <p className="text-[14px] text-slate-700 font-medium leading-relaxed">
                                                    Jika Anda mengeksekusi ini, sekumpulan data krusial—sertifikat identitas, rekam wajah, & log pelaporan—akan dihanguskan secara permanen dari server utama tanpa peluang restorasi.
                                                </p>
                                                <p className="font-black text-rose-600 uppercase tracking-widest text-[10px] mt-4">Kesalahan Konsekuensi Menjadi Tanggung Jawab Pribadi.</p>
                                            </div>

                                            {!showDeleteConfirm ? (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="w-full py-4 text-sm font-black text-rose-700 uppercase tracking-widest rounded-xl transition-all bg-rose-50 hover:bg-rose-100 border border-rose-200 focus:ring-4 focus:ring-rose-500/20 flex items-center justify-center gap-3"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Setujui Pemusnahan Akun
                                                </button>
                                            ) : (
                                                <form onSubmit={handleDeleteAccount} className="bg-slate-50 p-6 md:p-8 rounded-xl border border-slate-200 space-y-6 animate-in fade-in shadow-sm">
                                                    <div>
                                                        <label className="block text-[15px] font-black tracking-widest uppercase text-slate-800 mb-2">
                                                            Konfirmasi Definitif
                                                        </label>
                                                        <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">Buktikan validitas otoritas Anda dengan mengisi kunci sandi Anda.</p>
                                                        <input
                                                            type="password"
                                                            required
                                                            placeholder="Kata sandi validasi..."
                                                            value={deletePassword}
                                                            onChange={(e) => setDeletePassword(e.target.value)}
                                                            className="w-full px-5 py-4 bg-white border border-rose-300 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-slate-900 font-medium placeholder-slate-400 shadow-sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDeleteConfirm(false)}
                                                            className="w-full sm:w-auto px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={loadingDelete}
                                                            className="w-full sm:w-auto px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all shadow-sm disabled:opacity-50 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] outline-none rounded-xl"
                                                        >
                                                            {loadingDelete ? "Menghapus..." : "Eksekusi Destruksi"}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;
