import { useState } from 'react';
import api from '../../api/client.js';

export default function DocumentSection({ items, onChange }) {
  const [type, setType] = useState('lainnya');
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fotoProfil = items.find((d) => d.type === 'foto_profil');
  const lainnya = items.filter((d) => d.type !== 'foto_profil');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('label', label);
      formData.append('file', file);

      const res = await api.post('/my/documents', formData, {
        headers: { 'Content-Type': undefined },
      });

      // Kalau upload foto profil baru, ganti yang lama di state
      if (type === 'foto_profil') {
        onChange([...items.filter((d) => d.type !== 'foto_profil'), res.data]);
      } else {
        onChange([...items, res.data]);
      }
      setLabel('');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah dokumen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/my/documents/${id}`);
      onChange(items.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
        <h2 className="font-bold text-on-background mb-4">Foto Profil</h2>
        {fotoProfil ? (
          <div className="flex items-center gap-4 mb-4">
            <img src={fotoProfil.file_url} alt="Foto profil" className="w-20 h-20 rounded-full object-cover" />
            <button onClick={() => handleDelete(fotoProfil.id)} className="text-[#B3261E] text-xs font-bold hover:underline">
              Hapus
            </button>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant mb-4">Belum ada foto profil.</p>
        )}
        <form
          onSubmit={(e) => {
            setType('foto_profil');
            handleUpload(e);
          }}
          className="flex gap-3"
        >
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              setType('foto_profil');
              setFile(e.target.files[0]);
            }}
            className="text-sm flex-1"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2E5E3B]/10 text-[#2E5E3B] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2E5E3B]/20 disabled:opacity-60"
          >
            Unggah
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
        <h2 className="font-bold text-on-background mb-4">Dokumen Pendukung</h2>

        {lainnya.length > 0 && (
          <ul className="mb-4 space-y-2">
            {lainnya.map((d) => (
              <li key={d.id} className="flex items-center justify-between bg-[#F5F4F0] rounded-lg px-4 py-2 text-sm">
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[#2E5E3B] hover:underline">
                  {d.label || d.type}
                </a>
                <button onClick={() => handleDelete(d.id)} className="text-[#B3261E] text-xs font-bold hover:underline">
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-3">{error}</p>}

        <form
          onSubmit={(e) => {
            setType((prev) => (prev === 'foto_profil' ? 'lainnya' : prev));
            handleUpload(e);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <select
            value={type === 'foto_profil' ? 'lainnya' : type}
            onChange={(e) => setType(e.target.value)}
            className="border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B] bg-white"
          >
            <option value="ktp">KTP</option>
            <option value="ijazah">Ijazah</option>
            <option value="lainnya">Lainnya</option>
          </select>
          <input
            placeholder="Label (misal: KTP)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:ring-[#2E5E3B] focus:border-[#2E5E3B]"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={(e) => setFile(e.target.files[0])}
            className="col-span-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 bg-[#2E5E3B]/10 text-[#2E5E3B] py-2 rounded-lg text-sm font-bold hover:bg-[#2E5E3B]/20 disabled:opacity-60"
          >
            {saving ? 'Mengunggah...' : '+ Tambah Dokumen'}
          </button>
        </form>
      </div>
    </>
  );
}