import { useTranslation } from '../context/LanguageContext.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

const INPUT = 'w-full rounded-lg border border-outline-variant/40 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/20 focus:border-[#2E5E3B] transition-colors';

function Label({ children }) {
  return <span className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1">{children}</span>;
}
function Card({ children }) {
  return <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">{children}</div>;
}
function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#2E5E3B] uppercase tracking-wider border-b border-black/5 pb-3 mb-5">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </h3>
  );
}

export default function Pengaturan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    api.get('/user')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('amdal_user', JSON.stringify(res.data));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('amdal_token');
          localStorage.removeItem('amdal_user');
          navigate('/sign-in');
        } else {
          const raw = localStorage.getItem('amdal_user');
          if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.post('/logout'); } catch {}
    finally {
      localStorage.removeItem('amdal_token');
      localStorage.removeItem('amdal_user');
      navigate('/sign-in');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('Konfirmasi kata sandi tidak cocok.'); return; }
    if (newPw.length < 8)    { setPwError('Kata sandi baru minimal 8 karakter.'); return; }
    setPwSaving(true);
    try {
      const res = await api.put('/user/change-password', {
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      setPwSuccess(res.data?.message || 'Kata sandi berhasil diubah.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = (user?.name || '?')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  if (loading) {
    return (
      <DashboardLayout title="Pengaturan">
        <div className="flex items-center gap-3 text-[#5B6660]">
          <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
          {t('Memuat pengaturan...')}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan" subtitle="Keamanan akun dan sesi login Anda.">
      <div className="w-full max-w-2xl space-y-6">

        <Card>
          <SectionTitle icon="manage_accounts">Informasi Akun</SectionTitle>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2E5E3B] to-[#1C3822] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1F2A22] text-base leading-tight truncate">{user?.name}</p>
              <p className="text-sm text-[#5B6660] truncate mb-2">{user?.email}</p>
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-[#2E5E3B] bg-[#2E5E3B]/10 px-2.5 py-1 rounded-full">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon="lock_reset">Ubah Kata Sandi</SectionTitle>
          {pwError && (
            <div className="flex items-start gap-2 bg-[#FFDAD6] text-[#93000A] text-sm rounded-xl p-3 mb-4">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">error</span>
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-start gap-2 bg-[#E3F2E7] text-[#2E5E3B] text-sm rounded-xl p-3 mb-4">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">check_circle</span>
              {pwSuccess}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Kata Sandi Lama *</Label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className={INPUT + ' pr-10'} placeholder="••••••••" />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6660] hover:text-[#2E5E3B]">
                  <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <Label>Kata Sandi Baru * (min. 8 karakter)</Label>
              <input type={showPw ? 'text' : 'password'} required minLength={8} value={newPw}
                onChange={(e) => setNewPw(e.target.value)} className={INPUT} placeholder="••••••••" />
            </div>
            <div>
              <Label>Konfirmasi Kata Sandi Baru *</Label>
              <input type={showPw ? 'text' : 'password'} required minLength={8} value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)} className={INPUT} placeholder="••••••••" />
              {confirmPw.length > 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${newPw === confirmPw ? 'text-[#2E5E3B]' : 'text-[#B3261E]'}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {newPw === confirmPw ? 'check_circle' : 'error'}
                  </span>
                  {newPw === confirmPw ? 'Kata sandi cocok' : 'Kata sandi tidak cocok'}
                </p>
              )}
            </div>
            <button type="submit" disabled={pwSaving}
              className="bg-[#2E5E3B] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#244B2F] disabled:opacity-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">{pwSaving ? 'sync' : 'lock_reset'}</span>
              {pwSaving ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
            </button>
          </form>
        </Card>

        <Card>
          <SectionTitle icon="security">Sesi & Keamanan</SectionTitle>
          <p className="text-sm text-[#5B6660] mb-4">
            Keluar dari akun ini di perangkat yang sedang Anda gunakan. Semua sesi aktif akan dihapus.
          </p>
          <button onClick={handleLogout} disabled={loggingOut}
            className="border-2 border-[#B3261E]/40 text-[#B3261E] py-2.5 px-6 rounded-xl font-bold text-sm hover:bg-[#B3261E]/10 disabled:opacity-50 transition-all flex items-center gap-2">
            {loggingOut
              ? <span className="w-4 h-4 border-2 border-[#B3261E]/30 border-t-[#B3261E] rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[18px]">logout</span>}
            {loggingOut ? 'Keluar...' : 'Logout dari Akun Ini'}
          </button>
        </Card>

      </div>
    </DashboardLayout>
  );
}
