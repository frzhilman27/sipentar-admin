import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useDarkMode from "../hooks/useDarkMode";

// Reusable Intersection Observer hook for scroll animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold: 0.1 });

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [domRef, isVisible];
}

// Section Wrapper Component for consistent animations
const AnimatedSection = ({ children, className, delay = "" }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className} ${delay}`}
    >
      {children}
    </div>
  );
};


function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [activeFaq, setActiveFaq] = useState(null);

  // Handle scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    { q: "Bagaimana cara membuat laporan di Sipentar?", a: "Anda dapat membuat laporan dengan mendaftar akun terlebih dahulu, lalu masuk ke Dasbor Warga. Klik menu 'Buat Laporan', isi formulir yang tersedia beserta bukti foto, dan klik kirim." },
    { q: "Berapa lama laporan saya akan diproses?", a: "Laporan akan diverifikasi oleh admin desa maksimal 1x24 jam kerja. Anda dapat memantau status laporan Anda (Menunggu, Diproses, Selesai) langsung dari Dasbor Warga." },
    { q: "Apakah data pribadi saya aman?", a: "Sangat aman. Kami menggunakan enkripsi data tingkat tinggi dan protokol keamanan standar pemerintah untuk memastikan privasi identitas dan laporan Anda terjaga." },
    { q: "Layanan administrasi apa saja yang tersedia?", a: "Saat ini Sipentar melayani pembuatan Surat Keterangan Domisili, Pengantar SKCK, Surat Keterangan Usaha, dan Pelaporan Infrastruktur Desa." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative overflow-x-hidden">

      {/* 1. SOLID NAVBAR WITH GLASSMORPHISM */}
      <div className={`fixed w-full z-50 top-0 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logosipentar.png" alt="Logo Sipentar" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm bg-white" />
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tight leading-none transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white drop-shadow-md'}`}>
                  SIPENTAR<span className="text-sipentar-blue">.</span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors duration-300 ${isScrolled ? 'text-slate-500' : 'text-slate-200 drop-shadow-sm'}`}>Portal Layanan Publik</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#layanan" className={`text-sm font-bold transition-colors duration-300 hover:text-sipentar-blue ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm'}`}>Layanan</a>
              <a href="#statistik" className={`text-sm font-bold transition-colors duration-300 hover:text-sipentar-blue ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm'}`}>Statistik</a>
              <a href="#alur" className={`text-sm font-bold transition-colors duration-300 hover:text-sipentar-blue ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm'}`}>Cara Kerja</a>
              <a href="#kontak" className={`text-sm font-bold transition-colors duration-300 hover:text-sipentar-blue ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm'}`}>Kontak</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className={`text-sm font-bold transition-colors duration-300 hover:text-sipentar-blue ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm'}`}>
                Masuk
              </Link>
              <Link to="/register" className="text-sm font-bold text-white bg-sipentar-blue hover:bg-sipentar-blue-dark px-6 py-2.5 rounded-lg transition-colors shadow-sm">
                Mulai Sekarang
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                className={`p-2 rounded-lg transition-colors focus:outline-none ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/20'}`}
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
          <div className="px-4 py-6 flex flex-col gap-4">
            <a href="#layanan" className="text-slate-700 font-bold text-base hover:text-sipentar-blue transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Layanan</a>
            <a href="#statistik" className="text-slate-700 font-bold text-base hover:text-sipentar-blue transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Statistik</a>
            <a href="#alur" className="text-slate-700 font-bold text-base hover:text-sipentar-blue transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Cara Kerja</a>
            <a href="#kontak" className="text-slate-700 font-bold text-base hover:text-sipentar-blue transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Kontak</a>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" className="text-sipentar-blue-dark font-bold text-base text-center border border-blue-200 bg-sipentar-blue-50 py-3 rounded-lg hover:bg-sipentar-blue-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Masuk Ke Akun</Link>
            <Link to="/register" className="text-center bg-sipentar-blue text-white font-bold text-base py-3 rounded-lg hover:bg-sipentar-blue-dark transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Mulai Sekarang</Link>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION - Immersive Gradient */}
      <section id="beranda" className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat pt-20" style={{ backgroundImage: "url('/rice_field_bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 backdrop-blur-[2px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center mt-10 animate-fade-up">
          
          <div className="animate-float">
            <img src="/logosipentar.png" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-2xl rounded-2xl border-2 border-white/20 bg-white" />
          </div>
          
          <h1 className="hidden md:block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Masa Depan Tata Kelola <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sipentar-blue-light drop-shadow-md">Pemerintahan Desa.</span>
          </h1>

          <h1 className="md:hidden text-4xl font-black text-white tracking-tight leading-tight mb-6">
            Tata Kelola Desa Berbasis <span className="text-blue-400 drop-shadow-md">Data & Transparansi.</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-10 leading-relaxed max-w-2xl font-medium drop-shadow-sm">
            Platform digital terintegrasi untuk pelayanan publik, visualisasi data, dan manajemen administrasi desa yang cepat, transparan, dan efisien.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 relative z-10">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-sipentar-blue hover:bg-sipentar-blue-dark text-white text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-sipentar-blue/30 border border-transparent hover:border-blue-400 hover:-translate-y-1">
                <span className="hidden md:inline">Buat Akun Sekarang</span>
                <span className="md:hidden">Buat Laporan Baru</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1">
                Akses Dasbor Warga
              </button>
            </Link>
          </div>

          {/* Floating Stats on Hero (Desktop) */}
          <div className="hidden lg:flex absolute top-1/4 -right-32 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl animate-float" style={{animationDelay: '1s'}}>
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-bold text-xl">100%</p>
                <p className="text-slate-300 text-xs font-medium">Layanan Digital</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex absolute bottom-1/4 -left-32 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl animate-float" style={{animationDelay: '2s'}}>
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-bold text-xl">2,500+</p>
                <p className="text-slate-300 text-xs font-medium">Warga Terdaftar</p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Curved bottom separator */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.26,200,107.5,242.47,100.28,283.47,80.1,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* 3. STATISTIK DESA */}
      <section id="statistik" className="py-16 bg-slate-50 relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Warga", value: "2,543", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { label: "Laporan Selesai", value: "1,208", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Layanan Aktif", value: "12", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
              { label: "RT/RW", value: "4/24", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-soft-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-sipentar-blue-50 text-sipentar-blue rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h4>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* 4. FITUR / LAYANAN */}
      <section id="layanan" className="py-20 sm:py-32 bg-white relative z-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatedSection className="mb-16 text-center max-w-3xl mx-auto">
            <span className="text-sipentar-blue font-bold tracking-wider uppercase text-sm mb-3 block">Modul Sistem</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Sistem Informasi Terpadu
            </h2>
            <p className="text-slate-600 text-lg font-medium">
              Akses berbagai layanan administrasi dan pelaporan dengan mudah, transparan, dan terintegrasi dalam satu platform cerdas.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay="delay-100">
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
                 <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-sipentar-blue mb-6 border border-slate-200 shadow-sm">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Administrasi Mandiri</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Pengajuan surat pengantar, keterangan domisili, dan dokumen administrasi lainnya langsung dari rumah tanpa perlu antri di balai desa.
                 </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay="delay-200">
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
                 <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-sipentar-blue mb-6 border border-slate-200 shadow-sm">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Pelaporan Infrastruktur</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Laporkan kerusakan jalan, fasilitas umum, atau masalah lingkungan dengan menyertakan bukti foto dan lokasi secara real-time.
                 </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay="delay-300">
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
                 <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-sipentar-blue mb-6 border border-slate-200 shadow-sm">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Transparansi Data</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Pantau status laporan Anda, lihat statistik penanganan desa, dan pastikan setiap keluhan ditindaklanjuti secara akuntabel.
                 </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 5. ALUR PELAYANAN */}
      <section id="alur" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/rice_field_bg.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-blue-400 font-bold tracking-wider uppercase text-sm mb-3 block">Cara Kerja</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              4 Langkah Mudah Menggunakan Sipentar
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Proses digital yang dirancang untuk memudahkan warga tanpa birokrasi berbelit.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Daftar Akun", desc: "Buat akun menggunakan NIK dan data diri valid.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { step: "02", title: "Pilih Layanan", desc: "Pilih jenis surat atau form pelaporan yang dibutuhkan.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { step: "03", title: "Isi Data", desc: "Lengkapi formulir dan unggah dokumen pendukung.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              { step: "04", title: "Pantau Status", desc: "Lacak progress persetujuan melalui Dasbor Anda.", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={`delay-[${idx * 150}ms]`}>
                <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                  <div className="text-5xl font-black text-slate-700/50 absolute top-4 right-4">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 relative z-10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 relative z-10">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BERITA & PENGUMUMAN */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <AnimatedSection>
              <span className="text-sipentar-blue font-bold tracking-wider uppercase text-sm mb-3 block">Informasi</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kabar Desa Terbaru</h2>
            </AnimatedSection>
            <AnimatedSection>
              <button className="hidden md:flex items-center gap-2 text-sipentar-blue font-bold hover:text-sipentar-blue-dark transition-colors">
                Lihat Semua Berita <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "Pengumuman", date: "12 Okt 2026", title: "Jadwal Pemeliharaan Server Sipentar & Layanan API", image: "/logosipentar.png" },
              { tag: "Kegiatan", date: "10 Okt 2026", title: "Kerja Bakti Rutin Perbaikan Saluran Air Desa", image: "/rice_field_bg.png" },
              { tag: "Pemberitahuan", date: "08 Okt 2026", title: "Batas Waktu Pengkinian Data Kartu Keluarga Baru", image: "/logosipentar.png" }
            ].map((news, idx) => (
              <AnimatedSection key={idx} delay={`delay-[${idx * 100}ms]`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft-sm hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col">
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-sipentar-blue shadow-sm">
                      {news.tag}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-xs font-medium text-slate-500 mb-2 block">{news.date}</span>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sipentar-blue transition-colors line-clamp-2">{news.title}</h3>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-sm font-bold text-sipentar-blue">
                      Baca Selengkapnya <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <button className="md:hidden mt-8 w-full py-3 flex items-center justify-center gap-2 text-sipentar-blue bg-sipentar-blue-50 rounded-lg font-bold hover:bg-sipentar-blue-100 transition-colors">
            Lihat Semua Berita
          </button>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Pertanyaan Umum</h2>
            <p className="text-slate-600 font-medium">Jawaban untuk pertanyaan yang sering diajukan warga terkait penggunaan Sipentar.</p>
          </AnimatedSection>

          <AnimatedSection className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* 8. FOOTER - Corporate Minimal */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800" id="kontak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
                  <img src="/logosipentar.png" alt="Logo Sipentar Footer" className="w-full h-full object-cover rounded-lg" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">SIPENTAR.</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                Pusat aduan dan layanan digital Pemerintah Desa. Mendukung tata kelola pemerintahan desa yang modern, transparan, dan akuntabel.
              </p>
              
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sipentar-blue transition-colors text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sipentar-blue transition-colors text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Sistem</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Portal Login</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Registrasi Penduduk</Link></li>
                <li><a href="#layanan" className="text-slate-400 hover:text-white transition-colors">Daftar Layanan</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">Bantuan / FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Kontak & Bantuan</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-400">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Kantor Balai Desa,<br/>Kecamatan, Kabupaten</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-sipentar-blue-light font-bold">admin@desa.id</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>(021) 1234-5678</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Pemerintah Desa. Seluruh Hak Cipta Dilindungi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat Ketentuan</a>
              <span className="pl-4 border-l border-slate-700">Sipentar Portal v3.5</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
        <div className="flex justify-around items-center h-16 pb-safe">
          <a href="#beranda" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-sipentar-blue">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
             <span className="text-[10px] font-bold tracking-wide">Beranda</span>
          </a>
          <Link to="/login" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-sipentar-blue transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
             <span className="text-[10px] font-bold tracking-wide">Laporan</span>
          </Link>
          <Link to="/register" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-sipentar-blue transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
             <span className="text-[10px] font-bold tracking-wide">Daftar</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Home;