import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { compressImageToBase64 } from "../utils/imageUtils";

// Generate a unique idempotency key per submission attempt
function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function Laporan({ onReportAdded }) {
  const [jenisLaporan, setJenisLaporan] = useState("Jalan Rusak");
  const [rt, setRt] = useState("01");
  const [rw, setRw] = useState("01");
  const [isi, setIsi] = useState("");
  const [media, setMedia] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown timer in seconds
  const isSubmittingRef = useRef(false); // Prevent double-click race condition
  const cooldownTimerRef = useRef(null);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    if (media.length > 0) {
      const urls = media.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setPreviewUrls([]);
    }
  }, [media]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startCooldown = (seconds = 30) => {
    setCooldown(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRemoveMedia = (index) => {
      setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: prevent double-click submissions
    if (isSubmittingRef.current || loading || cooldown > 0) return;
    isSubmittingRef.current = true;
    setLoading(true);

    // Generate a unique idempotency key for this submission
    const idempotencyKey = generateIdempotencyKey();

    const formData = new FormData();
    formData.append("judul", jenisLaporan);
    formData.append("isi", `Lokasi: RT ${rt} / RW ${rw}\n\nKronologi:\n${isi}`);

    if (media.length > 0) {
      // AI Validation only for the first image
      const firstImage = media.find(file => file.type.startsWith("image/"));
      if (firstImage) {
        const base64Image = await compressImageToBase64(firstImage, 800, 800, 0.7);
        try {
          const aiCheck = await api.post("/ai/validate-photo", { 
              imageBase64: base64Image,
              kategoriLaporan: jenisLaporan
          });
          if (aiCheck.data && aiCheck.data.isValid === false) {
              alert(`⚠️ Sistem Cerdas Sipentar mendeteksi bahwa foto ini tidak relevan dengan kategori laporan "${jenisLaporan}". Silakan unggah foto kejadian yang sebenarnya sesuai pilihan Anda.`);
              setLoading(false);
              isSubmittingRef.current = false;
              return;
          }
        } catch (err) {
          console.warn("AI Validation failed, proceeding anyway", err);
        }
      }

      media.forEach(file => {
          formData.append("media", file);
      });
    }

    try {
      await api.post("/laporan", formData, {
        headers: { 
            'X-Idempotency-Key': idempotencyKey,
            'Content-Type': 'multipart/form-data'
        }
      });
      alert("Laporan berhasil dikirim 🔥");
      setJenisLaporan("Jalan Rusak");
      setRt("01");
      setRw("01");
      setIsi("");
      setMedia([]);
      // Start cooldown to prevent rapid re-submission
      startCooldown(30);
      if (onReportAdded) onReportAdded();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error;
      if (status === 409) {
        alert("⚠️ " + (message || "Laporan serupa sudah pernah dikirimkan. Silakan cek daftar laporan Anda."));
      } else if (status === 429) {
        alert("⏳ " + (message || "Harap tunggu beberapa menit sebelum mengirim laporan serupa."));
        startCooldown(60); // Longer cooldown on rate-limit
      } else {
        alert(message || "Gagal kirim laporan");
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 relative z-10">
        <div className="w-14 h-14 shrink-0 rounded-xl bg-blue-50 text-sipentar-blue flex items-center justify-center border border-blue-200">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2-2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ajukan Pelaporan Baru</h3>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">Sampaikan rincian kejadian beserta lokasi dan bukti foto/video autentik.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 pl-1 tracking-wide uppercase">Jenis Laporan</label>
          <select
            value={jenisLaporan}
            onChange={(e) => setJenisLaporan(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sipentar-blue/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
          >
            <option value="Jalan Rusak">Jalan Rusak</option>
            <option value="Lampu Jalan Mati">Lampu Jalan Mati</option>
            <option value="Sampah Tidak Diangkut">Sampah Tidak Diangkut</option>
            <option value="Saluran Air Tersumbat">Saluran Air Tersumbat</option>
            <option value="Fasilitas Umum Rusak">Fasilitas Umum Rusak</option>
            <option value="Lainnya">Lainnya...</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-2 pl-1 tracking-wide uppercase">Lokasi RT</label>
            <select
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sipentar-blue/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
            >
              {[...Array(27)].map((_, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val}>RT {val}</option>
              })}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-2 pl-1 tracking-wide uppercase">Lokasi RW</label>
            <select
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sipentar-blue/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
            >
              {[...Array(9)].map((_, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val}>RW {val}</option>
              })}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 pl-1 tracking-wide uppercase">Rincian Kronologi</label>
          <textarea
            placeholder="Jelaskan secara mendetail mengenai kejadian yang Anda lihat atau alami..."
            rows="4"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sipentar-blue/30 focus:border-blue-500 focus:bg-white outline-none transition-all resize-y text-slate-900 font-medium leading-relaxed placeholder-slate-400"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 pl-1 tracking-wide uppercase">Unggah Lampiran (Opsional)</label>
          <div className="relative group/upload mt-1">
            <div className={`absolute inset-0 border-2 border-dashed rounded-xl transition-colors duration-300 pointer-events-none ${media.length > 0 ? 'border-blue-500' : 'border-slate-300 group-hover/upload:border-blue-400'}`}></div>

            <div className={`relative flex flex-col items-center justify-center px-6 py-8 rounded-xl transition-all duration-300 overflow-hidden ${media.length > 0 ? 'bg-blue-50' : 'bg-slate-50 hover:bg-slate-100'}`}>

              {media.length === 0 ? (
                <>
                  <div className="w-14 h-14 mb-3 rounded-full bg-white text-slate-400 shadow-sm border border-slate-200 flex items-center justify-center group-hover/upload:text-sipentar-blue group-hover/upload:border-blue-200 transition-all duration-300 transform">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-center z-10 w-full max-w-sm">
                    <p className="text-sm font-bold text-slate-700 mb-1 transition-colors">
                      <span className="text-sipentar-blue cursor-pointer group-hover/upload:underline">Pilih Foto/Video</span> atau seret ke sini
                    </p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mt-1">Bisa lebih dari 1 file (JPG, PNG, WEBP, MP4, WEBM)</p>
                  </div>
                  <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg" onChange={(e) => setMedia(Array.from(e.target.files))} />
                </>
              ) : (
                <div className="w-full z-10 flex flex-col items-center">
                  <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg" onChange={(e) => setMedia(Array.from(e.target.files))} />
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-4 relative z-30">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative inline-block group/preview">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 transition-colors">
                          {media[i].type.startsWith("video/") ? (
                            <video src={url} className="w-full h-full object-cover" muted playsInline />
                          ) : (
                            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover transform group-hover/preview:scale-105 transition-transform duration-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleRemoveMedia(i); }}
                          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 transition-all border border-slate-200"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200 transition-colors">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{media.length} File Terpilih</p>
                    <p className="text-[10px] font-bold text-sipentar-blue mt-0.5 uppercase tracking-widest">Klik area ini untuk mengganti</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-5 border-t border-slate-200 transition-colors">
          {cooldown > 0 && (
            <p className="text-xs font-bold text-slate-500 order-2 sm:order-1">
              <svg className="w-4 h-4 inline mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Dapat mengirim lagi dalam <span className="text-sipentar-blue">{cooldown}s</span>
            </p>
          )}
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full sm:w-auto px-8 py-3 bg-sipentar-blue hover:bg-sipentar-blue-dark text-white font-bold tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses Laporan...
              </>
            ) : cooldown > 0 ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Tunggu {cooldown}s...
              </>
            ) : (
              <>
                Kirim Laporan Resmi
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Laporan;