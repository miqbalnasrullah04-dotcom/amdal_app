import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import PhoneInput from '../components/PhoneInput.jsx';

/* ── Syarat‑Syarat Pendaftaran ──────────────────────────────────── */
const SYARAT_LIST = [
  'Memiliki pengalaman penelitian, kajian, atau publikasi yang sesuai dengan bidang keahlian yang didaftarkan (S1/S2/S3), dengan melampirkan bukti pendukung (opsional).',
  'Sedang melakukan penelitian, pengembangan, atau proyek profesional yang berkaitan dengan bidang keahlian yang didaftarkan, dengan melampirkan bukti pendukung.',
  'Pernah menjadi Tenaga Ahli, Konsultan, atau Tim Ahli pada instansi pemerintah, swasta, organisasi, maupun proyek tertentu, dengan melampirkan Surat Tugas, Surat Keputusan (SK), kontrak kerja, atau dokumen sejenis.',
  'Memiliki sertifikat kompetensi, pelatihan, workshop, atau sertifikasi profesi yang relevan dengan bidang keahlian yang didaftarkan.',
  'Pernah menjadi narasumber, pembicara, instruktur, mentor, atau fasilitator pada seminar, pelatihan, workshop, webinar, maupun kegiatan profesional lainnya yang sesuai dengan bidang keahlian, dengan melampirkan bukti pendukung.',
];

/* ── Password rules ─────────────────────────────────────────────── */
const PW_RULES = [
  { key: 'length', label: 'Minimal 8 karakter', test: (v) => v.length >= 8 },
  { key: 'letter', label: 'Mengandung huruf', test: (v) => /[a-zA-Z]/.test(v) },
  { key: 'number', label: 'Mengandung angka', test: (v) => /[0-9]/.test(v) },
];


/* ── Step Labels ────────────────────────────────────────────────── */
const STEP_LABELS = ['Syarat Pendaftaran', 'Data Akun', 'Data Pribadi', 'Upload Dokumen'];

/* ── Shared input class ─────────────────────────────────────────── */
const INPUT_CLS =
  'w-full mt-1.5 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] transition-colors bg-white';

