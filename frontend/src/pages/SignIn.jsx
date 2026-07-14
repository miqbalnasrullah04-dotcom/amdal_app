import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client.js';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('amdal_token', res.data.token);
      localStorage.setItem('amdal_user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        const firstError = errors ? Object.values(errors)[0]?.[0] : null;
        setError(firstError || err.response?.data?.message || 'Data tidak valid.');
      } else if (err.response?.status === 401) {
        setError('Email atau kata sandi salah.');
      } else if (err.response?.status === 502 || err.response?.status === 504) {
        setError('Server sedang bermasalah. Coba beberapa saat lagi.');
      } else if (!err.response) {
        setError('Tidak bisa terhubung ke server.');
      } else {
        setError(err.response?.data?.message || 'Email atau kata sandi salah.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel kiri — brand */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-gradient-to-br from-[#1B3B26] to-[#2E5E3B] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.18]"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path d="M-50 200 Q150 100 300 220 T650 180" stroke="#D8F3DC" strokeWidth="1.5" />
          <path d="M-50 320 Q150 220 300 340 T650 300" stroke="#D8F3DC" strokeWidth="1.5" />
          <path d="M-50 440 Q150 340 300 460 T650 420" stroke="#D8F3DC" strokeWidth="1.5" />
          <path d="M-50 560 Q150 460 300 580 T650 540" stroke="#D8F3DC" strokeWidth="1.5" />
          <path d="M-50 680 Q150 580 300 700 T650 660" stroke="#D8F3DC" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="font-headline-md text-2xl font-bold tracking-tight">
            AMDAL<span className="text-[#94D4B1]">.ID</span>
          </Link>

          <div>
            <h1 className="font-headline-lg text-4xl font-bold leading-tight mb-4">
              Direktori tenaga ahli<br />lingkungan Indonesia.
            </h1>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              Terhubung dengan jaringan tenaga ahli AMDAL yang tersertifikasi,
              terverifikasi, dan siap berkolaborasi di seluruh Indonesia.
            </p>
          </div>

          <p className="text-white/50 text-xs">© 2026 AMDAL.ID — System Dynamics Center</p>
        </div>
      </div>

      {/* Panel kanan — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="font-headline-md text-xl font-bold text-[#2E5E3B]">
              AMDAL.ID
            </Link>
          </div>

          <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">Selamat datang kembali</h2>
          <p className="text-sm text-on-surface-variant mb-8">Masuk untuk mengelola profil tenaga ahli Anda.</p>

          {justRegistered && !error && (
            <p className="bg-[#E3F2E7] text-[#1B3B26] text-sm rounded-lg px-4 py-3 mb-5">
              Pendaftaran berhasil. Silakan masuk dengan akun Anda.
            </p>
          )}

          {error && (
            <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-5">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1.5 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kata Sandi</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-outline-variant/50 rounded-lg px-4 py-2.5 pr-11 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#2E5E3B] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#244B2F] active:scale-[0.99] transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 border border-outline-variant/50 text-on-surface-variant py-3 rounded-lg text-sm font-semibold hover:bg-surface-container-low hover:text-on-background transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali
            </Link>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-[#2E5E3B] font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}