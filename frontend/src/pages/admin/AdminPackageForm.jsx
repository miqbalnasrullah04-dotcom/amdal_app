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
        const pkg = res.data.find((p) => String(p.id) === String(id));
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

  if (loading) return <p className="text-[#414844]/70">Memuat...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/paket')} className="text-[#414844]/60 hover:text-[#0284C7]">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">{isEdit ? 'Edit Paket' : 'Tambah Paket'}</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Atur detail paket pendaftaran tenaga ahli.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm p-6 max-w-2xl">
        {error && <p className="bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Nama Paket *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Harga (0 = gratis) *</label>
            <input
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Deskripsi</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Keuntungan (satu baris = satu poin)</label>
            <textarea
              rows={4}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              placeholder={'Tayang di direktori\nBadge Premium\nPrioritas pencarian'}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Urutan</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Aktif (tampil ke user)
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#0284C7] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#0369A1] disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/paket')}
              className="px-6 py-3 rounded-lg text-sm font-bold text-[#414844] border border-[#414844]/20 hover:bg-[#414844]/5"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}