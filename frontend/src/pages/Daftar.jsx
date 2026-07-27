import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

/* ── Password rules ─────────────────────────────────────────────── */
const getPwRules = (t) => [
  { key: 'length', label: t('auth.password_rules.length'), test: (v) => v.length >= 8 },
  { key: 'letter', label: t('auth.password_rules.letter'), test: (v) => /[a-zA-Z]/.test(v) },
  { key: 'number', label: t('auth.password_rules.number'), test: (v) => /[0-9]/.test(v) },
];

/* ── Shared input class ─────────────────────────────────────────── */
const INPUT_CLS =
  'w-full mt-1.5 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] transition-colors bg-white';

export default function Daftar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ── Form data ─────────────────────────────────────────────────── */
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Helpers ───────────────────────────────────────────────────── */
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  /* ── Validation ─────────────────────────────────────────────────── */
  const canSubmit = () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError(t('auth.all_fields_required'));
      return false;
    }
    if (form.password.length < 8) {
      setError(t('auth.password_min_length'));
      return false;
    }
    if (form.password !== form.password_confirmation) {
      setError(t('auth.password_confirmation_mismatch'));
      return false;
    }
    return true;
  };

  /* ── Submit ────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Arahkan ke halaman verifikasi email
      navigate('/verifikasi-email', { 
        state: { 
          email: form.email
        } 
      });
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

  /* ════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                        */
  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex">
      {/* ── Panel kiri — brand ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-gradient-to-br from-[#0369A1] via-[#0EA5E9] to-[#0284C7] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="wave-layer wave-layer-back"
            viewBox="0 0 1200 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <g opacity="0.12" stroke="#BAE6FD" strokeWidth="1.5">
              <path d="M0,140 Q75,110 150,140 T300,140 T450,140 T600,140 T750,140 T900,140 T1050,140 T1200,140" />
              <path d="M0,360 Q75,330 150,360 T300,360 T450,360 T600,360 T750,360 T900,360 T1050,360 T1200,360" />
              <path d="M0,580 Q75,550 150,580 T300,580 T450,580 T600,580 T750,580 T900,580 T1050,580 T1200,580" />
              <path d="M0,800 Q75,770 150,800 T300,800 T450,800 T600,800 T750,800 T900,800 T1050,800 T1200,800" />
            </g>
          </svg>

          <svg
            className="wave-layer wave-layer-mid"
            viewBox="0 0 1200 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <g opacity="0.16" stroke="#BAE6FD" strokeWidth="1.5">
              <path d="M0,220 Q75,175 150,220 T300,220 T450,220 T600,220 T750,220 T900,220 T1050,220 T1200,220" />
              <path d="M0,440 Q75,395 150,440 T300,440 T450,440 T600,440 T750,440 T900,440 T1050,440 T1200,440" />
              <path d="M0,660 Q75,615 150,660 T300,660 T450,660 T600,660 T750,660 T900,660 T1050,660 T1200,660" />
            </g>
          </svg>

          <svg
            className="wave-layer wave-layer-front"
            viewBox="0 0 1200 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <g opacity="0.20" stroke="#E0F2FE" strokeWidth="1.5">
              <path d="M0,300 Q75,265 150,300 T300,300 T450,300 T600,300 T750,300 T900,300 T1050,300 T1200,300" />
              <path d="M0,520 Q75,485 150,520 T300,520 T450,520 T600,520 T750,520 T900,520 T1050,520 T1200,520" />
              <path d="M0,740 Q75,705 150,740 T300,740 T450,740 T600,740 T750,740 T900,740 T1050,740 T1200,740" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="font-headline-md text-2xl font-bold tracking-tight">
            TenagaAhli<span className="text-[#7DD3FC]">.com</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-headline-lg text-4xl font-bold leading-tight">
              Promosikan <br />Keahlian Anda
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
             Bergabunglah bersama tenaga ahli dari berbagai bidang dan tampilkan profil profesional Anda agar lebih mudah ditemukan oleh instansi, perusahaan, dan mitra yang membutuhkan keahlian Anda.
            </p>
            <ul className="space-y-3">
              {[
                'Pendaftaran gratis dan mudah',
                'Profil Anda akan terverifikasi oleh tim kami',
                'Dapatkan kesempatan proyek dari seluruh Indonesia',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <span className="material-symbols-outlined text-[#7DD3FC] text-[18px] mt-0.5">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/50 text-xs">© 2026 TenagaAhli.com — System Dynamics Center</p>
        </div>

        <style>{`
          .wave-layer {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 200%;
          }
          @keyframes wave-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .wave-layer-back {
            animation: wave-scroll 26s linear infinite;
          }
          .wave-layer-mid {
            animation: wave-scroll 18s linear infinite;
          }
          .wave-layer-front {
            animation: wave-scroll 12s linear infinite reverse;
          }
          @media (prefers-reduced-motion: reduce) {
            .wave-layer { animation: none; }
          }
        `}</style>
      </div>

      {/* ── Panel kanan — form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Topbar mobile */}
        <div className="lg:hidden pt-6 pb-2 text-center">
          <Link to="/" className="font-headline-md text-xl font-bold text-[#0284C7]">
            TenagaAhli.com
          </Link>
        </div>

        {/* Content area (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            {error && (
              <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                {error}
              </p>
            )}

            {/* Form Pendaftaran Sederhana */}
            <div className="animate-fadeIn">
              <div className="mb-8 text-center">
                <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-2">
                  {t('auth.register_title')}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {t('auth.register_subtitle', 'Daftar sebagai tenaga ahli profesional di TenagaAhli.com')}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {t('auth.full_name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Masukkan nama lengkap Anda"
                      value={form.name}
                      onChange={handleChange('name')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {t('auth.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {t('auth.password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="Minimal 8 karakter"
                        value={form.password}
                        onChange={handleChange('password')}
                        className="w-full border border-outline-variant/50 rounded-lg px-4 py-2.5 pr-11 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] transition-colors bg-white"
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
                        {getPwRules(t).map((req) => {
                          const passed = req.test(form.password);
                          return (
                            <li
                              key={req.key}
                              className={`flex items-center gap-1 text-xs ${
                                passed ? 'text-[#0284C7]' : 'text-on-surface-variant/50'
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

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {t('auth.confirm_password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang kata sandi"
                      value={form.password_confirmation}
                      onChange={handleChange('password_confirmation')}
                      className={INPUT_CLS}
                    />
                    {form.password_confirmation.length > 0 &&
                      form.password !== form.password_confirmation && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {t('auth.password_mismatch')}
                        </p>
                      )}
                    {form.password_confirmation.length > 0 &&
                      form.password === form.password_confirmation && (
                        <p className="text-xs text-[#0284C7] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          {t('auth.password_match')}
                        </p>
                      )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#0EA5E9] text-white py-3 px-6 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        {t('auth.register_button')}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Link ke sign in */}
              <p className="text-center text-sm text-on-surface-variant mt-6">
                {t('auth.have_account')}{' '}
                <Link to="/sign-in" className="text-[#0284C7] font-bold hover:underline">
                  {t('auth.login_here')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
