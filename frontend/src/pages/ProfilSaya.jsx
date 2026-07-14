import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

export default function ProfilSaya() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .get('/user')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('amdal_user', JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error('Gagal memuat profil:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('amdal_token');
          localStorage.removeItem('amdal_user');
          navigate('/sign-in');
        } else {
          setError('Gagal memuat data profil. Coba muat ulang halaman.');
          const raw = localStorage.getItem('amdal_user');
          if (raw) {
            try {
              setUser(JSON.parse(raw));
            } catch {
              // ignore
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('amdal_token');
      localStorage.removeItem('amdal_user');
      navigate('/sign-in');
    }
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loading) {
    return (
      <DashboardLayout title="Pengaturan Akun">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          Memuat profil...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan Akun" subtitle="Kelola informasi akun dan keamanan Anda.">
      <div className="w-full max-w-2xl">
        {error && (
          <div className="flex items-start gap-2 bg-error-container text-on-error-container text-sm rounded-xl p-3 mb-5">
            <span className="material-symbols-outlined text-base leading-none mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {!user ? (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-10 text-center">
            <p className="text-[#5B6660] text-sm">Data profil tidak tersedia.</p>
          </div>
        ) : (
          <>
            {/* Kartu identitas */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8 mb-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E5E3B] to-[#1C3822] text-white flex items-center justify-center font-semibold text-2xl shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-[#1F2A22] leading-tight truncate">{user.name}</p>
                  <p className="text-sm text-[#5B6660] truncate mb-2">{user.email}</p>
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-[#2E5E3B] bg-[#2E5E3B]/10 px-2.5 py-1 rounded-full">
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail akun */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8 mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Informasi Akun</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5B6660]">
                    Nama Lengkap
                  </label>
                  <div className="relative mt-1.5">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6660]/60 text-lg">
                      person
                    </span>
                    <p className="text-sm text-[#1F2A22] border border-black/10 rounded-xl pl-10 pr-4 py-3 bg-[#F5F4EF]">
                      {user.name}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5B6660]">Email</label>
                  <div className="relative mt-1.5">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6660]/60 text-lg">
                      mail
                    </span>
                    <p className="text-sm text-[#1F2A22] border border-black/10 rounded-xl pl-10 pr-4 py-3 bg-[#F5F4EF]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keamanan / sesi */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Sesi & Keamanan</h2>
              <p className="text-sm text-[#5B6660] mb-4">
                Keluar dari akun ini di perangkat yang sedang Anda gunakan.
              </p>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="border border-[#B3261E]/40 text-[#B3261E] py-3 px-6 rounded-full font-label-md hover:bg-[#B3261E]/10 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loggingOut && (
                  <span className="w-4 h-4 border-2 border-[#B3261E]/30 border-t-[#B3261E] rounded-full animate-spin" />
                )}
                <span className="material-symbols-outlined text-lg">logout</span>
                {loggingOut ? 'Keluar...' : 'Logout'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}