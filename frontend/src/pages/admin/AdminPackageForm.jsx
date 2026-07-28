import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';

const emptyForm = { name: '', price: 0, description: '', benefits: '', is_active: true, order: 0 };

export default function AdminPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get('/admin/packages')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const pkg = data.find((p) => String(p.id) === String(id));
        if (!pkg) {
          setError('Paket tidak ditemukan.');
          return;
        }
        setForm({
          name: pkg.name || '',
          price: pkg.price || 0,
          description: pkg.description || '',
          benefits: (pkg.benefits || []).join('\n'),
          is_active: !!pkg.is_active,
          order: pkg.order || 0,
        });
      })
      .catch(() => setError('Gagal memuat data paket.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        benefits: form.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      };
      if (isEdit) await api.put(`/admin/packages/${id}`, payload);
      else await api.post('/admin/packages', payload);
      navigate('/admin/paket');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan paket.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="h-8 w-48 bg-[#0284C7]/10 rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm p-6 h-96 animate-pulse" />
      </div>
    );
  }

  const isPremium = Number(form.price) > 0;
  const benefitsList = form.benefits.split('\n').map((b) => b.trim()).filter(Boolean);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/paket')} className="text-[#414844]/60 hover:text-[#0284C7] p-1 rounded-full hover:bg-[#0284C7]/5 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">{isEdit ? 'Edit Paket' : 'Tambah Paket'}</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Atur detail paket pendaftaran tenaga ahli.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start max-w-5xl">
        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#0284C7]/15 shadow-sm p-6">
          {error && <p className="bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Nama Paket *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="mis. Paket Premium Tahunan"
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Harga (Rp, isi 0 untuk gratis) *</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#414844]/50">Rp</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full border border-[#0284C7]/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Deskripsi</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ringkasan singkat manfaat paket ini"
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Keuntungan (satu baris = satu poin)</label>
              <textarea
                rows={5}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                placeholder={'Tayang di direktori\nBadge Premium\nPrioritas pencarian'}
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-bold uppercase text-[#414844]/70">Urutan Tampil</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className="flex items-center gap-2 self-end mb-1 text-sm font-bold text-[#414844]"
              >
                <span className={`material-symbols-outlined text-[28px] ${form.is_active ? 'text-[#0284C7]' : 'text-[#414844]/30'}`}>
                  {form.is_active ? 'toggle_on' : 'toggle_off'}
                </span>
                {form.is_active ? 'Aktif (tampil ke user)' : 'Nonaktif (disembunyikan)'}
              </button>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#0284C7] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0369A1] disabled:opacity-60 transition-colors"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/paket')}
                className="px-6 py-3 rounded-lg text-sm font-bold text-[#414844] border border-[#414844]/20 hover:bg-[#414844]/5 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase text-[#414844]/50 mb-2 tracking-wide">Pratinjau Kartu Paket</p>
          <div
            className={`relative flex flex-col bg-white rounded-2xl shadow-sm p-6 border-2 ${
              isPremium ? 'border-[#6B4F3B]/25' : 'border-[#0284C7]/10'
            } ${!form.is_active ? 'opacity-60' : ''}`}
          >
            <span className="absolute top-4 right-4 text-[10px] font-bold text-[#414844]/40 bg-[#414844]/5 w-6 h-6 rounded-full flex items-center justify-center">
              {form.order || '-'}
            </span>
            <span
              className={`self-start text-[10px] font-bold uppercase px-2.5 py-1 rounded-full mb-4 tracking-wide ${
                isPremium ? 'text-[#6B4F3B] bg-[#6B4F3B]/10' : 'text-[#414844] bg-[#414844]/10'
              }`}
            >
              {isPremium ? 'Premium' : 'Free'}
            </span>
            <h3 className="text-lg font-bold text-[#1B1C1A] mb-1">{form.name || 'Nama Paket'}</h3>
            <p className="text-2xl font-extrabold text-[#0284C7] mb-1">
              {isPremium ? `Rp${Number(form.price).toLocaleString('id-ID')}` : 'Gratis'}
              {isPremium && <span className="text-xs font-medium text-[#414844]/60"> /bulan</span>}
            </p>
            {form.description && <p className="text-xs text-[#414844]/70 mb-4 leading-relaxed">{form.description}</p>}
            <div className="flex-1">
              {benefitsList.length > 0 ? (
                <ul className="space-y-2">
                  {benefitsList.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#414844]">
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7] mt-0.5 shrink-0">check_circle</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#414844]/40 italic">Tidak ada fitur khusus</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}