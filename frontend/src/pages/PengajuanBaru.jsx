import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const emptyForm = {
  judul_pengajuan: '',
  jenis_pengajuan: '',
  provinsi: '',
  kabupaten_kota: '',
  nama_pemohon: '',
  instansi: '',
  penanggung_jawab: '',
};

const steps = [
  { number: 1, label: 'Info Dasar' },
  { number: 2, label: 'Data Pemohon' },
  { number: 3, label: 'Dokumen' },
  { number: 4, label: 'Review' },
];

export default function PengajuanBaru() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [dokumenPdf, setDokumenPdf] = useState(null);
  const [dokumenWord, setDokumenWord] = useState(null);
  const [dokumenZip, setDokumenZip] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/experts/my-status')
      .then((res) => {
        const order = res.data.order;
        const active =
          order?.status === 'verified' &&
          (!order.expired_at || new Date(order.expired_at) > new Date());
        setAllowed(!!active);
        if (!active) {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {
        navigate('/dashboard', { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep = (s) => {
    setError('');
    if (s === 1) {
      if (!form.judul_pengajuan || !form.jenis_pengajuan || !form.provinsi || !form.kabupaten_kota) {
        setError('Mohon lengkapi semua kolom pada tahap ini.');
        return false;
      }
    }
    if (s === 2) {
      if (!form.nama_pemohon || !form.instansi || !form.penanggung_jawab) {
        setError('Mohon lengkapi semua kolom pada tahap ini.');
        return false;
      }
    }
    if (s === 3) {
      if (!dokumenPdf) {
        setError('Dokumen PDF wajib diunggah.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('dokumen_pdf', dokumenPdf);
      if (dokumenWord) formData.append('dokumen_word', dokumenWord);
      if (dokumenZip) formData.append('dokumen_zip', dokumenZip);

      await api.post('/submissions', formData, {
        headers: { 'Content-Type': undefined },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Submit pengajuan error:', err);
      setError(err.response?.data?.message || 'Gagal mengirim pengajuan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <span className="w-6 h-6 border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-surface-container-lowest px-margin-mobile py-16 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-headline-md text-headline-md text-on-background">Buat Pengajuan Baru</h1>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#2E5E3B] hover:text-[#244B2F] flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                    step >= s.number ? 'bg-[#2E5E3B] text-white' : 'bg-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  {step > s.number ? (
                    <span className="material-symbols-outlined text-base">check</span>
                  ) : (
                    s.number
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 whitespace-nowrap">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${step > s.number ? 'bg-[#2E5E3B]' : 'bg-outline-variant/30'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8">
          {error && (
            <div className="flex items-start gap-2 bg-error-container text-on-error-container text-sm rounded-xl p-3 mb-5">
              <span className="material-symbols-outlined text-base leading-none mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Judul Pengajuan
                </label>
                <input
                  value={form.judul_pengajuan}
                  onChange={update('judul_pengajuan')}
                  placeholder="Contoh: Pengajuan AMDAL Pembangunan Pabrik X"
                  className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Jenis Pengajuan
                </label>
                <select
                  value={form.jenis_pengajuan}
                  onChange={update('jenis_pengajuan')}
                  className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="AMDAL">AMDAL</option>
                  <option value="UKL-UPL">UKL-UPL</option>
                  <option value="SPPL">SPPL</option>
                  <option value="KLHS">KLHS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Provinsi
                  </label>
                  <input
                    value={form.provinsi}
                    onChange={update('provinsi')}
                    className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Kabupaten/Kota
                  </label>
                  <input
                    value={form.kabupaten_kota}
                    onChange={update('kabupaten_kota')}
                    className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Nama Pemohon
                </label>
                <input
                  value={form.nama_pemohon}
                  onChange={update('nama_pemohon')}
                  className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Instansi
                </label>
                <input
                  value={form.instansi}
                  onChange={update('instansi')}
                  className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Penanggung Jawab
                </label>
                <input
                  value={form.penanggung_jawab}
                  onChange={update('penanggung_jawab')}
                  className="w-full mt-1.5 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2E5E3B]/30 focus:border-[#2E5E3B]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Dokumen PDF <span className="text-[#B3261E]">*wajib</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setDokumenPdf(e.target.files[0] || null)}
                  className="w-full mt-1.5 text-sm"
                />
                {dokumenPdf && <p className="text-xs text-on-surface-variant mt-1">{dokumenPdf.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Dokumen Word <span className="text-on-surface-variant/60">(opsional)</span>
                </label>
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setDokumenWord(e.target.files[0] || null)}
                  className="w-full mt-1.5 text-sm"
                />
                {dokumenWord && <p className="text-xs text-on-surface-variant mt-1">{dokumenWord.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Dokumen ZIP <span className="text-on-surface-variant/60">(opsional, jika diperlukan)</span>
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setDokumenZip(e.target.files[0] || null)}
                  className="w-full mt-1.5 text-sm"
                />
                {dokumenZip && <p className="text-xs text-on-surface-variant mt-1">{dokumenZip.name}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-on-background">Review Data</h2>
              <dl className="flex flex-col gap-3 text-sm">
                {[
                  ['Judul Pengajuan', form.judul_pengajuan],
                  ['Jenis Pengajuan', form.jenis_pengajuan],
                  ['Provinsi', form.provinsi],
                  ['Kabupaten/Kota', form.kabupaten_kota],
                  ['Nama Pemohon', form.nama_pemohon],
                  ['Instansi', form.instansi],
                  ['Penanggung Jawab', form.penanggung_jawab],
                  ['Dokumen PDF', dokumenPdf?.name || '-'],
                  ['Dokumen Word', dokumenWord?.name || '-'],
                  ['Dokumen ZIP', dokumenZip?.name || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <dt className="text-on-surface-variant">{label}</dt>
                    <dd className="font-medium text-on-background text-right">{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Navigasi */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || submitting}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-background disabled:opacity-0 transition-opacity"
            >
              Kembali
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="bg-[#2E5E3B] text-white px-6 py-3 rounded-full font-label-md hover:bg-[#244B2F] transition-colors"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#2E5E3B] text-white px-6 py-3 rounded-full font-label-md hover:bg-[#244B2F] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {submitting ? 'Mengirim...' : 'Submit Pengajuan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}