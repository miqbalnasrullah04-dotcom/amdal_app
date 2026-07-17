import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client.js';

export default function MenungguVerifikasi() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [rejectReason, setRejectReason] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Ambil email: prioritas dari state navigasi (baru daftar),
  // fallback ke localStorage (kalau halaman di-refresh).
  useEffect(() => {
    const emailFromState = location.state?.email;

    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('amdal_pending_email', emailFromState);
      return;
    }

    const savedEmail = localStorage.getItem('amdal_pending_email');
    if (!savedEmail) {
      // Tidak ada data pendaftaran yang menunggu, kembalikan ke halaman daftar
      navigate('/daftar');
      return;
    }
    setEmail(savedEmail);
  }, [location.state, navigate]);

  const handleCekStatus = async () => {
    if (!email) return;
    setChecking(true);
    setError('');
    try {
      const res = await api.get('/register/status', { params: { email } });
      const data = res.data;

      if (data.status === 'approved') {
        setStatus('approved');
        localStorage.removeItem('amdal_pending_email');
      } else if (data.status === 'rejected') {
        setStatus('rejected');
        setRejectReason(data.reason || '');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      console.error('Cek status error:', err);
      if (!err.response) {
        setError('Tidak bisa terhubung ke server.');
      } else {
        setError(err.response?.data?.message || 'Gagal memeriksa status. Coba lagi nanti.');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleDaftarUlang = () => {
    localStorage.removeItem('amdal_pending_email');
    navigate('/daftar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="font-headline-md text-xl font-bold text-[#0284C7] block mb-10">
          TenagaAhli<span className="text-[#7DD3FC]">.com</span>
        </Link>

        {status === 'pending' && (
          <div className="animate-fadeIn">
            <div className="w-24 h-24 bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-[#0284C7]">hourglass_top</span>
            </div>
            <h1 className="text-2xl font-bold text-on-background mb-2">Menunggu Verifikasi Admin</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-1">
              Pendaftaran Anda dengan email
            </p>
            <p className="text-sm font-bold text-[#0284C7] mb-4">{email}</p>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
              sedang ditinjau oleh tim TenagaAhli.com. Proses verifikasi biasanya memakan waktu 1–3 hari kerja.
              Kami akan mengirimkan email pemberitahuan setelah akun Anda disetujui.
            </p>

            {error && (
              <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-5 text-left flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleCekStatus}
              disabled={checking}
              className="w-full bg-[#0EA5E9] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
            >
              {checking ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Cek Status
                </>
              )}
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 border border-outline-variant/50 text-on-surface-variant py-3 rounded-lg text-sm font-semibold hover:bg-surface-container-low hover:text-on-background transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {status === 'approved' && (
          <div className="animate-fadeIn">
            <div className="w-24 h-24 bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-[#0284C7]">how_to_reg</span>
            </div>
            <h1 className="text-2xl font-bold text-on-background mb-2">Akun Anda Disetujui!</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
              Selamat, pendaftaran Anda telah diverifikasi oleh admin. Sekarang Anda sudah bisa masuk ke akun Anda.
            </p>
            <Link
              to="/sign-in"
              className="w-full inline-block bg-[#0EA5E9] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}

        {status === 'rejected' && (
          <div className="animate-fadeIn">
            <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-on-error-container">cancel</span>
            </div>
            <h1 className="text-2xl font-bold text-on-background mb-2">Pendaftaran Ditolak</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
              Mohon maaf, pendaftaran Anda belum dapat kami setujui.
            </p>
            {rejectReason && (
              <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-6 text-left">
                <strong>Alasan:</strong> {rejectReason}
              </p>
            )}
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
              Silakan perbaiki data Anda dan lakukan pendaftaran ulang.
            </p>
            <button
              type="button"
              onClick={handleDaftarUlang}
              className="w-full bg-[#0EA5E9] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all"
            >
              Daftar Ulang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}