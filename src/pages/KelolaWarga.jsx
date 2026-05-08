import { useState, useEffect } from "react";
import api from "../services/api";

function KelolaWarga() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      // Filter out admins so we only see 'user' role
      const wargaList = res.data.filter(u => u.role === "user");
      setUsers(wargaList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      await api.put(`/auth/verify/${id}`, { is_verified: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert("Gagal merubah status verifikasi warga.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Verifikasi & Pengelolaan Warga</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Daftar warga yang teregistrasi. Lakukan verifikasi untuk mengizinkan mereka mengirim laporan.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          <span className="font-bold text-sm text-amber-800">Total: {users.length} Warga</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500 tracking-wider">
              <th className="px-4 py-3 sm:px-6 sm:py-4">Informasi Warga</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">NIK</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Kontak</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-center">Status Verifikasi</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-500">Memuat Data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-500">Belum ada warga terdaftar.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sipentar-green-100 text-sipentar-green-dark flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                        <p className="font-medium text-slate-500 text-xs">{user.jenis_kelamin || 'Tidak ada data'} • Terdaftar: {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-sm text-slate-600">{user.nik}</td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-slate-600">
                    <p>{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.no_hp || '-'}</p>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                    {user.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sipentar-green-50 text-sipentar-green-dark border border-emerald-200 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50"></span>
                        Menunggu
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-sipentar-blue/10 text-sipentar-blue hover:bg-sipentar-blue hover:text-white"
                      >
                        Lihat Detail
                      </button>
                      <button
                        onClick={() => handleVerify(user.id, user.is_verified)}
                        className={`inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${user.is_verified ? 'bg-white border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' : 'bg-sipentar-green text-white shadow-sm shadow-emerald-600/30 hover:bg-sipentar-green-dark'}`}
                      >
                        {user.is_verified ? 'Cabut Verifikasi' : 'Verifikasi Sekarang'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Detail Data Warga</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-sipentar-blue/10 text-sipentar-blue flex items-center justify-center font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-900">{selectedUser.name}</h4>
                  <p className="text-sm font-medium text-slate-500">NIK: <span className="font-mono text-slate-700">{selectedUser.nik}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Kependudukan</p>
                  <p className="text-sm font-semibold text-slate-800">RT {selectedUser.rt} / RW {selectedUser.rw}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pekerjaan</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedUser.pekerjaan || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tempat, Tanggal Lahir</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedUser.tempat_lahir || '-'}, {selectedUser.tanggal_lahir ? new Date(selectedUser.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jenis Kelamin</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedUser.jenis_kelamin || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agama</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedUser.agama || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kontak</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedUser.email}</p>
                  <p className="text-sm font-semibold text-slate-600">{selectedUser.no_hp || '-'}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-colors">Tutup</button>
              <button
                onClick={() => { handleVerify(selectedUser.id, selectedUser.is_verified); setSelectedUser(null); }}
                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-all ${selectedUser.is_verified ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' : 'bg-sipentar-green text-white hover:bg-sipentar-green-dark'}`}
              >
                {selectedUser.is_verified ? 'Cabut Verifikasi' : 'Verifikasi Warga Ini'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaWarga;
