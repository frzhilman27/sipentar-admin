import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import KelolaWarga from "./KelolaWarga";
import Profile from "./Profile";
import { compressImageToBase64 } from "../utils/imageUtils";
import AIChatWidget from "../components/AIChatWidget";
import DashboardLayout from "../layouts/DashboardLayout";

function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("beranda");
  const notifRef = useRef(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [stats, setStats] = useState({ totalWarga: "..." });

  // Modal Evidence States
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceTargetId, setEvidenceTargetId] = useState(null);
  const [evidenceTargetStatus, setEvidenceTargetStatus] = useState("");
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [evidencePreviewUrls, setEvidencePreviewUrls] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTargetId, setHistoryTargetId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Clean up object URLs
  useEffect(() => {
    if (evidenceImages.length > 0) {
      const urls = evidenceImages.map(img => URL.createObjectURL(img));
      setEvidencePreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setEvidencePreviewUrls([]);
    }
  }, [evidenceImages]);

  const renderMedia = (urlArray, fallbackUrl, borderColorClass) => {
    let urls = [];
    if (urlArray && Array.isArray(urlArray) && urlArray.length > 0) {
      urls = urlArray;
    } else if (fallbackUrl) {
      urls = [fallbackUrl];
    }

    return urls.map((url, idx) => {
      const fullUrl = url.startsWith('data:image') || url.startsWith('blob:') ? url : `${IMAGE_BASE_URL}/uploads/${url}`;
      const isVideo = fullUrl.match(/\.(mp4|webm|ogg)$/i);
      if (isVideo) {
        return <video key={idx} src={fullUrl} className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border ${borderColorClass} shadow-sm`} muted playsInline controls />;
      } else {
        return <img key={idx} src={fullUrl} className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border ${borderColorClass} cursor-zoom-in hover:opacity-85 shadow-sm`} onClick={() => setSelectedImage(fullUrl)} alt={`Lampiran ${idx+1}`} />;
      }
    });
  };

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const BASE_URL = API_URL.replace(/\/api\/?$/, "");
  const IMAGE_BASE_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUserProfileData(res.data);
    } catch (err) {
      console.error("Gagal mengambil profil detail:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/laporan");
      setReports(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/public/stats");
      setStats({ totalWarga: res.data.totalWarga });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Gagal memuat notifikasi", err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchUserProfile();
    fetchReports();
    fetchNotifications();
    fetchStats();

    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Gagal menandai dibaca", err);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      handleMarkAllAsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        fetchNotifications();
      } catch (err) {
        console.error("Gagal menandai notifikasi dibaca", err);
      }
    }
    if (!notif.laporan_id) return;
    
    const report = reports.find(r => String(r.id) === String(notif.laporan_id));
    if (report) {
      setActiveMainTab(report.status === 'Menunggu' ? 'aduan_masuk' : 'beranda');
      setTimeout(() => {
        const el = document.getElementById(`report-${report.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-sipentar-blue/30', 'transition-all', 'duration-1000');
          setTimeout(() => el.classList.remove('ring-4', 'ring-sipentar-blue/30'), 2500);
        }
      }, 300);
    }
  };

  const handleStatusSelect = (id, newStatus) => {
    if (newStatus === "Diproses" || newStatus === "Selesai") {
      setEvidenceTargetId(id);
      setEvidenceTargetStatus(newStatus);
      setShowEvidenceModal(true);
    } else {
      handleUpdateStatus(id, newStatus, null);
    }
  };

  const handleUpdateStatus = async (id, newStatus, adminEvidenceUrls = null) => {
    try {
      await api.put(`/laporan/${id}/status`, { status: newStatus, adminEvidenceUrls });
      fetchReports();
      setShowEvidenceModal(false);
      setEvidenceImages([]);
    } catch (err) {
      alert(err.response?.data?.error || "Gagal memperbarui status");
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handleConfirmEvidence = async () => {
    if (evidenceImages.length === 0) {
      alert("Pilih minimal satu foto/video bukti pengerjaan!");
      return;
    }
    setEvidenceLoading(true);
    try {
      const report = reports.find(r => r.id === evidenceTargetId);
      const kategoriLaporan = report ? report.judul : "Bukti Pengerjaan Infrastruktur";

      // AI Validation for the first image only
      const firstImage = evidenceImages.find(file => file.type.startsWith("image/"));
      if (firstImage) {
        try {
          const base64 = await compressImageToBase64(firstImage, 800, 800, 0.7);
          const aiCheck = await api.post("/ai/validate-photo", { 
            imageBase64: base64,
            kategoriLaporan: "Bukti penanganan untuk masalah: " + kategoriLaporan
          });
          if (aiCheck.data && aiCheck.data.isValid === false) {
             alert(`⚠️ Sistem Cerdas Sipentar mendeteksi bahwa foto bukti tidak relevan dengan penanganan untuk kategori laporan "${kategoriLaporan}". Silakan unggah foto bukti pengerjaan yang valid.`);
             setEvidenceLoading(false);
             return;
          }
        } catch (err) {
          console.warn("AI Validation failed, proceeding anyway", err);
        }
      }

      const formData = new FormData();
      formData.append("status", evidenceTargetStatus);
      evidenceImages.forEach(file => {
          formData.append("admin_media", file);
      });

      await api.put(`/laporan/${evidenceTargetId}/status`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchReports();
      setShowEvidenceModal(false);
      setEvidenceImages([]);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file");
      setEvidenceLoading(false);
    }
  };

  const handleDeleteLaporan = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini beserta semua riwayatnya?")) {
        try {
            await api.delete(`/laporan/${id}`);
            alert("Laporan berhasil dihapus.");
            fetchReports();
        } catch (err) {
            alert("Gagal menghapus laporan.");
        }
    }
  };

  const fetchHistory = async (reportId) => {
    setHistoryTargetId(reportId);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/laporan/${reportId}/history`);
      setHistoryData(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat riwayat laporan.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const pendingReports = reports.filter(r => r.status === 'Menunggu');
  const completedReportsCount = reports.filter(r => r.status === 'Selesai').length;

  return (
    <DashboardLayout
      role={role}
      name={name}
      userProfileData={userProfileData}
      activeMainTab={activeMainTab}
      setActiveMainTab={setActiveMainTab}
      unreadCount={unreadCount}
      showNotifications={showNotifications}
      toggleNotifications={toggleNotifications}
      notifications={notifications}
      handleNotificationClick={handleNotificationClick}
      logout={logout}
      pendingReportsCount={pendingReports.length}
    >
      {/* Modals for Evidence & History (kept mostly same, tweaked colors to neutral/blue) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }} title="Tutup (Esc)">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={selectedImage} alt="Bukti Laporan" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default bg-slate-800" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Upload Bukti {evidenceTargetStatus}</h3>
              <button onClick={() => { setShowEvidenceModal(false); setEvidenceImages([]); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 font-medium">Anda diwajibkan menyertakan foto progres penanganan.</p>
              <div className="relative group/upload mt-1 mb-6">
                <div className={`absolute inset-0 border-2 border-dashed rounded-xl transition-colors duration-300 pointer-events-none ${evidenceImages.length > 0 ? 'border-sipentar-blue' : 'border-slate-300 group-hover/upload:border-sipentar-blue/50'}`}></div>
                <div className={`relative p-6 rounded-xl transition-all duration-300 ${evidenceImages.length > 0 ? 'bg-blue-50/50' : 'bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center'}`}>
                  {evidenceImages.length === 0 ? (
                    <>
                      <div className="w-12 h-12 mb-3 rounded-full bg-white text-slate-400 shadow-sm border border-slate-200 flex items-center justify-center group-hover/upload:text-sipentar-blue group-hover/upload:border-blue-200 transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1 text-center"><span className="text-sipentar-blue cursor-pointer hover:underline">Pilih Foto</span></p>
                      <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/jpeg,image/png,image/webp" onChange={(e) => setEvidenceImages(Array.from(e.target.files))} />
                    </>
                  ) : (
                    <div className="w-full z-10 relative">
                        <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/jpeg,image/png,image/webp" onChange={(e) => setEvidenceImages(Array.from(e.target.files))} />
                        <div className="flex overflow-x-auto gap-4 pb-2">
                        {evidencePreviewUrls.map((url, i) => (
                            <div key={i} className="relative inline-block shrink-0">
                                <div className="w-32 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative z-30">
                                    {evidenceImages[i].type.startsWith("video/") ? (
                                      <video src={url} className="w-full h-full object-cover" muted playsInline />
                                    ) : (
                                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowEvidenceModal(false); setEvidenceImages([]); }} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50" disabled={evidenceLoading}>Batal</button>
                <button onClick={handleConfirmEvidence} disabled={evidenceLoading || evidenceImages.length === 0} className="px-4 py-2 text-sm font-bold text-white bg-sipentar-blue hover:bg-sipentar-blue-dark rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                  {evidenceLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Riwayat Laporan</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sipentar-blue"></div></div>
              ) : historyData.length === 0 ? (
                <p className="text-center text-slate-500 py-4 font-medium">Belum ada riwayat tercatat.</p>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
                  {historyData.map((h) => (
                    <div key={h.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${h.status === 'Menunggu' ? 'bg-amber-400' : h.status === 'Diproses' ? 'bg-blue-400' : 'bg-green-500'}`}></div>
                      <p className="text-xs font-bold text-slate-400 mb-1">{new Date(h.created_at).toLocaleString('id-ID')}</p>
                      <p className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2.5 inline-block shadow-sm">
                        Status diperbarui menjadi <span className={h.status === 'Selesai' ? 'text-green-600' : h.status === 'Diproses' ? 'text-blue-600' : 'text-amber-600'}>{h.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {activeMainTab === 'beranda' && (
          <div className="space-y-6 md:space-y-8">
            
            <div className="md:hidden">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Utama</h2>
               <p className="text-slate-500 font-medium text-sm">Pemantauan data administrasi desa.</p>
            </div>

            {/* Metrik Analitik Utama */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              
              {/* Total Populasi (Mock data for now since we don't have this API yet) */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V4H2v16h5m10 0v-4H7v4m10 0H7m0 0H2m5 0h10M9 8h6v4H9V8z" /></svg>
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-800">{stats.totalWarga}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Data Warga (Total Populasi)</p>
                 </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-800">{reports.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Laporan</p>
                 </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-800">{pendingReports.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Laporan Menunggu</p>
                 </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-800">{completedReportsCount}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Layanan Selesai</p>
                 </div>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6">
              
              {/* Laporan Pelayanan Terkini (Table view on Desktop, List on Mobile) */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Laporan Pelayanan Terkini</h3>
                    <button onClick={() => setActiveMainTab('aduan_masuk')} className="text-sm font-bold text-sipentar-blue hover:text-sipentar-blue-dark">Lihat Semua</button>
                 </div>
                 
                 {/* Desktop Table View */}
                 <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                           <th className="p-4 pl-6">ID / Tanggal</th>
                           <th className="p-4">Pelapor</th>
                           <th className="p-4">Judul Layanan</th>
                           <th className="p-4 text-center">Status</th>
                           <th className="p-4 pr-6 text-right">Aksi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 text-sm">
                         {reports.slice(0, 5).map(r => (
                           <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="p-4 pl-6 font-medium text-slate-500">
                               <span className="block text-slate-800 font-bold">#{r.id.toString().padStart(4, '0')}</span>
                               <span className="text-xs">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                             </td>
                             <td className="p-4 font-bold text-slate-800">{r.name}</td>
                             <td className="p-4 text-slate-600">
                               <p className="font-medium max-w-[200px] truncate text-slate-800">{r.judul}</p>
                               {(r.image_url || (r.media_urls && r.media_urls.length > 0) || (r.admin_evidence_urls && (Array.isArray(r.admin_evidence_urls) ? r.admin_evidence_urls.length > 0 : true))) && (
                                 <div className="flex gap-1.5 mt-2">
                                    {renderMedia(r.media_urls, r.image_url, 'border-slate-200')}
                                    {renderMedia(r.admin_evidence_urls, null, 'border-green-200')}
                                 </div>
                               )}
                             </td>
                             <td className="p-4 text-center">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${r.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                 {r.status}
                               </span>
                             </td>
                             <td className="p-4 pr-6 text-right">
                               <button onClick={() => { setActiveMainTab('aduan_masuk'); }} className="text-sipentar-blue font-bold text-xs hover:underline">Kelola</button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                    {reports.length === 0 && <div className="p-8 text-center text-slate-500 text-sm font-medium">Belum ada laporan masuk.</div>}
                 </div>

                 {/* Mobile List View (Urgent flags) */}
                 <div className="md:hidden divide-y divide-slate-50 p-4">
                    {reports.slice(0, 4).map(r => (
                       <div key={r.id} className="py-4">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                               <p className="font-bold text-slate-900 text-sm">{r.judul}</p>
                               <p className="text-xs text-slate-500 font-medium mt-0.5">Pelapor: <span className="text-slate-700 font-bold">{r.name}</span></p>
                               {(r.image_url || (r.media_urls && r.media_urls.length > 0) || (r.admin_evidence_urls && (Array.isArray(r.admin_evidence_urls) ? r.admin_evidence_urls.length > 0 : true))) && (
                                 <div className="flex gap-2 mt-2">
                                    {renderMedia(r.media_urls, r.image_url, 'border-slate-200')}
                                    {renderMedia(r.admin_evidence_urls, null, 'border-green-200')}
                                 </div>
                               )}
                             </div>
                             {r.status === 'Menunggu' && (
                                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-200 shrink-0">Butuh Aksi</span>
                             )}
                          </div>
                          <button onClick={() => { setActiveMainTab('aduan_masuk'); }} className="mt-2 text-xs font-bold text-sipentar-blue bg-blue-50 px-3 py-1.5 rounded w-full text-center">Lihat Detail</button>
                       </div>
                    ))}
                 </div>
              </div>


            </div>
          </div>
        )}

        {/* Laporan Tab (Antrean Aduan Masuk) */}
        {activeMainTab === 'aduan_masuk' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Laporan</h2>
                <p className="text-slate-500 font-medium mt-1 text-sm">Tinjau dan proses laporan yang masuk dari warga desa.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
               {reports.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-1">Kotak Masuk Kosong</h4>
                    <p className="text-slate-500 text-sm max-w-sm">Tidak ada pelaporan warga baru yang menunggu untuk diproses saat ini.</p>
                  </div>
               ) : (
                  reports.map((r) => (
                    <div key={r.id} id={`report-${r.id}`} className="bg-white border border-slate-100 p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Tanggal & Pelapor */}
                      <div className="flex flex-col shrink-0 sm:w-48 sm:border-r border-slate-100 pr-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pelapor</p>
                        <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Tanggal Laporan'}
                        </p>
                      </div>

                      {/* Konten Aduan */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                           <h4 className="font-bold text-base text-slate-900">{r.judul}</h4>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${r.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                             {r.status}
                           </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm mb-4">{r.isi}</p>

                        <div className="flex flex-wrap gap-4 mt-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          {(r.image_url || (r.media_urls && r.media_urls.length > 0)) && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Lampiran Warga
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {renderMedia(r.media_urls, r.image_url, 'border-slate-200')}
                              </div>
                            </div>
                          )}
                          {r.admin_evidence_urls && (Array.isArray(r.admin_evidence_urls) ? r.admin_evidence_urls.length > 0 : true) && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Bukti Penanganan
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {renderMedia(r.admin_evidence_urls, null, 'border-green-200')}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status & Kendali Admin Bottom Bar */}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
                              <button onClick={() => fetchHistory(r.id)} className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors w-full sm:w-auto justify-center">
                                Riwayat
                              </button>
                              <div className="relative shrink-0 w-full sm:w-auto">
                                <select
                                    value={r.status}
                                    onChange={(e) => handleStatusSelect(r.id, e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-2 outline-none cursor-pointer block w-full pl-3 pr-8 py-2 focus:ring-sipentar-blue/20 focus:border-sipentar-blue shadow-sm"
                                >
                                    <option value="Menunggu">Tertunda</option>
                                    <option value="Diproses">Diproses</option>
                                    <option value="Selesai">Tuntas</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteLaporan(r.id)} className="px-3 py-2 bg-white text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 w-full justify-center border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
                                Hapus
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))
               )}
            </div>
          </div>
        )}

        {activeMainTab === 'kelola_warga' && role === 'admin' && (
          <KelolaWarga />
        )}

        {activeMainTab === 'profil' && (
          <Profile isEmbedded={true} />
        )}
      </div>

      <AIChatWidget />
    </DashboardLayout>
  );
}

export default AdminDashboard;