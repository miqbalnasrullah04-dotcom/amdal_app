import { useState } from 'react';
import api from '../../api/client.js';

const emptyForm = { nama_sertifikat: '', penerbit: '', tahun: '' };

export default function CertificateSection({ items, onChange }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('file', file);

      const res = await api.post('/my/certificates', formData, {
        headers: { 'Content-Type': undefined },
      });
      onChange([...items, res.data]);
      setForm(emptyForm);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan sertifikat.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/my/certificates/${id}`);
      onChange(items.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
      <h2 className="font-bold text-on-background mb-4">Sertifikat</h2>

      {items.length > 0 && (
        <ul className="mb-4 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between bg-[#F5F4F0] rounded-lg px-4 py-2 text-sm">
              <span>
                <strong>{it.nama_sertifikat}</strong>
                {it.penerbit && ` — ${it.penerbit}`}
                {it.tahun && ` (${it.tahun})`}
              </span>
              <button onClick={() => handleDelete(it.id)} className="text-[#B3261E] text-xs font-bold hover:underline">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-3">{error}</p>}

      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Nama Sertifikat"
          value={form.nama_sertifikat}
          onChange={(e) => setForm({ ...form, nama_sertifikat: e.target.value })}
          className="col-span-2 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
        />
        <input
          placeholder="Penerbit"
          value={form.penerbit}
          onChange={(e) => setForm({ ...form, penerbit: e.target.value })}
          className="border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
        />
        <input
          type="number"
          placeholder="Tahun"
          value={form.tahun}
          onChange={(e) => setForm({ ...form, tahun: e.target.value })}
          className="border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
        />
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="col-span-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-[#2E5E3B]/10 text-[#2E5E3B] py-2 rounded-lg text-sm font-bold hover:bg-[#2E5E3B]/20 transition-colors disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : '+ Tambah Sertifikat'}
        </button>
      </form>
    </div>
  );
}