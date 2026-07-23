import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('amdal_token');
  const userRaw = localStorage.getItem('amdal_user');

  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (err) {
    console.error('Gagal parse amdal_user dari localStorage:', err);
    user = null;
  }

  // Tidak ada token atau user -> redirect ke login
  if (!token || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Ada requiredRole tapi role user tidak sesuai -> redirect ke dashboard masing-masing
  if (requiredRole && user.role !== requiredRole) {
    // Admin mencoba akses halaman user -> redirect ke /admin
    // User mencoba akses halaman admin -> redirect ke /dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}