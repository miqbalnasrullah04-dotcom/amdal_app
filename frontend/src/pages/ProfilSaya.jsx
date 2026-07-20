import { useEffect, useState, useRef } from 'react';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import PhoneInput from '../components/PhoneInput.jsx';

/* ─── constants ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'pribadi',    label: 'Data Pribadi',   icon: 'person'            },
  { id: 'pendidikan', label: 'Pendidikan',      icon: 'school'            },
  { id: 'pengalaman', label: 'Pengalaman',      icon: 'work'              },
  { id: 'sertifikat', label: 'Sertifikat',      icon: 'workspace_premium' },
  { id: 'dokumen',    label: 'Dokumen & Foto',  icon: 'folder'            },
];

const INPUT = 'w-full rounded-lg border border-outline-variant/40 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/20 focus:border-[#2E5E3B] transition-colors';
const BTN_PRIMARY = 'bg-[#2E5E3B] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#244B2F] transition-colors disabled:opacity-50 flex items-center gap-2';
const BTN_GHOST   = 'text-[#2E5E3B] text-sm font-bold px-4 py-2 rounded-xl border border-[#2E5E3B]/30 hover:bg-[#2E5E3B]/5 transition-colors flex items-center gap-1.5';
const BTN_DANGER  = 'text-[#B3261E] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#B3261E]/10 transition-colors flex items-center gap-1';

function Label({ children }) {
  return <span className="text-xs font-bold uppercase tracking-wide text-[#414844]/60 block mb-1">{children}</span>;
}
function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-black/5 shadow-sm p-6 ${className}`}>{children}</div>;
}
function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#2E5E3B] uppercase tracking-wider mb-4">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </h3>
  );
}
function Alert({ type, msg, onClose }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div className={`flex items-start gap-3 text-sm rounded-xl p-4 mb-4 ${isErr ? 'bg-[#FFDAD6] text-[#93000A]' : 'bg-[#E3F2E7] text-[#2E5E3B]'}`}>
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">{isErr ? 'error' : 'check_circle'}</span>
      <span className="flex-1">{msg}</span>
      {onClose && <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[16px]">close</span></button>}
    </div>
  );
}

export default function ProfilSaya() {
  const [tab, setTab]         = useState('pribadi');
  const [expert, setExpert]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [ok, setOk]           = useState('');

  /* ── data pribadi form ────────────────────────────────────────── */
  const [form, setForm] = useState({
    name:'', institution:'', field:'', phone:'',
    tempat_lahir:'', tanggal_lahir:'',
    alamat_lengkap:'', alamat_kota:'', alamat_provinsi:'',
  });

  /* ── sub-resources ────────────────────────────────────────────── */
  const [educations,   setEducations]   = useState([]);
  const [experiences,  setExperiences]  = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [documents,    setDocuments]    = useState([]);

  /* ── inline edit state ────────────────────────────────────────── */
  const [editEdu,  setEditEdu]  = useState(null); // { id, ...fields }
  const [editExp,  setEditExp]  = useState(null);
  const [addingEdu,  setAddingEdu]  = useState(false);
  const [addingExp,  setAddingExp]  = useState(false);
  const [addingCert, setAddingCert] = useState(false);

  const [newEdu,  setNewEdu]  = useState({ jenjang:'', institusi:'', jurusan:'', tahun_lulus:'' });
  const [newExp,  setNewExp]  = useState({ posisi:'', instansi:'', tahun_mulai:'', tahun_selesai:'', deskripsi:'' });
  const [newCert, setNewCert] = useState({ nama_sertifikat:'', penerbit:'', tahun:'' });

  /* ── upload refs ──────────────────────────────────────────────── */
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPreview]  = useState(null);
  const [cvFile, setCvFile]         = useState(null);
  const [buktiFile, setBuktiFile]   = useState(null);
  const photoRef = useRef(); const cvRef = useRef(); const buktiRef = useRef();

  const flash = (type, msg) => {
    if (type === 'ok') { setOk(msg); setErr(''); }
    else               { setErr(msg); setOk(''); }
    setTimeout(() => { setOk(''); setErr(''); }, 4000);
  };

  /* ── load ─────────────────────────────────────────────────────── */
  const load = async () => {
    try {
      const res = await api.get('/my/profile');
      const d = res.data || {};
      setExpert(d);
      setForm({
        name: d.name || '', institution: d.institution || '',
        field: d.field || '', phone: d.phone || '',
        tempat_lahir: d.tempat_lahir || '',
        tanggal_lahir: d.tanggal_lahir ? d.tanggal_lahir.toString().slice(0,10) : '',
        alamat_lengkap: d.alamat_lengkap || '',
        alamat_kota: d.alamat_kota || '',
        alamat_provinsi: d.alamat_provinsi || '',
      });
      if (d.photo) setPreview(d.photo.startsWith('http') ? d.photo : `/storage/${d.photo}`);
      setEducations(d.educations   || []);
      setExperiences(d.experiences  || []);
      setCertificates(d.certificates || []);
      setDocuments(d.documents      || []);
    } catch { setErr('Gagal memuat data profil.'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── handlers: data pribadi ──────────────────────────────────── */
  const savePribadi = async () => {
    setSaving(true);
    try {
      await api.post('/my/profile', form);
      flash('ok', 'Data pribadi berhasil disimpan.');
      load();
    } catch (e) { flash('err', e.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  /* ── handlers: pendidikan ────────────────────────────────────── */
  const addEdu = async () => {
    if (!newEdu.jenjang || !newEdu.institusi) return flash('err', 'Jenjang dan institusi wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/educations', newEdu);
      flash('ok', 'Pendidikan ditambahkan.');
      setNewEdu({ jenjang:'', institusi:'', jurusan:'', tahun_lulus:'' });
      setAddingEdu(false); load();
    } catch { flash('err', 'Gagal menambah pendidikan.'); }
    finally { setSaving(false); }
  };

  const updateEdu = async (id) => {
    setSaving(true);
    try {
      await api.put(`/my/educations/${id}`, editEdu);
      flash('ok', 'Pendidikan diperbarui.'); setEditEdu(null); load();
    } catch { flash('err', 'Gagal memperbarui.'); }
    finally { setSaving(false); }
  };

  const deleteEdu = async (id) => {
    if (!confirm('Hapus data pendidikan ini?')) return;
    try { await api.delete(`/my/educations/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: pengalaman ────────────────────────────────────── */
  const addExp = async () => {
    if (!newExp.posisi || !newExp.instansi) return flash('err', 'Posisi dan instansi wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/experiences', newExp);
      flash('ok', 'Pengalaman ditambahkan.');
      setNewExp({ posisi:'', instansi:'', tahun_mulai:'', tahun_selesai:'', deskripsi:'' });
      setAddingExp(false); load();
    } catch { flash('err', 'Gagal menambah pengalaman.'); }
    finally { setSaving(false); }
  };

  const updateExp = async (id) => {
    setSaving(true);
    try {
      await api.put(`/my/experiences/${id}`, editExp);
      flash('ok', 'Pengalaman diperbarui.'); setEditExp(null); load();
    } catch { flash('err', 'Gagal memperbarui.'); }
    finally { setSaving(false); }
  };

  const deleteExp = async (id) => {
    if (!confirm('Hapus data pengalaman ini?')) return;
    try { await api.delete(`/my/experiences/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: sertifikat ────────────────────────────────────── */
  const addCert = async () => {
    if (!newCert.nama_sertifikat) return flash('err', 'Nama sertifikat wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/certificates', newCert);
      flash('ok', 'Sertifikat ditambahkan.');
      setNewCert({ nama_sertifikat:'', penerbit:'', tahun:'' });
      setAddingCert(false); load();
    } catch { flash('err', 'Gagal menambah sertifikat.'); }
    finally { setSaving(false); }
  };

  const deleteCert = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try { await api.delete(`/my/certificates/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: dokumen & foto ────────────────────────────────── */
  const uploadDoc = async (file, type, label, resetFn) => {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', type); fd.append('label', label); fd.append('file', file);
      await api.post('/my/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      flash('ok', `${label} berhasil diunggah.`);
      resetFn(); load();
    } catch { flash('err', `Gagal mengunggah ${label}.`); }
    finally { setSaving(false); }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try { await api.delete(`/my/documents/${id}`); flash('ok', 'Dokumen dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── loading ─────────────────────────────────────────────────── */
  if (loading) return (
    <DashboardLayout title="Profil Saya">
      <div className="flex items-center gap-3 text-[#5B6660]">
        <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
        Memuat profil...
      </div>
    </DashboardLayout>
  );

  const profileStatus = expert?.profile_status || 'draft';

  return (
    <DashboardLayout title="Profil Saya" subtitle="Kelola data, riwayat, dan dokumen profil tenaga ahli Anda.">
      {/* ── Status Banner ─────────────────────────────────────── */}
      {profileStatus === 'ditolak' && expert?.reject_reason && (
        <div className="mb-5 bg-[#FFDAD6] border border-[#FFB4AB] rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#B3261E] text-[20px] shrink-0 mt-0.5">error</span>
          <div>
            <p className="font-bold text-[#93000A] text-sm mb-1">Profil Ditolak — Harap Diperbaiki</p>
            <p className="text-sm text-[#410002]">{expert.reject_reason}</p>
          </div>
        </div>
      )}
      {profileStatus === 'aktif' && (
        <div className="mb-5 bg-[#E3F2E7] border border-[#A7D7B0] rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#2E5E3B] text-[20px]">verified</span>
          <p className="text-sm font-semibold text-[#1C3822]">Profil aktif — perubahan akan ditinjau ulang oleh admin.</p>
        </div>
      )}

      <Alert type="error" msg={err} onClose={() => setErr('')} />
      <Alert type="ok"    msg={ok}  onClose={() => setOk('')} />

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-outline-variant/20">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id
                ? 'border-[#2E5E3B] text-[#2E5E3B] bg-[#2E5E3B]/5'
                : 'border-transparent text-[#5B6660] hover:text-[#2E5E3B] hover:bg-[#2E5E3B]/5'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: DATA PRIBADI                                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pribadi' && (
        <div className="space-y-6 animate-fadeIn">
          <Card>
            <SectionTitle icon="badge">Identitas & Profesi</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nama Lengkap *</Label>
                <input className={INPUT} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Dr. Nama Anda, S.Hut, M.Si" /></div>
              <div><Label>No. HP / WhatsApp *</Label>
                <PhoneInput
                  value={form.phone}
                  onChange={(val) => setForm({ ...form, phone: val })}
                  placeholder="81234567890"
                  required
                />
              </div>
              <div><Label>Institusi / Perusahaan</Label>
                <input className={INPUT} value={form.institution} onChange={e=>setForm({...form,institution:e.target.value})} placeholder="PSL - IPB University" /></div>
              <div><Label>Bidang Keahlian</Label>
                <input className={INPUT} value={form.field} onChange={e=>setForm({...form,field:e.target.value})} placeholder="Ahli Kehutanan & Tata Ruang" /></div>
              <div><Label>Tempat Lahir</Label>
                <input className={INPUT} value={form.tempat_lahir} onChange={e=>setForm({...form,tempat_lahir:e.target.value})} placeholder="Jakarta" /></div>
              <div><Label>Tanggal Lahir</Label>
                <input type="date" className={INPUT} value={form.tanggal_lahir} onChange={e=>setForm({...form,tanggal_lahir:e.target.value})} /></div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="location_on">Alamat</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Alamat Lengkap</Label>
                <textarea className={INPUT+' min-h-[80px] resize-none'} value={form.alamat_lengkap} onChange={e=>setForm({...form,alamat_lengkap:e.target.value})} placeholder="Jl. Contoh No. 4, Kecamatan..." /></div>
              <div><Label>Kota / Kabupaten</Label>
                <input className={INPUT} value={form.alamat_kota} onChange={e=>setForm({...form,alamat_kota:e.target.value})} placeholder="Kota Bogor" /></div>
              <div><Label>Provinsi</Label>
                <input className={INPUT} value={form.alamat_provinsi} onChange={e=>setForm({...form,alamat_provinsi:e.target.value})} placeholder="Jawa Barat" /></div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button className={BTN_PRIMARY} onClick={savePribadi} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
              {saving ? 'Menyimpan...' : 'Simpan Data Pribadi'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PENDIDIKAN                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pendidikan' && (
        <div className="space-y-4 animate-fadeIn">
          {educations.length === 0 && !addingEdu && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">Belum ada data pendidikan.</p></Card>
          )}
          {educations.map((e) => (
            <Card key={e.id}>
              {editEdu?.id === e.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label>Jenjang *</Label><input className={INPUT} value={editEdu.jenjang} onChange={v=>setEditEdu({...editEdu,jenjang:v.target.value})} placeholder="S1 / S2 / S3" /></div>
                    <div><Label>Institusi *</Label><input className={INPUT} value={editEdu.institusi} onChange={v=>setEditEdu({...editEdu,institusi:v.target.value})} /></div>
                    <div><Label>Jurusan</Label><input className={INPUT} value={editEdu.jurusan||''} onChange={v=>setEditEdu({...editEdu,jurusan:v.target.value})} /></div>
                    <div><Label>Tahun Lulus</Label><input type="number" className={INPUT} value={editEdu.tahun_lulus||''} onChange={v=>setEditEdu({...editEdu,tahun_lulus:v.target.value})} /></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className={BTN_PRIMARY} onClick={()=>updateEdu(e.id)} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>Simpan</button>
                    <button className={BTN_GHOST} onClick={()=>setEditEdu(null)}>Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{e.jenjang} — {e.institusi}</p>
                    {e.jurusan && <p className="text-sm text-[#5B6660]">{e.jurusan}</p>}
                    {e.tahun_lulus && <p className="text-xs text-[#5B6660] mt-1">Lulus {e.tahun_lulus}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className={BTN_GHOST} onClick={()=>setEditEdu({...e})}><span className="material-symbols-outlined text-[16px]">edit</span>Edit</button>
                    <button className={BTN_DANGER} onClick={()=>deleteEdu(e.id)}><span className="material-symbols-outlined text-[16px]">delete</span>Hapus</button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {addingEdu ? (
            <Card>
              <SectionTitle icon="add_circle">Tambah Pendidikan</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div><Label>Jenjang *</Label><input className={INPUT} value={newEdu.jenjang} onChange={v=>setNewEdu({...newEdu,jenjang:v.target.value})} placeholder="S1 / S2 / S3 / Profesor" /></div>
                <div><Label>Institusi *</Label><input className={INPUT} value={newEdu.institusi} onChange={v=>setNewEdu({...newEdu,institusi:v.target.value})} placeholder="Nama Universitas" /></div>
                <div><Label>Jurusan / Program Studi</Label><input className={INPUT} value={newEdu.jurusan} onChange={v=>setNewEdu({...newEdu,jurusan:v.target.value})} placeholder="Ilmu Lingkungan" /></div>
                <div><Label>Tahun Lulus</Label><input type="number" className={INPUT} value={newEdu.tahun_lulus} onChange={v=>setNewEdu({...newEdu,tahun_lulus:v.target.value})} placeholder="2015" /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addEdu} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving?'Menyimpan...':'Simpan'}</button>
                <button className={BTN_GHOST} onClick={()=>setAddingEdu(false)}>Batal</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST+' self-start'} onClick={()=>setAddingEdu(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>Tambah Pendidikan
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PENGALAMAN                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pengalaman' && (
        <div className="space-y-4 animate-fadeIn">
          {experiences.length === 0 && !addingExp && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">Belum ada data pengalaman.</p></Card>
          )}
          {experiences.map((e) => (
            <Card key={e.id}>
              {editExp?.id === e.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label>Posisi / Jabatan *</Label><input className={INPUT} value={editExp.posisi} onChange={v=>setEditExp({...editExp,posisi:v.target.value})} /></div>
                    <div><Label>Instansi / Organisasi *</Label><input className={INPUT} value={editExp.instansi} onChange={v=>setEditExp({...editExp,instansi:v.target.value})} /></div>
                    <div><Label>Tahun Mulai</Label><input type="number" className={INPUT} value={editExp.tahun_mulai||''} onChange={v=>setEditExp({...editExp,tahun_mulai:v.target.value})} /></div>
                    <div><Label>Tahun Selesai</Label><input type="number" className={INPUT} value={editExp.tahun_selesai||''} onChange={v=>setEditExp({...editExp,tahun_selesai:v.target.value})} placeholder="Kosong = masih berlangsung" /></div>
                    <div className="md:col-span-2"><Label>Deskripsi</Label><textarea className={INPUT+' resize-none min-h-[72px]'} value={editExp.deskripsi||''} onChange={v=>setEditExp({...editExp,deskripsi:v.target.value})} /></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className={BTN_PRIMARY} onClick={()=>updateExp(e.id)} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>Simpan</button>
                    <button className={BTN_GHOST} onClick={()=>setEditExp(null)}>Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{e.posisi}</p>
                    <p className="text-sm text-[#5B6660]">{e.instansi}</p>
                    {(e.tahun_mulai || e.tahun_selesai) && (
                      <p className="text-xs text-[#5B6660] mt-1">{e.tahun_mulai || '?'} — {e.tahun_selesai || 'Sekarang'}</p>
                    )}
                    {e.deskripsi && <p className="text-xs text-[#5B6660] mt-1 line-clamp-2">{e.deskripsi}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className={BTN_GHOST} onClick={()=>setEditExp({...e})}><span className="material-symbols-outlined text-[16px]">edit</span>Edit</button>
                    <button className={BTN_DANGER} onClick={()=>deleteExp(e.id)}><span className="material-symbols-outlined text-[16px]">delete</span>Hapus</button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {addingExp ? (
            <Card>
              <SectionTitle icon="add_circle">Tambah Pengalaman</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div><Label>Posisi / Jabatan *</Label><input className={INPUT} value={newExp.posisi} onChange={v=>setNewExp({...newExp,posisi:v.target.value})} placeholder="Konsultan AMDAL" /></div>
                <div><Label>Instansi / Organisasi *</Label><input className={INPUT} value={newExp.instansi} onChange={v=>setNewExp({...newExp,instansi:v.target.value})} placeholder="PT. Contoh Jaya" /></div>
                <div><Label>Tahun Mulai</Label><input type="number" className={INPUT} value={newExp.tahun_mulai} onChange={v=>setNewExp({...newExp,tahun_mulai:v.target.value})} placeholder="2020" /></div>
                <div><Label>Tahun Selesai</Label><input type="number" className={INPUT} value={newExp.tahun_selesai} onChange={v=>setNewExp({...newExp,tahun_selesai:v.target.value})} placeholder="Kosong = masih berlangsung" /></div>
                <div className="md:col-span-2"><Label>Deskripsi Singkat</Label><textarea className={INPUT+' resize-none min-h-[72px]'} value={newExp.deskripsi} onChange={v=>setNewExp({...newExp,deskripsi:v.target.value})} /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addExp} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving?'Menyimpan...':'Simpan'}</button>
                <button className={BTN_GHOST} onClick={()=>setAddingExp(false)}>Batal</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST+' self-start'} onClick={()=>setAddingExp(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>Tambah Pengalaman
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: SERTIFIKAT                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'sertifikat' && (
        <div className="space-y-4 animate-fadeIn">
          {certificates.length === 0 && !addingCert && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">Belum ada data sertifikat.</p></Card>
          )}
          {certificates.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#2E5E3B] text-[22px] mt-0.5">workspace_premium</span>
                  <div>
                    <p className="font-bold text-[#1F2A22]">{c.nama_sertifikat}</p>
                    {c.penerbit && <p className="text-sm text-[#5B6660]">{c.penerbit}</p>}
                    {c.tahun    && <p className="text-xs text-[#5B6660] mt-1">Tahun {c.tahun}</p>}
                    {c.file_url && <a href={c.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#0284C7] hover:underline mt-1 inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">open_in_new</span>Lihat File</a>}
                  </div>
                </div>
                <button className={BTN_DANGER} onClick={()=>deleteCert(c.id)}><span className="material-symbols-outlined text-[16px]">delete</span>Hapus</button>
              </div>
            </Card>
          ))}

          {addingCert ? (
            <Card>
              <SectionTitle icon="add_circle">Tambah Sertifikat</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="md:col-span-2"><Label>Nama Sertifikat *</Label><input className={INPUT} value={newCert.nama_sertifikat} onChange={v=>setNewCert({...newCert,nama_sertifikat:v.target.value})} placeholder="Sertifikat AMDAL A" /></div>
                <div><Label>Tahun</Label><input type="number" className={INPUT} value={newCert.tahun} onChange={v=>setNewCert({...newCert,tahun:v.target.value})} placeholder="2022" /></div>
                <div className="md:col-span-3"><Label>Penerbit / Lembaga</Label><input className={INPUT} value={newCert.penerbit} onChange={v=>setNewCert({...newCert,penerbit:v.target.value})} placeholder="KLHK / BPLHD / Instansi Penerbit" /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addCert} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving?'Menyimpan...':'Simpan'}</button>
                <button className={BTN_GHOST} onClick={()=>setAddingCert(false)}>Batal</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST+' self-start'} onClick={()=>setAddingCert(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>Tambah Sertifikat
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: DOKUMEN & FOTO                                     */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'dokumen' && (
        <div className="space-y-6 animate-fadeIn">
          {/* ── Foto Profil ─────────────────────────────────── */}
          <Card>
            <SectionTitle icon="photo_camera">Foto Profil</SectionTitle>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#2E5E3B]/20 bg-[#F5F4F0] flex items-center justify-center shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="Foto profil" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-4xl text-[#5B6660]/40">person</span>}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[#5B6660]">Format JPG/PNG, maks. 2MB. Gunakan foto formal dengan latar polos.</p>
                <div className="flex flex-wrap gap-2">
                  <label className={BTN_GHOST+' cursor-pointer'}>
                    <span className="material-symbols-outlined text-[16px]">upload</span>Pilih Foto
                    <input type="file" accept="image/*" className="hidden" ref={photoRef}
                      onChange={e=>{const f=e.target.files?.[0]; if(f){setPhotoFile(f);setPreview(URL.createObjectURL(f));}}} />
                  </label>
                  {photoFile && (
                    <button className={BTN_PRIMARY} disabled={saving}
                      onClick={()=>uploadDoc(photoFile,'foto_profil','Pas Foto Formal',()=>{setPhotoFile(null);if(photoRef.current)photoRef.current.value='';})}>
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      {saving?'Mengunggah...':'Upload Foto'}
                    </button>
                  )}
                </div>
                {photoFile && <p className="text-xs text-[#5B6660]">{photoFile.name}</p>}
              </div>
            </div>
          </Card>

          {/* ── CV ──────────────────────────────────────────── */}
          <Card>
            <SectionTitle icon="description">Curriculum Vitae (CV)</SectionTitle>
            <p className="text-xs text-[#5B6660] mb-3">Format PDF, maks. 5MB. Pastikan CV Anda terbaru dan lengkap.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <label className={BTN_GHOST+' cursor-pointer'}>
                <span className="material-symbols-outlined text-[16px]">upload_file</span>Pilih File CV
                <input type="file" accept=".pdf" className="hidden" ref={cvRef}
                  onChange={e=>setCvFile(e.target.files?.[0]||null)} />
              </label>
              {cvFile && (
                <button className={BTN_PRIMARY} disabled={saving}
                  onClick={()=>uploadDoc(cvFile,'lainnya','CV / Curriculum Vitae',()=>{setCvFile(null);if(cvRef.current)cvRef.current.value='';})}>
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  {saving?'Mengunggah...':'Upload CV'}
                </button>
              )}
              {cvFile && <span className="text-xs text-[#5B6660]">{cvFile.name}</span>}
            </div>
          </Card>

          {/* ── Bukti Kompetensi ────────────────────────────── */}
          <Card>
            <SectionTitle icon="verified">Bukti Kompetensi</SectionTitle>
            <p className="text-xs text-[#5B6660] mb-3">Sertifikat, ijazah, atau dokumen pendukung lainnya (PDF/JPG/PNG, maks. 5MB).</p>
            <div className="flex flex-wrap gap-2 items-center">
              <label className={BTN_GHOST+' cursor-pointer'}>
                <span className="material-symbols-outlined text-[16px]">upload_file</span>Pilih Bukti Kompetensi
                <input type="file" accept=".pdf,image/*" className="hidden" ref={buktiRef}
                  onChange={e=>setBuktiFile(e.target.files?.[0]||null)} />
              </label>
              {buktiFile && (
                <button className={BTN_PRIMARY} disabled={saving}
                  onClick={()=>uploadDoc(buktiFile,'lainnya','Bukti Kompetensi',()=>{setBuktiFile(null);if(buktiRef.current)buktiRef.current.value='';})}>
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  {saving?'Mengunggah...':'Upload Bukti'}
                </button>
              )}
              {buktiFile && <span className="text-xs text-[#5B6660]">{buktiFile.name}</span>}
            </div>
          </Card>

          {/* ── Daftar Dokumen Tersimpan ─────────────────────── */}
          {documents.length > 0 && (
            <Card>
              <SectionTitle icon="folder_open">Dokumen Tersimpan</SectionTitle>
              <ul className="divide-y divide-outline-variant/20">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-[20px] text-[#2E5E3B] shrink-0">
                        {doc.type === 'foto_profil' ? 'photo_camera' : 'description'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1F2A22] truncate">{doc.label || doc.type}</p>
                        {doc.file_path && (
                          <a href={doc.file_path.startsWith('http')?doc.file_path:`/storage/${doc.file_path}`}
                            target="_blank" rel="noreferrer"
                            className="text-xs text-[#0284C7] hover:underline">Lihat File</a>
                        )}
                      </div>
                    </div>
                    <button className={BTN_DANGER} onClick={()=>deleteDoc(doc.id)}>
                      <span className="material-symbols-outlined text-[16px]">delete</span>Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

    </DashboardLayout>
  );
}
