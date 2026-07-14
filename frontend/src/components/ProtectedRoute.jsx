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

  if (!token || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }

  return children;
}