export default function Daftar() {
  const navigate = useNavigate();

  /* ── Step state ────────────────────────────────────────────────── */
  const [step, setStep] = useState(0); // 0 = syarat, 1 = akun, 2 = pribadi, 3 = upload
  const [agreedTerms, setAgreedTerms] = useState(false);

  /* ── Form data ─────────────────────────────────────────────────── */
  const [form, setForm] = useState({
    // Step 1 — Akun
    email: '',
    password: '',
    password_confirmation: '',
    // Step 2 — Pribadi
    name: '',
    phone: '+62 ',
    institution: '',
    field: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat_kota: '',
    alamat_provinsi: '',
    pengalaman: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  /* ── Riwayat Pendidikan (dinamis) ──────────────────────────────── */
  const [educations, setEducations] = useState([
    { jenjang: '', institusi: '', jurusan: '', tahun_lulus: '' },
  ]);

  const addEducation = () =>
    setEducations([...educations, { jenjang: '', institusi: '', jurusan: '', tahun_lulus: '' }]);

  const removeEducation = (i) =>
    setEducations(educations.filter((_, idx) => idx !== i));

  const updateEducation = (i, field, value) =>
    setEducations(educations.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  /* ── File uploads (step 3) ─────────────────────────────────────── */
  const [cv, setCv] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [buktiKompetensi, setBuktiKompetensi] = useState(null);

  const cvRef = useRef(null);
  const fotoRef = useRef(null);
  const buktiRef = useRef(null);

  /* ── Status ────────────────────────────────────────────────────── */
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Helpers ───────────────────────────────────────────────────── */
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  /* ── Validation per step ───────────────────────────────────────── */
  const canProceed = () => {
    setError('');
    if (step === 0) return agreedTerms;
    if (step === 1) {
      if (!form.email || !form.password) {
        setError('Email dan kata sandi wajib diisi.');
        return false;
      }
      if (form.password.length < 8) {
        setError('Kata sandi minimal 8 karakter.');
        return false;
      }
      if (form.password !== form.password_confirmation) {
        setError('Konfirmasi kata sandi tidak sama.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.name || !form.institution || !form.field) {
        setError('Nama, Institusi, dan Bidang Keahlian wajib diisi.');
        return false;
      }
      if (!form.alamat_kota) {
        setError('Kota / Kabupaten wajib diisi.');
        return false;
      }
      const hasEdu = educations.some(e => e.jenjang && e.institusi);
      if (!hasEdu) {
        setError('Minimal satu riwayat pendidikan wajib diisi (Jenjang & Institusi).');
        return false;
      }
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (!form.phone || phoneDigits.length < 6) {
        setError('Nomor WhatsApp tidak valid. Minimal 6 digit.');
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (canProceed()) setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  };
  const goPrev = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  /* ── Submit ────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = new FormData();
      // Akun
      payload.append('email', form.email);
      payload.append('password', form.password);
      payload.append('password_confirmation', form.password_confirmation);
      // Pribadi
      payload.append('name', form.name);
      payload.append('phone', form.phone);
      payload.append('institution', form.institution);
      payload.append('field', form.field);
      payload.append('tempat_lahir', form.tempat_lahir);
      payload.append('tanggal_lahir', form.tanggal_lahir);
      payload.append('alamat_kota', form.alamat_kota);
      payload.append('alamat_provinsi', form.alamat_provinsi);
      payload.append('pengalaman', form.pengalaman);
      // Riwayat pendidikan — kirim sebagai JSON string
      const eduValid = educations.filter(e => e.jenjang && e.institusi);
      if (eduValid.length > 0) {
        payload.append('educations', JSON.stringify(eduValid));
      }
      // Files
      if (cv) payload.append('cv', cv);
      if (foto) payload.append('foto', foto);
      if (buktiKompetensi) payload.append('bukti_kompetensi', buktiKompetensi);

      await api.post('/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Alih-alih menampilkan layar sukses di halaman yang sama,
      // arahkan user ke halaman khusus "Menunggu Verifikasi" agar
      // status pendaftarannya jelas dan persisten.
      navigate('/menunggu-verifikasi', { state: { email: form.email } });
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
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.18]"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path d="M-50 200 Q150 100 300 220 T650 180" stroke="#BAE6FD" strokeWidth="1.5" />
          <path d="M-50 320 Q150 220 300 340 T650 300" stroke="#BAE6FD" strokeWidth="1.5" />
          <path d="M-50 440 Q150 340 300 460 T650 420" stroke="#BAE6FD" strokeWidth="1.5" />
          <path d="M-50 560 Q150 460 300 580 T650 540" stroke="#BAE6FD" strokeWidth="1.5" />
          <path d="M-50 680 Q150 580 300 700 T650 660" stroke="#BAE6FD" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="font-headline-md text-2xl font-bold tracking-tight">
            TenagaAhli<span className="text-[#7DD3FC]">.com</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-headline-lg text-4xl font-bold leading-tight">
              Promosikan<br />Keahlian Anda
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Tampilkan pengalaman dan kompetensi Anda kepada pihak yang membutuhkan tenaga ahli profesional.
            </p>
            <ul className="space-y-3">
              {[
                'Tayang di direktori pencarian nasional',
                'Profil lengkap: pendidikan, pengalaman, sertifikat',
                'Verifikasi resmi dari tim TenagaAhli.com',
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
      </div>

      {/* ── Panel kanan — form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Topbar mobile */}
        <div className="lg:hidden pt-6 pb-2 text-center">
          <Link to="/" className="font-headline-md text-xl font-bold text-[#0284C7]">
            TenagaAhli.com
          </Link>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-6 lg:pt-10 pb-4 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isActive
                          ? 'bg-[#0EA5E9] text-white scale-110'
                          : isDone
                            ? 'bg-[#0EA5E9] text-white'
                            : 'bg-[#0EA5E9]/10 text-[#0284C7]/50'
                        }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold text-center leading-tight w-16 sm:w-auto ${isActive ? 'text-[#0284C7]' : 'text-on-surface-variant/50'
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-colors ${isDone ? 'bg-[#0EA5E9]' : 'bg-[#0EA5E9]/10'
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content area (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          <div className="w-full max-w-xl mx-auto">
            {error && (
              <p className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                {error}
              </p>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* STEP 0 — Syarat Pendaftaran                               */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {step === 0 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">
                    Syarat Pendaftaran
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Pastikan Anda memenuhi semua persyaratan berikut sebelum mendaftar sebagai tenaga ahli.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-outline-variant/30 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#0EA5E9]">checklist</span>
                    <h3 className="font-bold text-sm text-on-background">Persyaratan Wajib</h3>
                  </div>
                  <ul className="space-y-3">
                    {SYARAT_LIST.map((syarat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-on-surface-variant group"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#0EA5E9] font-bold text-[10px] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{syarat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Info box */}
                <div className="bg-[#E0F2FE] border border-[#0EA5E9]/30 rounded-xl p-4 mb-6 flex gap-3">
                  <span className="material-symbols-outlined text-[#0284C7] text-[20px] shrink-0 mt-0.5">info</span>
                  <div className="text-sm text-[#075985] leading-relaxed">
                    <p className="font-semibold mb-1">Informasi Penting</p>
                    <p>Setelah mendaftar, data Anda akan diverifikasi oleh tim TenagaAhli.com. Proses verifikasi memerlukan waktu 1–3 hari kerja. Anda akan mendapat notifikasi email setelah akun disetujui atau jika ada perbaikan yang diperlukan.</p>
                  </div>
                </div>

                {/* Checkbox persetujuan */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-1 accent-[#0EA5E9] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-background transition-colors leading-relaxed">
                    Saya memahami dan menyatakan bahwa saya <strong>memenuhi semua persyaratan</strong> di atas serta bersedia
                    mengikuti proses verifikasi oleh tim TenagaAhli.com.
                  </span>
                </label>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* STEP 1 — Data Akun                                        */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">Data Akun</h2>
                  <p className="text-sm text-on-surface-variant">
                    Buat akun untuk masuk ke platform TenagaAhli.com.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Kata Sandi <span className="text-red-500">*</span>
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
                        {PW_RULES.map((req) => {
                          const passed = req.test(form.password);
                          return (
                            <li
                              key={req.key}
                              className={`flex items-center gap-1 text-xs ${passed ? 'text-[#0284C7]' : 'text-on-surface-variant/50'
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
                      Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang kata sandi"
                      value={form.password_confirmation}
                      onChange={handleChange('password_confirmation')}
                      className={INPUT_CLS}
                    />
                    {form.password_confirmation.length > 0 && form.password !== form.password_confirmation && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        Kata sandi tidak cocok
                      </p>
                    )}
                    {form.password_confirmation.length > 0 && form.password === form.password_confirmation && (
                      <p className="text-xs text-[#0284C7] mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Kata sandi cocok
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* STEP 2 — Data Pribadi                                     */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">Data Pribadi</h2>
                  <p className="text-sm text-on-surface-variant">
                    Lengkapi informasi pribadi dan profesional Anda.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sesuai identitas resmi"
                      value={form.name}
                      onChange={handleChange('name')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* No. HP */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      No. HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(val) => setForm({ ...form, phone: val })}
                      placeholder="81234567890"
                      required
                      className="mt-1.5"
                    />
                    <p className="text-xs text-on-surface-variant/60 mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">info</span>
                      Hanya angka, tanpa tanda hubung atau spasi
                    </p>
                  </div>

                  {/* Institusi */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Institusi / Perusahaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PSL - IPB University"
                      value={form.institution}
                      onChange={handleChange('institution')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Bidang Keahlian */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Bidang Keahlian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ahli Kehutanan & Tata Ruang"
                      value={form.field}
                      onChange={handleChange('field')}
                      className={INPUT_CLS}
                    />
                  </div>

                  {/* Tempat & Tanggal Lahir */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Tempat Lahir
                      </label>
                      <input type="text" placeholder="Jakarta" value={form.tempat_lahir}
                        onChange={handleChange('tempat_lahir')} className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Tanggal Lahir
                      </label>
                      <input type="date" value={form.tanggal_lahir}
                        onChange={handleChange('tanggal_lahir')} className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Kota & Provinsi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Kota / Kabupaten <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Kota Bogor" value={form.alamat_kota}
                        onChange={handleChange('alamat_kota')} className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Provinsi
                      </label>
                      <input type="text" placeholder="Jawa Barat" value={form.alamat_provinsi}
                        onChange={handleChange('alamat_provinsi')} className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Riwayat Pendidikan — dinamis */}
                  <div>
                    <div className="flex items-center justify-between mt-1 mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Riwayat Pendidikan
                      </label>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="flex items-center gap-1 text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Tambah
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {educations.map((edu, i) => (
                        <div key={i} className="bg-white border border-outline-variant/40 rounded-xl p-4 relative">
                          {educations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducation(i)}
                              className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                              aria-label="Hapus"
                            >
                              <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                            </button>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">Jenjang *</label>
                              <select
                                value={edu.jenjang}
                                onChange={(e) => updateEducation(i, 'jenjang', e.target.value)}
                                className={INPUT_CLS}
                              >
                                <option value="">Pilih Jenjang</option>
                                {['S1','S2','S3','Profesor','D3','D4','SMA/SMK'].map(j => (
                                  <option key={j} value={j}>{j}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">Institusi / Universitas *</label>
                              <input
                                type="text"
                                placeholder="IPB University"
                                value={edu.institusi}
                                onChange={(e) => updateEducation(i, 'institusi', e.target.value)}
                                className={INPUT_CLS}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">Jurusan / Program Studi</label>
                              <input
                                type="text"
                                placeholder="Ilmu Lingkungan"
                                value={edu.jurusan}
                                onChange={(e) => updateEducation(i, 'jurusan', e.target.value)}
                                className={INPUT_CLS}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">Tahun Lulus</label>
                              <input
                                type="number"
                                placeholder="2018"
                                min="1970"
                                max={new Date().getFullYear() + 1}
                                value={edu.tahun_lulus}
                                onChange={(e) => updateEducation(i, 'tahun_lulus', e.target.value)}
                                className={INPUT_CLS}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ringkasan Pengalaman */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Ringkasan Pengalaman
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Ceritakan secara singkat pengalaman profesional Anda sebagai tenaga ahli, konsultan, narasumber, atau peneliti..."
                      value={form.pengalaman}
                      onChange={handleChange('pengalaman')}
                      className={INPUT_CLS + ' min-h-[100px] resize-none'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* STEP 3 — Upload Dokumen                                   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="font-headline-md text-2xl font-bold text-on-background mb-1">Upload Dokumen</h2>
                  <p className="text-sm text-on-surface-variant">
                    Unggah dokumen pendukung untuk verifikasi profil Anda.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Upload CV */}
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[#0EA5E9]">description</span>
                      <div>
                        <h3 className="text-sm font-bold text-on-background">Curriculum Vitae (CV)</h3>
                        <p className="text-xs text-on-surface-variant">Format PDF, maksimal 5MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      ref={cvRef}
                      className="hidden"
                      onChange={(e) => setCv(e.target.files?.[0] || null)}
                    />
                    {cv ? (
                      <div className="flex items-center justify-between bg-[#E0F2FE] rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-[#0284C7] min-w-0">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span className="truncate">{cv.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setCv(null); cvRef.current.value = ''; }}
                          className="text-xs text-red-500 hover:underline shrink-0 ml-2"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cvRef.current?.click()}
                        className="w-full border-2 border-dashed border-outline-variant/40 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0EA5E9]/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#0EA5E9]">upload_file</span>
                        <span className="text-sm text-on-surface-variant">Klik untuk unggah CV</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Pas Foto */}
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[#0EA5E9]">photo_camera</span>
                      <div>
                        <h3 className="text-sm font-bold text-on-background">Pas Foto Formal</h3>
                        <p className="text-xs text-on-surface-variant">Format JPG/PNG, maksimal 2MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fotoRef}
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                    {foto ? (
                      <div className="flex items-center gap-4 bg-[#E0F2FE] rounded-lg px-4 py-3">
                        {fotoPreview && (
                          <img
                            src={fotoPreview}
                            alt="Preview foto"
                            className="w-14 h-14 rounded-lg object-cover border border-[#0EA5E9]/20"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0284C7] truncate">{foto.name}</p>
                          <button
                            type="button"
                            onClick={() => { setFoto(null); setFotoPreview(null); fotoRef.current.value = ''; }}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fotoRef.current?.click()}
                        className="w-full border-2 border-dashed border-outline-variant/40 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0EA5E9]/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#0EA5E9]">add_photo_alternate</span>
                        <span className="text-sm text-on-surface-variant">Klik untuk unggah pas foto</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Bukti Kompetensi */}
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[#0EA5E9]">workspace_premium</span>
                      <div>
                        <h3 className="text-sm font-bold text-on-background">Bukti Kompetensi</h3>
                        <p className="text-xs text-on-surface-variant">Sertifikat, ijazah, atau dokumen pendukung (PDF/JPG/PNG, maks 5MB)</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      ref={buktiRef}
                      className="hidden"
                      onChange={(e) => setBuktiKompetensi(e.target.files?.[0] || null)}
                    />
                    {buktiKompetensi ? (
                      <div className="flex items-center justify-between bg-[#E0F2FE] rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-[#0284C7] min-w-0">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span className="truncate">{buktiKompetensi.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setBuktiKompetensi(null); buktiRef.current.value = ''; }}
                          className="text-xs text-red-500 hover:underline shrink-0 ml-2"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => buktiRef.current?.click()}
                        className="w-full border-2 border-dashed border-outline-variant/40 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0EA5E9]/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#0EA5E9]">verified</span>
                        <span className="text-sm text-on-surface-variant">Klik untuk unggah bukti kompetensi</span>
                      </button>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className="bg-[#E0F2FE] rounded-xl p-4 text-xs text-[#075985] leading-relaxed flex gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0284C7]/60 shrink-0 mt-0.5">lightbulb</span>
                    <span>
                      Upload dokumen bersifat opsional saat pendaftaran. Anda tetap dapat mengunggahnya nanti melalui halaman <strong>Lengkapi Profil</strong> setelah login.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Navigation Buttons                                        */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between gap-3 mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center gap-1.5 border border-outline-variant/50 text-on-surface-variant py-3 px-5 rounded-lg text-sm font-semibold hover:bg-surface-container-low hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Kembali
                </button>
              ) : (
                <Link
                  to="/"
                  className="flex items-center gap-1.5 border border-outline-variant/50 text-on-surface-variant py-3 px-5 rounded-lg text-sm font-semibold hover:bg-surface-container-low hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Kembali
                </Link>
              )}

              {step < STEP_LABELS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === 0 && !agreedTerms}
                  className="bg-[#0EA5E9] text-white py-3 px-7 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  Lanjutkan
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#0EA5E9] text-white py-3 px-7 rounded-lg text-sm font-bold hover:bg-[#0284C7] active:scale-[0.99] transition-all disabled:opacity-60 disabled:active:scale-100 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Kirim Pendaftaran
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Link ke sign in */}
            <p className="text-center text-sm text-on-surface-variant mt-6">
              Sudah punya akun?{' '}
              <Link to="/sign-in" className="text-[#0284C7] font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}