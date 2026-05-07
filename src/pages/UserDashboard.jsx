import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Laporan from "./Laporan";
import Profile from "./Profile";
import AIChatWidget from "../components/AIChatWidget";
import DashboardLayout from "../layouts/DashboardLayout";

function UserDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("beranda");
  const notifRef = useRef(null);
  const [userProfileData, setUserProfileData] = useState(null);
  
  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTargetId, setHistoryTargetId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

    const intervalId = setInterval(fetchNotifications, 10000);
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
      setActiveMainTab('histori');
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

  const userReports = reports.filter(r => r.name === name);
  const pendingCount = userReports.filter(r => r.status === 'Menunggu').length;
  const processCount = userReports.filter(r => r.status === 'Diproses').length;
  const completedCount = userReports.filter(r => r.status === 'Selesai').length;
  const activeReports = userReports.filter(r => r.status === 'Diproses' || r.status === 'Selesai');

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
      pendingReportsCount={0}
    >
      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              title="Tutup (Esc)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img
              src={selectedImage}
              alt="Bukti Laporan (Diperbesar)"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default border border-white/20 bg-slate-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Linimasa Aktivitas</h3>
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
                      <p className="text-xs font-bold text-slate-400 mb-1 tracking-wide">{new Date(h.created_at).toLocaleString('id-ID')}</p>
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
            {/* Mobile Banner (Hidden on Desktop) */}
            <div className="md:hidden bg-sipentar-blue text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z"/></svg>
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2">Halo, {name.split(' ')[0]}!</h2>
                 <p className="text-sm text-blue-100 mb-6 font-medium">Ada layanan yang bisa kami bantu hari ini?</p>
                 <button onClick={() => setActiveMainTab('pengaduan')} className="bg-white text-sipentar-blue px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm inline-flex items-center gap-2">
                   Buat Laporan Baru
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 </button>
               </div>
            </div>

            {/* Desktop Overview & Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-6">
               
               {/* Stats & Recent */}
               <div className="space-y-6">
                  {/* Status Overview Cards (Ringkasan Laporan) */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-4 hidden md:block">Ringkasan Layanan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      
                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                         <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div>
                            <p className="text-2xl font-black text-slate-800">{pendingCount}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Laporan Tertunda</p>
                         </div>
                      </div>

                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                         <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </div>
                         <div>
                            <p className="text-2xl font-black text-slate-800">{processCount}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Laporan Diproses</p>
                         </div>
                      </div>

                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
                         <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div>
                            <p className="text-2xl font-black text-slate-800">{completedCount}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Layanan Selesai</p>
                         </div>
                      </div>

                    </div>
                  </div>

                  {/* Aktivitas Terakhir (Riwayat Aktivitas) diganti menjadi Laporan Dalam Proses/Selesai */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                     <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-base font-bold text-slate-900">Laporan Diproses & Selesai</h3>
                        <button onClick={() => setActiveMainTab('histori')} className="text-sm font-bold text-sipentar-blue hover:text-sipentar-blue-dark">Semua Laporan</button>
                     </div>
                     <div className="p-0">
                       {activeReports.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm font-medium">Belum ada laporan yang diproses atau selesai.</div>
                       ) : (
                         <div className="divide-y divide-slate-50">
                           {activeReports.map(r => (
                              <div key={r.id} className="p-6 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fetchHistory(r.id)}>
                                <div>
                                   <p className="text-sm font-bold text-slate-900 mb-1">{r.judul}</p>
                                   <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{r.isi}</p>
                                   <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-wide">
                                     {new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                   </p>
                                </div>
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${r.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                  {r.status}
                                </span>
                              </div>
                           ))}
                         </div>
                       )}
                     </div>
                  </div>
               </div>


            </div>
          </div>
        )}

        {/* Laporan Tab (Semua Laporan Saya) */}
        {activeMainTab === 'histori' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daftar Laporan Saya</h2>
                <p className="text-slate-500 font-medium mt-1 text-sm">Semua catatan pelaporan yang pernah Anda ajukan ke sistem.</p>
              </div>
              <button onClick={() => setActiveMainTab('pengaduan')} className="hidden sm:flex px-4 py-2 bg-sipentar-blue text-white rounded-lg text-sm font-bold shadow-sm items-center gap-2">
                Buat Baru
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
               {userReports.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-1">Belum Ada Catatan</h4>
                    <p className="text-slate-500 text-sm max-w-sm">Anda belum pernah membuat laporan. Laporan yang Anda buat akan muncul di sini.</p>
                  </div>
               ) : (
                  userReports.map(r => (
                    <div key={r.id} id={`report-${r.id}`} className="bg-white border border-slate-100 p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                           <h4 className="font-bold text-lg text-slate-900">{r.judul}</h4>
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${r.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                             {r.status}
                           </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm mb-4">{r.isi}</p>
                        <div className="flex flex-wrap gap-3 items-center mt-4">
                          {r.image_url && (
                            <button onClick={() => setSelectedImage(r.image_url.startsWith('data:image') ? r.image_url : `${IMAGE_BASE_URL}/uploads/${r.image_url}`)} className="inline-flex items-center gap-1.5 text-xs font-bold text-sipentar-blue hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Lampiran Saya
                            </button>
                          )}
                          {r.admin_evidence_urls && (Array.isArray(r.admin_evidence_urls) ? r.admin_evidence_urls.length > 0 : true) && (
                            <button onClick={() => { const urls = Array.isArray(r.admin_evidence_urls) ? r.admin_evidence_urls : [r.admin_evidence_urls]; setSelectedImage(urls[0].startsWith('data:image') ? urls[0] : `${IMAGE_BASE_URL}/uploads/${urls[0]}`); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 transition-colors bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Bukti Penanganan
                            </button>
                          )}
                          <button onClick={() => fetchHistory(r.id)} className="inline-flex items-center gap-1.5 ml-auto text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Riwayat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
               )}
            </div>
          </div>
        )}

        {activeMainTab === 'pengaduan' && role === 'user' && (
          <div className="max-w-3xl mx-auto">
            <Laporan onReportAdded={() => { fetchReports(); setActiveMainTab('histori'); }} />
          </div>
        )}

        {activeMainTab === 'profil' && (
          <Profile isEmbedded={true} />
        )}
      </div>

      <AIChatWidget />
    </DashboardLayout>
  );
}

export default UserDashboard;