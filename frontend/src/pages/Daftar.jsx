import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const requirements = [
  { key: 'length', label: 'Minimal 8 karakter', test: (v) => v.length >= 8 },
  { key: 'letter', label: 'Mengandung huruf', test: (v) => /[a-zA-Z]/.test(v) },
  { key: 'number', label: 'Mengandung angka', test: (v) => /[0-9]/.test(v) },
];

export default function Daftar() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'password') {
      setForm({ ...form, password: value, password_confirmation: value });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/register', form);
      navigate('/sign-in', { state: { registered: true } });
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        const firstError = errors ? Object.values(errors)[0]?.[0] : null;
        setError(firstError || err.response?.data?.message || 'Data tidak valid.');
      } else if (err.response?.status === 502 || err.response?.status === 504) {
        setError('Server sedang bermasalah. Coba beberapa saat lagi.');
      } else if (!err.response) {
        setError('Tidak bisa terhubung ke server.');
      } else {
        setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
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

          <div className="space-y-6">
            <h1 className="font-headline-lg text-4xl font-bold leading-tight">
              Daftarkan keahlian<br />Anda, jangkau lebih<br />banyak proyek.
            </h1>
            <ul className="space-y-3">
              {[
                'Tayang di direktori pencarian nasional',
                'Profil lengkap: pendidikan, pengalaman, sertifikat',
                'Verifikasi resmi dari tim AMDAL.ID',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <span className="material-symbols-outlined text-[#94D4B1] text-[18px] mt-0.5">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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

          <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">Daftar</h2>
          <p className="text-sm text-on-surface-variant mb-8">
            Mulai proses pendaftaran sebagai tenaga ahli terverifikasi.
          </p>

          {error && (
            <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-5">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Sesuai identitas resmi"
                value={form.name}
                onChange={handleChange('name')}
                className="w-full mt-1.5 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange('email')}
                className="w-full mt-1.5 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kata Sandi</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange('password')}
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

              {form.password.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {requirements.map((req) => {
                    const passed = req.test(form.password);
                    return (
                      <li
                        key={req.key}
                        className={`flex items-center gap-1 text-xs ${
                          passed ? 'text-[#2E5E3B]' : 'text-on-surface-variant/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {passed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#2E5E3B] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#244B2F] active:scale-[0.99] transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Memproses...' : 'Daftar'}
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
            Sudah punya akun?{' '}
            <Link to="/sign-in" className="text-[#2E5E3B] font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}