import React, { useEffect, useRef, useState } from 'react';

const DashboardLayout = ({
  children,
  role,
  name,
  userProfileData,
  activeMainTab,
  setActiveMainTab,
  unreadCount,
  showNotifications,
  toggleNotifications,
  notifications,
  handleNotificationClick,
  logout,
  pendingReportsCount
}) => {
  const notifRef = useRef(null);
  const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/api\/?$/, "");

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (showNotifications) toggleNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, toggleNotifications]);

  const menuItems = role === 'admin' ? [
    { id: 'beranda', label: 'Dashboard Utama', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'aduan_masuk', label: 'Laporan Masuk', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', badge: pendingReportsCount },
    { id: 'kelola_warga', label: 'Kelola Warga', icon: 'M17 20h5V4H2v16h5m10 0v-4H7v4m10 0H7m0 0H2m5 0h10M9 8h6v4H9V8z' },
    { id: 'profil', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ] : [
    { id: 'beranda', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'histori', label: 'Laporan', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profil', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  // Map mobile bottom nav differently based on role
  const mobileMenuItems = role === 'admin' ? [
    { id: 'beranda', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'aduan_masuk', label: 'Laporan', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', badge: pendingReportsCount },
    { id: 'kelola_warga', label: 'Warga', icon: 'M17 20h5V4H2v16h5m10 0v-4H7v4m10 0H7m0 0H2m5 0h10M9 8h6v4H9V8z' },
    { id: 'profil', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ] : [
    { id: 'beranda', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'pengaduan', label: 'Laporan', icon: 'M11 5H6a2 2 0 00-2-2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'histori', label: 'Status', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profil', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR DESKTOP - Clean Minimalist Panel */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-20 shrink-0">
        
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100 shrink-0">
          <img src="/logosipentar.png" alt="Logo Sipentar" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
          <div>
            <h1 className="font-outfit text-xl font-black text-slate-900 tracking-tight leading-none">SIPENTAR<span className="text-sipentar-blue">.</span></h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 px-3">Menu Utama</div>
          {menuItems.map((item) => {
            const isActive = activeMainTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMainTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group ${
                  isActive 
                    ? 'bg-sipentar-blue text-white font-bold shadow-sm shadow-sipentar-blue/20' 
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sipentar-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2.5" : "2"} d={item.icon} />
                </svg>
                <span className="text-sm tracking-wide">{item.label}</span>
                
                {item.badge > 0 && (
                  <span className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? 'bg-white text-sipentar-blue' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* HEADER TOP - Clean & Spacious */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 z-30 shrink-0">
          
          {/* Mobile Logo Only */}
          <div className="md:hidden flex items-center gap-3">
            <img src="/logosipentar.png" alt="Logo Sipentar" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
            <h1 className="font-outfit text-lg font-black text-slate-900 tracking-tight leading-none">SIPENTAR.</h1>
          </div>

          {/* Desktop Title & Welcome */}
          <div className="hidden md:flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selamat Datang Kembali</p>
            <h2 className="text-lg font-bold text-slate-900">{name || "Pengguna"}</h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Functional-looking Search Bar */}
            <div className="hidden md:flex relative">
              <input type="text" placeholder="Cari layanan, laporan..." className="w-72 pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sipentar-blue focus:ring-2 focus:ring-sipentar-blue/20 transition-all outline-none" />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2.5 rounded-lg text-slate-500 hover:text-sipentar-blue hover:bg-sipentar-blue/5 transition-colors focus:outline-none border border-slate-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Notifikasi</h3>
                    {unreadCount > 0 && <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-sipentar-blue">{unreadCount} Baru</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 flex flex-col items-center text-center">
                        <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kosong</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                          <li key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-sipentar-blue/5' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-sipentar-blue' : 'bg-transparent'}`}></div>
                              <div>
                                <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">
                                  {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown or Avatar */}
            <div className="hidden md:block relative group">
              <button className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors">
                {userProfileData?.foto_profil ? (
                  <img src={(userProfileData.foto_profil.startsWith('data:image') || userProfileData.foto_profil.startsWith('http')) ? userProfileData.foto_profil : `${BASE_URL}${userProfileData.foto_profil.startsWith('/') ? '' : '/'}${userProfileData.foto_profil}`} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-sipentar-blue text-white">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <button onClick={() => setActiveMainTab('profil')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sipentar-blue rounded-lg font-medium transition-colors">Profil Saya</button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                     Keluar Sistem
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto relative p-4 md:p-8 pb-24 md:pb-8 scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION MOBILE - Modern Floating style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 pb-safe px-2">
          {mobileMenuItems.map((item) => {
            const isActive = activeMainTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveMainTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-sipentar-blue' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <div className="relative p-1">
                  <svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "0" : "2"} d={item.icon} />
                  </svg>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;
