import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';

const emptyForm = {
  name: '', institution: '', email: '', field: '', kriteria: '',
  alamat_kota: '', alamat_provinsi: '', photo: '', verified: false, featured: false,
};

export default function AdminExpertForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get('/admin/experts')
      .then((res) => {
        const exp = res.data.find((e) => String(e.id) === String(id));
        if (!exp) {
          setError('Tenaga ahli tidak ditemukan.');
          return;
        }
        setForm({
          name: exp.name || '',
          institution: exp.institution || '',
          email: exp.email || '',
          field: exp.field || '',
          kriteria: exp.kriteria || '',
          alamat_kota: exp.alamat_kota || '',
          alamat_provinsi: exp.alamat_provinsi || '',
          photo: exp.photo || '',
          verified: !!exp.verified,
          featured: !!exp.featured,
        });
      })
      .catch(() => setError('Gagal memuat data.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) await api.put(`/experts/${id}`, form);
      else await api.post('/experts', form);
      navigate('/admin/tenaga-ahli');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-[#414844]/70">Memuat...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/admin/tenaga-ahli')} className="text-[#414844]/60 hover:text-[#0284C7]">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#0284C7]">{isEdit ? 'Edit Tenaga Ahli' : 'Tambah Tenaga Ahli'}</h2>
          <p className="text-[#414844]/80 text-sm mt-1">Kelola data tenaga ahli yang terdaftar di TenagaAhli.com.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#0284C7]/15 shadow-sm p-6 max-w-2xl">
        {error && <p className="bg-[#FFDAD6] text-[#93000A] text-sm rounded-lg p-3 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Nama *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Instansi</label>
            <input
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Bidang Keahlian</label>
            <input
              value={form.field}
              onChange={(e) => setForm({ ...form, field: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">Kriteria</label>
            <select
              value={form.kriteria}
              onChange={(e) => setForm({ ...form, kriteria: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7] bg-white"
            >
              <option value="">-- Pilih Kriteria --</option>
              <option value="Narasumber/Pembicara">Narasumber/Pembicara</option>
              <option value="Tenaga Ahli">Tenaga Ahli</option>
              <option value="Instruktur Pengajar">Instruktur Pengajar</option>
              <option value="Peneliti Artikel/Jurnal">Peneliti Artikel/Jurnal</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Kota</label>
              <input
                value={form.alamat_kota}
                onChange={(e) => setForm({ ...form, alamat_kota: e.target.value })}
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#414844]/70">Provinsi</label>
              <input
                value={form.alamat_provinsi}
                onChange={(e) => setForm({ ...form, alamat_provinsi: e.target.value })}
                className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#414844]/70">URL Foto</label>
            <input
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              className="w-full mt-1 border border-[#0284C7]/30 rounded-lg px-3 py-2 text-sm focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
              Verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>
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
              onClick={() => navigate('/admin/tenaga-ahli')}
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