import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-black text-slate-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-sipentar-blue/10 text-sipentar-blue rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan. Pastikan URL yang Anda masukkan sudah benar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-sipentar-blue text-white font-bold text-sm rounded-lg hover:bg-sipentar-blue-dark transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-white text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            Masuk ke Dasbor
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
