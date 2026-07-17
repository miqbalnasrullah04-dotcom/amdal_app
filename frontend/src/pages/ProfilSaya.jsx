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

  // Ubah Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      });
      setPasswordSuccess(res.data.message || 'Password berhasil diubah.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setPasswordSaving(false);
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
      <DashboardLayout title="Pengaturan">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          Memuat pengaturan...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan" subtitle="Kelola pengaturan keamanan akun dan sesi Anda.">
      <div className="w-full max-w-2xl space-y-6">
        {error && (
          <div className="flex items-start gap-2 bg-error-container text-on-error-container text-sm rounded-xl p-3">
            <span className="material-symbols-outlined text-base leading-none mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {!user ? (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-10 text-center">
            <p className="text-[#5B6660] text-sm">Data pengaturan tidak tersedia.</p>
          </div>
        ) : (
          <>
            {/* Kartu identitas */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8">
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

            {/* Ubah Password */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8">
              <h3 className="text-sm font-bold text-[#2E5E3B] border-b border-black/5 pb-2 mb-4">Ubah Kata Sandi</h3>
              
              {passwordError && <p className="bg-[#FFDAD6] text-[#93000A] text-xs rounded-lg p-3 mb-4">{passwordError}</p>}
              {passwordSuccess && <p className="bg-[#E3F2E7] text-[#2E5E3B] text-xs rounded-lg p-3 font-semibold mb-4">{passwordSuccess}</p>}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#414844]/70 block">Kata Sandi Lama *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full mt-1.5 border border-[#2E5E3B]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#414844]/70 block">Kata Sandi Baru *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1.5 border border-[#2E5E3B]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#414844]/70 block">Konfirmasi Kata Sandi Baru *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPasswordConfirmation}
                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                    className="w-full mt-1.5 border border-[#2E5E3B]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-[#2E5E3B] text-white py-2.5 px-6 rounded-xl text-sm font-bold hover:bg-[#244B2F] disabled:opacity-60 transition-colors"
                >
                  {passwordSaving ? 'Menyimpan...' : 'Perbarui Password'}
                </button>
              </form>
            </div>

            {/* Keamanan / sesi */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8">
              <h3 className="text-sm font-bold text-[#2E5E3B] border-b border-black/5 pb-2 mb-4">Sesi & Keamanan</h3>
              <p className="text-sm text-[#5B6660] mb-4">
                Keluar dari akun ini di perangkat yang sedang Anda gunakan.
              </p>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="border border-[#B3261E]/40 text-[#B3261E] py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#B3261E]/10 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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