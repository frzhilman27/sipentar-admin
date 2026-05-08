import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";

// Lazy-loaded pages
const Login = lazy(() => import("../pages/Login"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Portal Admin...</p>
    </div>
  </div>
);

function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Pages */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* 404 — Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRouter;
