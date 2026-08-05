import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import api from '../api/client.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import CameraCapture from '../components/CameraCapture.jsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ─── constants ──────────────────────────────────────────────────────────── */
const getTabs = (t) => [
  { id: 'pribadi', label: t('profile.tabs.personal_data', 'Data Pribadi'), icon: 'person' },
  { id: 'profil-bio', label: t('profile.tabs.profile_bio', 'Profil Bio'), icon: 'description' },
  { id: 'pendidikan', label: t('profile.tabs.education', 'Pendidikan'), icon: 'school' },
  { id: 'pengalaman', label: t('profile.tabs.experience', 'Pengalaman'), icon: 'work' },
  { id: 'sertifikat', label: t('profile.tabs.certificates', 'Sertifikat'), icon: 'workspace_premium' },
  { id: 'akademik', label: t('profile.tabs.academic_links', 'Link Akademik'), icon: 'link' },
  { id: 'publikasi', label: t('profile.tabs.publication', 'Publikasi & Riwayat'), icon: 'article' },
  { id: 'dokumen', label: t('profile.tabs.documents', 'Upload Dokumen'), icon: 'folder' },
  { id: 'verifikasi', label: t('profile.tabs.verification', 'Kirim Verifikasi'), icon: 'verified' },
];

const getStatusPengajuan = (t) => ({
  menunggu_review: { label: t('profile.status.waiting_review', 'Menunggu Review'), color: 'text-amber-700 bg-amber-50 border-amber-200' },
  diproses: { label: t('profile.status.processing', 'Diproses'), color: 'text-blue-700 bg-blue-50 border-blue-200' },
  disetujui: { label: t('profile.status.approved', 'Disetujui'), color: 'text-green-700 bg-green-50 border-green-200' },
  ditolak: { label: t('profile.status.rejected', 'Ditolak'), color: 'text-red-700 bg-red-50 border-red-200' },
});

const INPUT = 'w-full rounded-lg border border-outline-variant/40 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E3B]/20 focus:border-[#2E5E3B] transition-colors';
const BTN_PRIMARY = 'bg-[#2E5E3B] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#244B2F] transition-colors disabled:opacity-50 flex items-center gap-2';
const BTN_GHOST = 'text-[#2E5E3B] text-sm font-bold px-4 py-2 rounded-xl border border-[#2E5E3B]/30 hover:bg-[#2E5E3B]/5 transition-colors flex items-center gap-1.5';
const BTN_DANGER = 'text-[#B3261E] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#B3261E]/10 transition-colors flex items-center gap-1';

// Sama persis dengan pilihan di halaman pendaftaran (Daftar.jsx) supaya
// data "Kriteria Profesional" yang diisi saat daftar tetap konsisten & bisa
// diedit lagi di sini.
const KRITERIA_OPTIONS = [
  'Tenaga Ahli',
  'Narasumber/Pembicara',
  'Peneliti',
  'Instruktur/Mentor',
];

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

// Bar navigasi "wizard" — dipakai di bawah setiap tab supaya user tahu ada
// langkah berikutnya, sekaligus bisa kembali ke tab sebelumnya. Warna tetap
// mengikuti palet utama web TenagaAhli (hijau #2E5E3B).
function WizardNav({ onBack, onNext, showBack = true, showNext = true, nextLabel = 'Lanjut', backLabel = 'Kembali' }) {
  return (
    <div className="flex items-center justify-between pt-2">
      {showBack ? (
        <button type="button" className={BTN_GHOST} onClick={onBack}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>{backLabel}
        </button>
      ) : <span />}
      {showNext && (
        <button type="button" className={BTN_PRIMARY} onClick={onNext}>
          {nextLabel}<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      )}
    </div>
  );
}

export default function ProfilSaya() {
  const { t } = useTranslation();
  const TABS = getTabs(t);
  const STATUS_PENGAJUAN_OPTS = getStatusPengajuan(t);

  const [tab, setTab] = useState('pribadi');
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  /* ── data pribadi form ────────────────────────────────────────── */
  const [form, setForm] = useState({
    name: '', institution: '', field: '', phone: '',
    tempat_lahir: '', tanggal_lahir: '',
    alamat_lengkap: '', alamat_kota: '', alamat_provinsi: '',
    location: '', lat: '', lng: '',
    catatan: '',
  });

  // Kriteria Profesional — sama seperti step "Data Pribadi" di form pendaftaran.
  const [kriteriaList, setKriteriaList] = useState([]);
  const [customKriteria, setCustomKriteria] = useState([]); // kriteria yang diketik sendiri oleh user
  const [customKriteriaInput, setCustomKriteriaInput] = useState('');

  const toggleKriteria = (option) => {
    setKriteriaList((prev) => prev.includes(option) ? prev.filter((k) => k !== option) : [...prev, option]);
  };

  const addCustomKriteria = () => {
    const value = customKriteriaInput.trim();
    if (!value) return;
    const allExisting = [...KRITERIA_OPTIONS, ...customKriteria].map((v) => v.toLowerCase());
    if (allExisting.includes(value.toLowerCase())) { setCustomKriteriaInput(''); return; }
    setCustomKriteria((prev) => [...prev, value]);
    setKriteriaList((prev) => [...prev, value]);
    setCustomKriteriaInput('');
  };

  const removeCustomKriteria = (value) => {
    setCustomKriteria((prev) => prev.filter((v) => v !== value));
    setKriteriaList((prev) => prev.filter((v) => v !== value));
  };

  /* ── profil bio form ──────────────────────────────────────────── */
  const [bioForm, setBioForm] = useState({
    tentang_saya: '',
    ringkasan_keahlian: '',
    bidang_utama: '',
    keahlian: '',
    spesialisasi: '',
    kompetensi: '',
  });

  /* ── link akademik form ────────────────────────────────────────── */
  const [akademikForm, setAkademikForm] = useState({
    scopus_url: '', scopus_metrics: '',
    google_scholar_url: '', google_scholar_metrics: '',
    sinta_url: '', sinta_metrics: '',
    orcid_url: '', orcid_metrics: '',
    researchgate_url: '', researchgate_metrics: '',
  });

  /* ── sub-resources ────────────────────────────────────────────── */
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [publikasi, setPublikasi] = useState([]);
  const [organisasi, setOrganisasi] = useState([]);
  const [reviewerJurnal, setReviewerJurnal] = useState([]);
  const [instruktur, setInstruktur] = useState([]);
  const [narasumber, setNarasumber] = useState([]);

  /* ── pengajuan state ──────────────────────────────────────────── */
  const [submissions, setSubmissions] = useState([]);
  const [addingSubmission, setAddingSubmission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    judul_pengajuan: '',
    jenis_pengajuan: '',
    provinsi: '',
    kabupaten_kota: '',
    nama_pemohon: '',
    instansi: '',
    penanggung_jawab: '',
  });
  const [dokumenPdf, setDokumenPdf] = useState(null);
  const [dokumenWord, setDokumenWord] = useState(null);
  const [dokumenZip, setDokumenZip] = useState(null);
  const dokumenPdfRef = useRef();
  const dokumenWordRef = useRef();
  const dokumenZipRef = useRef();

  /* ── inline edit state ────────────────────────────────────────── */
  const [editEdu, setEditEdu] = useState(null); // { id, ...fields }
  const [editExp, setEditExp] = useState(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [addingExp, setAddingExp] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [addingPub, setAddingPub] = useState(false);
  const [addingOrg, setAddingOrg] = useState(false);
  const [addingRev, setAddingRev] = useState(false);
  const [addingIns, setAddingIns] = useState(false);
  const [addingNara, setAddingNara] = useState(false);

  const [newEdu, setNewEdu] = useState({ jenjang: '', institusi: '', jurusan: '', tahun_lulus: '' });
  const [newExp, setNewExp] = useState({ posisi: '', instansi: '', tahun_mulai: '', tahun_selesai: '', deskripsi: '' });
  const [newCert, setNewCert] = useState({ nama_sertifikat: '', penerbit: '', tahun: '' });
  const [newPub, setNewPub] = useState({ jenis: '', judul: '', penerbit: '', tahun: '', link: '' });
  const [newOrg, setNewOrg] = useState({ nama: '', jabatan: '', periode: '', kontribusi: '' });
  const [newRev, setNewRev] = useState({ nama: '', institusi: '', bidang: '', periode: '' });
  const [newIns, setNewIns] = useState({ nama: '', materi: '', penyelenggara: '', peran: '', tahun: '' });
  const [newNara, setNewNara] = useState({ title: '', penyelenggara: '', tempat: '', tanggal: '' });

  /* ── upload refs ──────────────────────────────────────────────── */
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  /* ── photo modal (WhatsApp style) ──────────────────────────────── */
  const [photoModal, setPhotoModal] = useState(false);
  const [fullPhotoView, setFullPhotoView] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiFileName, setBuktiFileName] = useState('');
  const photoRef = useRef();
  const cameraRef = useRef(); // Ref untuk input kamera
  const coverRef = useRef(); // Ref untuk cover photo
  const cvRef = useRef();
  const buktiRef = useRef();

  /* ── map picker state ──────────────────────────────────────────── */
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapMarker, setMapMarker] = useState(null);
  const mapRef = useRef();
  // Snapshot lokasi sebelum modal peta dibuka, dipakai untuk "revert" saat
  // user menekan Batal / menutup modal tanpa menekan "Pilih Lokasi Ini".
  const [originalLocation, setOriginalLocation] = useState(null);

  const flash = (type, msg) => {
    if (type === 'ok') { setOk(msg); setErr(''); }
    else { setErr(msg); setOk(''); }
    setTimeout(() => { setOk(''); setErr(''); }, 4000);
  };

  /* ── wizard navigation ───────────────────────────────────────────
     Memungkinkan user berpindah antar-tab secara berurutan lewat tombol
     "Lanjut" / "Kembali" di bagian bawah setiap tab, selain lewat klik
     langsung di tab bar. */
  const currentTabIdx = TABS.findIndex((t) => t.id === tab);
  const goNext = () => {
    if (currentTabIdx < TABS.length - 1) {
      setTab(TABS[currentTabIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goPrev = () => {
    if (currentTabIdx > 0) {
      setTab(TABS[currentTabIdx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── kelengkapan profil ───────────────────────────────────────────
     Dipakai sebagai syarat sebelum tombol "Kirim Pengajuan" ke admin
     bisa ditekan. Juga dipakai untuk memberi tanda centang di tab bar. */
  const profileCompleteness = {
    pribadi: !!(form.name && form.phone),
    profilBio: !!(bioForm.tentang_saya && bioForm.bidang_utama),
    pendidikan: educations.length > 0,
    pengalaman: experiences.length > 0,
    fotoProfil: !!photoPreview,
  };
  const missingSteps = [
    !profileCompleteness.pribadi && 'Data Pribadi (nama & no. HP wajib diisi)',
    !profileCompleteness.profilBio && 'Profil Bio (tentang saya & bidang utama)',
    !profileCompleteness.pendidikan && 'Pendidikan (minimal 1 data)',
    !profileCompleteness.pengalaman && 'Pengalaman (minimal 1 data)',
    !profileCompleteness.fotoProfil && 'Foto Profil',
  ].filter(Boolean);
  const isProfileComplete = missingSteps.length === 0;

  // Helper untuk generate URL file yang benar.
  // PENTING: pakai VITE_BACKEND_URL (tanpa suffix /api), bukan VITE_API_URL
  // (yang isinya .../api) — kalau salah pakai VITE_API_URL, URL file jadi
  // http://localhost:8000/api/storage/... yang 404 karena ada /api nyempil.
  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${filePath}`;
  };

  // Sinkronkan data user (khususnya foto profil) yang baru saja diambil dari
  // server ke localStorage['amdal_user'], lalu beri tahu komponen lain
  // (mis. Navbar) supaya ikut refresh tanpa perlu logout/login ulang.
  // Tanpa ini, Navbar akan terus menampilkan foto lama karena dia hanya
  // baca localStorage, bukan API /my/profile.
  const syncUserToLocalStorage = (d, resolvedPhotoUrl) => {
    try {
      const raw = localStorage.getItem('amdal_user');
      if (!raw) return; // belum login / tidak ada sesi tersimpan

      const storedUser = JSON.parse(raw);

      // PENTING: Simpan URL foto yang sudah resolved (dengan domain lengkap)
      // supaya Navbar bisa langsung pakai tanpa perlu resolve lagi
      const updatedUser = {
        ...storedUser,
        name: d.name ?? storedUser.name,
        email: d.email ?? storedUser.email,
        avatar_url: resolvedPhotoUrl,
        foto: resolvedPhotoUrl,
      };

      localStorage.setItem('amdal_user', JSON.stringify(updatedUser));

      // Dispatch event supaya Navbar dan komponen lain tahu ada update
      console.log('📸 Foto profil diupdate di localStorage:', resolvedPhotoUrl);
      window.dispatchEvent(new Event('amdal-user-updated'));
    } catch (e) {
      console.error('Gagal sinkronkan data user ke localStorage', e);
    }
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
        tanggal_lahir: d.tanggal_lahir ? d.tanggal_lahir.toString().slice(0, 10) : '',
        alamat_lengkap: d.alamat_lengkap || '',
        alamat_kota: d.alamat_kota || '',
        alamat_provinsi: d.alamat_provinsi || '',
        location: d.location || '',
        lat: d.lat || '',
        lng: d.lng || '',
        catatan: d.catatan || '',
      });

      // Kriteria Profesional yang diisi saat pendaftaran (kriteria_list) —
      // pisahkan pilihan bawaan vs yang diketik sendiri oleh user supaya
      // keduanya tetap tercermin di checklist.
      const kriteriaFromServer = Array.isArray(d.kriteria_list) ? d.kriteria_list : [];
      setKriteriaList(kriteriaFromServer);
      setCustomKriteria(kriteriaFromServer.filter((k) => !KRITERIA_OPTIONS.includes(k)));

      setBioForm({
        tentang_saya: d.tentang_saya || '',
        ringkasan_keahlian: d.ringkasan_keahlian || '',
        bidang_utama: Array.isArray(d.bidang_utama) ? d.bidang_utama.join(', ') : (d.bidang_utama || ''),
      });

      setAkademikForm({
        scopus_url: d.scopus_url || '',
        scopus_metrics: d.scopus_metrics || '',
        google_scholar_url: d.google_scholar_url || '',
        google_scholar_metrics: d.google_scholar_metrics || '',
        sinta_url: d.sinta_url || '',
        sinta_metrics: d.sinta_metrics || '',
        orcid_url: d.orcid_url || '',
        orcid_metrics: d.orcid_metrics || '',
        researchgate_url: d.researchgate_url || '',
        researchgate_metrics: d.researchgate_metrics || '',
      });

      const docs = d.documents || [];

      // Foto profil bisa datang dari 2 tempat: kolom `photo` pada data expert,
      // atau dari daftar dokumen (type = 'foto_profil') kalau backend belum
      // sinkron menulis ke kolom `photo`. Ambil sumber yang tersedia, dan
      // SELALU set preview (termasuk ke null) supaya tidak ada foto lama /
      // foto yang sudah dihapus yang "nyangkut" di layar.
      const photoDoc = docs.find((doc) => doc.type === 'foto_profil');
      const photoSource = d.photo || photoDoc?.file_path || photoDoc?.file_url;

      let resolvedPhotoUrl = null;
      if (photoSource) {
        // Cache-buster supaya browser tidak menampilkan foto lama dari cache
        // saat file diganti dengan nama yang sama.
        resolvedPhotoUrl = `${getFileUrl(photoSource)}?t=${Date.now()}`;
        setPreview(resolvedPhotoUrl);
      } else {
        setPreview(null);
      }

      // Foto cover - dari kolom `cover` pada data expert
      const coverSource = d.cover;
      if (coverSource) {
        const resolvedCoverUrl = `${getFileUrl(coverSource)}?t=${Date.now()}`;
        setCoverPreview(resolvedCoverUrl);
      } else {
        setCoverPreview(null);
      }

      // Populate sub-resources dari data pendaftaran
      setEducations(d.educations || []);
      setExperiences(d.experiences || []);
      setCertificates(d.certificates || []);
      setDocuments(docs);
      setPublikasi(d.publikasi || []);
      setOrganisasi(d.organisasi || []);
      setReviewerJurnal(d.reviewer_jurnal || d.reviewerJurnal || []);
      setInstruktur(d.instruktur || []);
      setNarasumber(d.narasumber || []);

      // Sinkronkan ke localStorage supaya Navbar (dan komponen lain yang
      // baca amdal_user) ikut menampilkan foto & nama terbaru.
      syncUserToLocalStorage(d, resolvedPhotoUrl);
    } catch { setErr('Gagal memuat data profil.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* ── handlers: data pribadi ──────────────────────────────────── */
  const savePribadi = async () => {
    setSaving(true);
    try {
      await api.post('/my/profile', { ...form, kriteria_list: kriteriaList });
      flash('ok', 'Data pribadi berhasil disimpan.');
      load();
    } catch (e) { flash('err', e.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  /* ── handlers: profil bio ────────────────────────────────────── */
  const saveProfilBio = async () => {
    setSaving(true);
    try {
      // Convert bidang_utama dari string ke array
      const payload = {
        ...bioForm,
        bidang_utama: bioForm.bidang_utama ? bioForm.bidang_utama.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await api.post('/my/profile', payload);
      flash('ok', 'Profil bio berhasil disimpan.');
      load();
    } catch (e) { flash('err', e.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  /* ── handlers: link akademik ──────────────────────────────────── */
  const saveLinkAkademik = async () => {
    setSaving(true);
    try {
      await api.post('/my/profile', akademikForm);
      flash('ok', 'Link akademik berhasil disimpan.');
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
      setNewEdu({ jenjang: '', institusi: '', jurusan: '', tahun_lulus: '' });
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
      setNewExp({ posisi: '', instansi: '', tahun_mulai: '', tahun_selesai: '', deskripsi: '' });
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
      setNewCert({ nama_sertifikat: '', penerbit: '', tahun: '' });
      setAddingCert(false); load();
    } catch { flash('err', 'Gagal menambah sertifikat.'); }
    finally { setSaving(false); }
  };

  const deleteCert = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try { await api.delete(`/my/certificates/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: publikasi ─────────────────────────────────────── */
  const addPub = async () => {
    if (!newPub.judul) return flash('err', 'Judul publikasi wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/publikasi', newPub);
      flash('ok', 'Publikasi ditambahkan.');
      setNewPub({ jenis: '', judul: '', penerbit: '', tahun: '', link: '' });
      setAddingPub(false); load();
    } catch { flash('err', 'Gagal menambah publikasi.'); }
    finally { setSaving(false); }
  };
  const deletePub = async (id) => {
    if (!confirm('Hapus publikasi ini?')) return;
    try { await api.delete(`/my/publikasi/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: organisasi ────────────────────────────────────── */
  const addOrg = async () => {
    if (!newOrg.nama) return flash('err', 'Nama organisasi wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/organisasi', newOrg);
      flash('ok', 'Organisasi ditambahkan.');
      setNewOrg({ nama: '', jabatan: '', periode: '', kontribusi: '' });
      setAddingOrg(false); load();
    } catch { flash('err', 'Gagal menambah organisasi.'); }
    finally { setSaving(false); }
  };
  const deleteOrg = async (id) => {
    if (!confirm('Hapus data organisasi ini?')) return;
    try { await api.delete(`/my/organisasi/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: reviewer jurnal ────────────────────────────────── */
  const addRev = async () => {
    if (!newRev.nama) return flash('err', 'Nama jurnal wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/reviewer-jurnal', newRev);
      flash('ok', 'Reviewer jurnal ditambahkan.');
      setNewRev({ nama: '', institusi: '', bidang: '', periode: '' });
      setAddingRev(false); load();
    } catch { flash('err', 'Gagal menambah data.'); }
    finally { setSaving(false); }
  };
  const deleteRev = async (id) => {
    if (!confirm('Hapus data reviewer jurnal ini?')) return;
    try { await api.delete(`/my/reviewer-jurnal/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: instruktur / trainer ──────────────────────────── */
  const addIns = async () => {
    if (!newIns.nama) return flash('err', 'Nama kegiatan wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/instruktur', newIns);
      flash('ok', 'Riwayat instruktur ditambahkan.');
      setNewIns({ nama: '', materi: '', penyelenggara: '', peran: '', tahun: '' });
      setAddingIns(false); load();
    } catch { flash('err', 'Gagal menambah data.'); }
    finally { setSaving(false); }
  };
  const deleteIns = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try { await api.delete(`/my/instruktur/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: kirim verifikasi ──────────────────────────────── */
  const submitVerification = async () => {
    if (!isProfileComplete) {
      return flash('err', 'Lengkapi profil Anda terlebih dahulu (semua langkah harus centang hijau) sebelum mengirim verifikasi.');
    }

    setSubmitting(true);
    try {
      await api.post('/my/profile/submit');
      flash('ok', 'Profil berhasil dikirim. Menunggu review admin.');
      load(); // Refresh data to update status
    } catch (e) {
      flash('err', e.response?.data?.message || 'Gagal mengirim verifikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── handlers: narasumber ─────────────────────────────────────── */
  const addNara = async () => {
    if (!newNara.title) return flash('err', 'Judul kegiatan wajib diisi.');
    setSaving(true);
    try {
      await api.post('/my/narasumber', newNara);
      flash('ok', 'Riwayat narasumber ditambahkan.');
      setNewNara({ title: '', penyelenggara: '', tempat: '', tanggal: '' });
      setAddingNara(false); load();
    } catch { flash('err', 'Gagal menambah data.'); }
    finally { setSaving(false); }
  };
  const deleteNara = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try { await api.delete(`/my/narasumber/${id}`); flash('ok', 'Dihapus.'); load(); }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  /* ── handlers: map picker ──────────────────────────────────────── */
  // CATATAN PERBAIKAN (fix peta tidak muncul):
  // Sebelumnya inisialisasi peta dilakukan lewat setTimeout tebak-tebakan
  // (350ms) di dalam openMapPicker. Masalahnya: kalau animasi modal lebih
  // lambat dari itu (device lemot, dsb), container masih 0x0 saat L.map()
  // dipanggil sehingga tile Leaflet gagal ter-render walau invalidateSize()
  // sudah dipanggil setelahnya.
  //
  // Solusi: pindahkan inisialisasi peta ke useEffect yang jalan begitu
  // mapPickerOpen = true DAN mapRef.current sudah ada di DOM, lalu pasang
  // ResizeObserver supaya invalidateSize() dipanggil persis saat container
  // benar-benar mendapat ukuran akhirnya (bukan menebak durasi animasi).
  //
  // JANGAN LUPA: tambahkan juga CSS berikut di file CSS global (mis.
  // src/index.css), karena Tailwind preflight men-set `img { max-width:
  // 100% }` secara global yang membuat tile Leaflet (yang butuh ukuran
  // pasti 256x256) menjadi tidak ter-render / terlihat kosong:
  //
  //   .leaflet-container { height: 100%; width: 100%; }
  //   .leaflet-container img { max-width: none !important; }
  //
  // CATATAN PERBAIKAN #2 (tile tetap blank walau container sudah benar):
  // Leaflet melakukan fade-in tile dari opacity 0 -> 1 lewat class
  // `.leaflet-tile-loaded`. Kalau CSS bawaan leaflet.css belum sempat
  // diterapkan browser (mis. karena lazy-loading/code-splitting halaman
  // ini), transisi opacity itu bisa "macet" di 0 walau tile sudah benar2
  // selesai di-load (network request sukses, elemen <img> ada di DOM).
  // Kita paksa opacity tile = 1 secara eksplisit sebagai jaring pengaman,
  // supaya kasus ini tidak membuat peta terlihat blank/putih.
  const forceTileVisibility = () => {
    if (!mapRef.current) return;
    mapRef.current.querySelectorAll('.leaflet-tile').forEach((img) => {
      img.style.opacity = '1';
    });
  };

  const openMapPicker = () => {
    // Simpan snapshot lokasi SEBELUM modal dibuka, supaya bisa di-revert
    // kalau user menekan Batal / menutup modal tanpa konfirmasi.
    setOriginalLocation({ lat: form.lat, lng: form.lng, location: form.location });
    setMapPickerOpen(true);
  };

  useEffect(() => {
    if (!mapPickerOpen || !mapRef.current || mapInstance) return;

    const defaultLat = form.lat || -6.9;
    const defaultLng = form.lng || 107.2;

    const instance = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], form.lat ? 13 : 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(instance);

    // Jaring pengaman: paksa tile terlihat begitu selesai load, untuk
    // menghindari kasus fade-in opacity yang macet (lihat catatan di atas).
    instance.on('tileload', forceTileVisibility);
    instance.whenReady(forceTileVisibility);

    let marker = null;
    if (form.lat && form.lng) {
      marker = L.marker([form.lat, form.lng], { draggable: true }).addTo(instance);
      setMapMarker(marker);
      marker.on('dragend', function () {
        const position = marker.getLatLng();
        updateLocationFromCoords(position.lat, position.lng);
      });
    }

    instance.on('click', function (e) {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { draggable: true }).addTo(instance);
        setMapMarker(marker);
        marker.on('dragend', function () {
          const position = marker.getLatLng();
          updateLocationFromCoords(position.lat, position.lng);
        });
      }
      updateLocationFromCoords(e.latlng.lat, e.latlng.lng);
    });

    // PENTING: paksa Leaflet menghitung ulang ukuran tile begitu container
    // benar-benar mendapat ukuran akhirnya. Lebih andal dibanding
    // setTimeout tebak-tebakan karena ResizeObserver bereaksi terhadap
    // perubahan ukuran nyata, bukan menebak durasi animasi.
    const ro = new ResizeObserver(() => {
      instance.invalidateSize();
      forceTileVisibility();
    });
    ro.observe(mapRef.current);
    // Panggil sekali di awal juga untuk jaga-jaga.
    requestAnimationFrame(() => {
      instance.invalidateSize();
      forceTileVisibility();
    });

    setMapInstance(instance);

    return () => {
      ro.disconnect();
      instance.off('tileload', forceTileVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPickerOpen]);

  const updateLocationFromCoords = (lat, lng) => {
    setForm(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      location: `${prev.alamat_kota || ''}, ${prev.alamat_provinsi || ''}`.trim().replace(/^,\s*|,\s*$/, '') || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
    }));
  };

  // closeMapPicker: HANYA membersihkan/unmount instance peta. Tidak
  // mengubah data form sama sekali. Dipanggil secara internal oleh
  // cancelMapPicker() (revert data) dan saveMapLocation() (commit data).
  const closeMapPicker = () => {
    setMapPickerOpen(false);
    if (mapInstance) {
      mapInstance.remove();
      setMapInstance(null);
      setMapMarker(null);
    }
  };

  // cancelMapPicker: dipakai oleh tombol "Batal", tombol X, dan klik di
  // area backdrop/luar modal. Mengembalikan form.lat/lng/location ke nilai
  // SEBELUM modal dibuka, supaya klik/drag yang sempat dilakukan user di
  // peta tidak "nyangkut" walau dia membatalkan pemilihan lokasi.
  const cancelMapPicker = () => {
    if (originalLocation) {
      setForm(prev => ({
        ...prev,
        lat: originalLocation.lat,
        lng: originalLocation.lng,
        location: originalLocation.location,
      }));
    }
    closeMapPicker();
  };

  // saveMapLocation: dipakai oleh tombol "Pilih Lokasi Ini". Data di form
  // sudah ter-update secara live lewat updateLocationFromCoords() setiap
  // kali user klik/drag di peta, jadi di sini cukup tutup modal saja
  // (tanpa revert).
  const saveMapLocation = () => {
    closeMapPicker();
    flash('ok', 'Lokasi berhasil dipilih. Jangan lupa klik "Simpan Data Pribadi"');
  };

  /* ── handlers: dokumen & foto ────────────────────────────────── */
  const uploadDoc = async (file, type, label, resetFn) => {
    if (!file) return;

    // Validasi ukuran file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      flash('err', 'Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('label', label);
      fd.append('file', file);

      const response = await api.post('/my/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload response:', response.data);

      flash('ok', `${label} berhasil diunggah.`);

      // Reset input file terlebih dahulu
      resetFn();

      // Reload data - backend sudah update kolom photo di Expert jika type=foto_profil.
      // load() juga akan sinkronkan foto/nama terbaru ke localStorage & Navbar.
      await load();

      // PENTING: Dispatch event SETELAH load() selesai
      // supaya data di localStorage sudah benar-benar terupdate
      window.dispatchEvent(new Event('amdal-user-updated'));
      console.log('✅ Event amdal-user-updated dispatched setelah upload foto');

      // Jika foto profil, reload page setelah 500ms supaya navbar terupdate pasti
      if (type === 'foto_profil') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (e) {
      flash('err', e.response?.data?.message || `Gagal mengunggah ${label}.`);
    }
    finally { setSaving(false); }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      await api.delete(`/my/documents/${id}`);
      flash('ok', 'Dokumen dihapus.');
      load();
    }
    catch { flash('err', 'Gagal menghapus.'); }
  };

  // Delete foto profil
  const deletePhoto = async () => {
    if (!confirm('Hapus foto profil?')) return;
    setSaving(true);
    try {
      await api.put('/my/profile', { photo: null });
      flash('ok', 'Foto profil dihapus.');
      setPhotoModal(false);
      await load();
    }
    catch { flash('err', 'Gagal menghapus foto.'); }
    finally { setSaving(false); }
  };

  // Ganti foto profil (trigger input)
  const triggerPhotoInput = () => {
    setPhotoModal(false);
    if (photoRef.current) photoRef.current.click();
  };

  // Ambil foto dari kamera
  const triggerCamera = () => {
    setPhotoModal(false);
    setCameraOpen(true);
  };

  // Callback setelah foto diambil dari kamera
  const handleCameraCapture = (blob) => {
    const imageUrl = URL.createObjectURL(blob);
    setImageToCrop(imageUrl);
    setCameraOpen(false);
    setCropperOpen(true);
  };

  // Cancel camera
  const handleCameraCancel = () => {
    setCameraOpen(false);
  };

  // Lihat foto profil fullscreen
  const viewFullPhoto = () => {
    setPhotoModal(false);
    setFullPhotoView(true);
  };

  // Helper untuk menampilkan file yang dipilih
  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      // Validasi tipe file
      if (!f.type.match(/image\/(jpeg|jpg|png)/)) {
        flash('err', 'Format file harus JPG atau PNG.');
        return;
      }
      // Validasi ukuran (2MB untuk foto)
      if (f.size > 2 * 1024 * 1024) {
        flash('err', 'Ukuran foto maksimal 2MB.');
        return;
      }

      // Buka cropper
      const imageUrl = URL.createObjectURL(f);
      setImageToCrop(imageUrl);
      setCropperOpen(true);
    }
  };

  // Callback setelah crop selesai
  const handleCropComplete = (croppedBlob) => {
    // Convert blob to File object
    const croppedFile = new File([croppedBlob], 'profile-photo.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    setPhotoFile(croppedFile);
    setPreview(URL.createObjectURL(croppedBlob));
    setCropperOpen(false);

    // Clean up
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
  };

  // Cancel cropping
  const handleCropCancel = () => {
    setCropperOpen(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
    // Reset file input
    if (photoRef.current) {
      photoRef.current.value = '';
    }
  };

  const handleCvChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        flash('err', 'Format CV harus PDF.');
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        flash('err', 'Ukuran file CV maksimal 5MB.');
        return;
      }
      setCvFile(f);
      setCvFileName(f.name);
    }
  };

  const handleBuktiChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(f.type)) {
        flash('err', 'Format file harus PDF, JPG, atau PNG.');
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        flash('err', 'Ukuran file maksimal 5MB.');
        return;
      }
      setBuktiFile(f);
      setBuktiFileName(f.name);
    }
  };

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      // Validasi tipe file
      if (!f.type.match(/image\/(jpeg|jpg|png)/)) {
        flash('err', 'Format file harus JPG atau PNG.');
        return;
      }
      // Validasi ukuran (5MB untuk cover)
      if (f.size > 5 * 1024 * 1024) {
        flash('err', 'Ukuran foto cover maksimal 5MB.');
        return;
      }

      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  const uploadCover = async () => {
    if (!coverFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('cover', coverFile);

      await api.post('/my/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      flash('ok', 'Foto cover berhasil diupload.');
      setCoverFile(null);
      if (coverRef.current) coverRef.current.value = '';
      await load();
    } catch (e) {
      flash('err', e.response?.data?.message || 'Gagal mengupload foto cover.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCover = async () => {
    if (!confirm('Hapus foto cover?')) return;
    setSaving(true);
    try {
      await api.post('/my/profile', { cover: null });
      flash('ok', 'Foto cover dihapus.');
      setCoverPreview(null);
      await load();
    } catch {
      flash('err', 'Gagal menghapus foto cover.');
    } finally {
      setSaving(false);
    }
  };

  /* ── loading ─────────────────────────────────────────────────── */
  if (loading) return (
    <DashboardLayout title={t('Profil Saya')}>
      <div className="flex items-center gap-3 text-[#5B6660]">
        <span className="w-5 h-5 rounded-full border-2 border-[#2E5E3B]/30 border-t-[#2E5E3B] animate-spin" />
        
                      {t('Memuat profil...')}
                    </div>
    </DashboardLayout>
  );

  const profileStatus = expert?.profile_status || 'draft';

  return (
    <DashboardLayout title={t('Profil Saya')} subtitle="Kelola data, riwayat, dan dokumen profil tenaga ahli Anda.">
      {/* ── Status Banner ─────────────────────────────────────── */}
      {profileStatus === 'ditolak' && expert?.reject_reason && (
        <div className="mb-5 bg-[#FFDAD6] border border-[#FFB4AB] rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#B3261E] text-[20px] shrink-0 mt-0.5">error</span>
          <div>
            <p className="font-bold text-[#93000A] text-sm mb-1">{t('Profil Ditolak — Harap Diperbaiki')}</p>
            <p className="text-sm text-[#410002]">{expert.reject_reason}</p>
          </div>
        </div>
      )}
      {profileStatus === 'aktif' && (
        <div className="mb-5 bg-[#E3F2E7] border border-[#A7D7B0] rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#2E5E3B] text-[20px]">verified</span>
          <p className="text-sm font-semibold text-[#1C3822]">{t('Profil aktif — perubahan akan ditinjau ulang oleh admin.')}</p>
        </div>
      )}

      <Alert type="error" msg={err} onClose={() => setErr('')} />
      <Alert type="ok" msg={ok} onClose={() => setOk('')} />

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-outline-variant/20">
        {TABS.map((t) => {
          const doneKey =
            t.id === 'profil-bio' ? 'profilBio' :
            t.id === 'dokumen' ? 'fotoProfil' :
            t.id;
          const done = !!profileCompleteness[doneKey];
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${tab === t.id
                  ? 'border-[#2E5E3B] text-[#2E5E3B] bg-[#2E5E3B]/5'
                  : 'border-transparent text-[#5B6660] hover:text-[#2E5E3B] hover:bg-[#2E5E3B]/5'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
              {done && (
                <span className="material-symbols-outlined text-[15px] text-[#2E5E3B]">check_circle</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: DATA PRIBADI                                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pribadi' && (
        <div className="space-y-6 animate-fadeIn">
          <Card>
            <SectionTitle icon="badge">{t('Identitas & Profesi')}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>{t('Nama Lengkap *')}</Label>
                <input className={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('Dr. Nama Anda, S.Hut, M.Si')} /></div>
              <div><Label>{t('No. HP / WhatsApp *')}</Label>
                <PhoneInput
                  value={form.phone}
                  onChange={(val) => setForm({ ...form, phone: val })}
                  placeholder="81234567890"
                  required
                />
              </div>
              <div><Label>{t('Institusi / Perusahaan')}</Label>
                <input className={INPUT} value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder={t('PSL - IPB University')} /></div>
              <div><Label>{t('Bidang Keahlian')}</Label>
                <input className={INPUT} value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} placeholder={t('Ahli Kehutanan & Tata Ruang')} /></div>
              <div><Label>{t('Tempat Lahir')}</Label>
                <input className={INPUT} value={form.tempat_lahir} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })} placeholder={t('Jakarta')} /></div>
              <div><Label>{t('Tanggal Lahir')}</Label>
                <input type="date" className={INPUT} value={form.tanggal_lahir} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })} /></div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="location_on">{t('Alamat')}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>{t('Alamat Lengkap')}</Label>
                <textarea className={INPUT + ' min-h-[80px] resize-none'} value={form.alamat_lengkap} onChange={e => setForm({ ...form, alamat_lengkap: e.target.value })} placeholder={t('Jl. Contoh No. 4, Kecamatan...')} /></div>
              <div><Label>{t('Kota / Kabupaten')}</Label>
                <input className={INPUT} value={form.alamat_kota} onChange={e => setForm({ ...form, alamat_kota: e.target.value })} placeholder={t('Kota Bogor')} /></div>
              <div><Label>{t('Provinsi')}</Label>
                <input className={INPUT} value={form.alamat_provinsi} onChange={e => setForm({ ...form, alamat_provinsi: e.target.value })} placeholder={t('Jawa Barat')} /></div>

              {/* Location Picker */}
              <div className="md:col-span-2 mt-4">
                <Label>{t('Lokasi pada Peta (untuk ditampilkan di pencarian)')}</Label>
                <div className="flex flex-col gap-2">
                  {form.lat && form.lng && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span>{t('Koordinat:')} {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}</span>
                      {form.location && <span className="text-gray-400">• {form.location}</span>}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={openMapPicker}
                    className="flex items-center gap-2 text-sm font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    {form.lat && form.lng ? 'Ubah Lokasi di Peta' : 'Pilih Lokasi di Peta'}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="checklist">{t('Kriteria Profesional')}</SectionTitle>
            <p className="text-sm text-gray-600 mb-4">{t('Sama seperti yang diisi saat pendaftaran — pilih semua yang sesuai, atau tambahkan kriteria Anda sendiri.')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KRITERIA_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${kriteriaList.includes(option)
                      ? 'border-[#2E5E3B] bg-[#2E5E3B]/5'
                      : 'border-outline-variant/40 hover:border-[#2E5E3B]/30'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={kriteriaList.includes(option)}
                    onChange={() => toggleKriteria(option)}
                    className="accent-[#2E5E3B] w-4 h-4 shrink-0"
                  />
                  <span className={`text-sm ${kriteriaList.includes(option) ? 'text-[#2E5E3B] font-semibold' : 'text-[#414844]'}`}>
                    {option}
                  </span>
                </label>
              ))}

              {customKriteria.map((option) => (
                <div key={option} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border-2 border-[#2E5E3B] bg-[#2E5E3B]/5">
                  <label className="flex items-center gap-3 min-w-0 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={kriteriaList.includes(option)}
                      onChange={() => toggleKriteria(option)}
                      className="accent-[#2E5E3B] w-4 h-4 shrink-0"
                    />
                    <span className="text-sm text-[#2E5E3B] font-semibold truncate">{option}</span>
                  </label>
                  <button type="button" onClick={() => removeCustomKriteria(option)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                placeholder={t('Tambahkan kriteria lain (mis. Auditor Lingkungan)')}
                value={customKriteriaInput}
                onChange={(e) => setCustomKriteriaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomKriteria(); } }}
                className={INPUT}
              />
              <button
                type="button"
                onClick={addCustomKriteria}
                disabled={!customKriteriaInput.trim()}
                className="shrink-0 flex items-center gap-1 bg-[#2E5E3B] text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#244B2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>{t('Tambah')}
                                            </button>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="note_alt">{t('Catatan')}</SectionTitle>
            <textarea
              className={INPUT + ' min-h-[100px] resize-none'}
              value={form.catatan}
              onChange={e => setForm({ ...form, catatan: e.target.value })}
              placeholder={t('Ceritakan secara singkat pengalaman profesional Anda sebagai tenaga ahli, konsultan, narasumber, atau peneliti...')}
            />
          </Card>

          <div className="flex items-center justify-end gap-3">
            <button className={BTN_PRIMARY} onClick={savePribadi} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
              {saving ? 'Menyimpan...' : 'Simpan Data Pribadi'}
            </button>
            <button className={BTN_GHOST} onClick={goNext}>
              
                                        {t('Lanjut')}<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PROFIL BIO                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'profil-bio' && (
        <div className="space-y-6 animate-fadeIn">
          <Card>
            <SectionTitle icon="description">{t('Profil Bio')}</SectionTitle>
            <div className="space-y-4">
              <div>
                <Label>{t('Tentang Saya')}</Label>
                <textarea
                  className={INPUT + ' min-h-[120px] resize-none'}
                  value={bioForm.tentang_saya}
                  onChange={e => setBioForm({ ...bioForm, tentang_saya: e.target.value })}
                  placeholder={t('Ceritakan tentang diri Anda, latar belakang profesional, dan pencapaian utama...')}
                />
              </div>
              <div>
                <Label>{t('Ringkasan Keahlian')}</Label>
                <textarea
                  className={INPUT + ' min-h-[80px] resize-none'}
                  value={bioForm.ringkasan_keahlian}
                  onChange={e => setBioForm({ ...bioForm, ringkasan_keahlian: e.target.value })}
                  placeholder={t('Ringkasan singkat keahlian dan spesialisasi Anda...')}
                />
              </div>
              <div>
                <Label>{t('Bidang Utama (pisahkan dengan koma)')}</Label>
                <input
                  className={INPUT}
                  value={bioForm.bidang_utama}
                  onChange={e => setBioForm({ ...bioForm, bidang_utama: e.target.value })}
                  placeholder={t('Contoh: KLHS, Tata Ruang, Pemodelan Sistem')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('Pisahkan setiap bidang dengan koma (,)')}</p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <button className={BTN_GHOST} onClick={goPrev}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>{t('Kembali')}
                                      </button>
            <div className="flex items-center gap-3">
              <button className={BTN_PRIMARY} onClick={saveProfilBio} disabled={saving}>
                <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
                {saving ? 'Menyimpan...' : 'Simpan Profil Bio'}
              </button>
              <button className={BTN_GHOST} onClick={goNext}>
                
                                              {t('Lanjut')}<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: LINK AKADEMIK                                      */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'akademik' && (
        <div className="space-y-6 animate-fadeIn">
          <Card>
            <SectionTitle icon="link">{t('Link Profil Akademik')}</SectionTitle>
            <p className="text-sm text-gray-600 mb-4">{t('Tambahkan link ke profil akademik Anda untuk meningkatkan kredibilitas.')}</p>

            <div className="space-y-5">
              {/* Scopus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>{t('Scopus URL')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.scopus_url}
                    onChange={e => setAkademikForm({ ...akademikForm, scopus_url: e.target.value })}
                    placeholder={t('https://www.scopus.com/authid/detail.uri?authorId=...')}
                  />
                </div>
                <div>
                  <Label>{t('Scopus Metrics (opsional)')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.scopus_metrics}
                    onChange={e => setAkademikForm({ ...akademikForm, scopus_metrics: e.target.value })}
                    placeholder={t('Contoh: H-index 8 · 24 dokumen')}
                  />
                </div>
              </div>

              {/* Google Scholar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>{t('Google Scholar URL')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.google_scholar_url}
                    onChange={e => setAkademikForm({ ...akademikForm, google_scholar_url: e.target.value })}
                    placeholder={t('https://scholar.google.com/citations?user=...')}
                  />
                </div>
                <div>
                  <Label>{t('Google Scholar Metrics (opsional)')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.google_scholar_metrics}
                    onChange={e => setAkademikForm({ ...akademikForm, google_scholar_metrics: e.target.value })}
                    placeholder={t('Contoh: 312 sitasi')}
                  />
                </div>
              </div>

              {/* SINTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>{t('SINTA URL')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.sinta_url}
                    onChange={e => setAkademikForm({ ...akademikForm, sinta_url: e.target.value })}
                    placeholder={t('https://sinta.kemdikbud.go.id/authors/profile/...')}
                  />
                </div>
                <div>
                  <Label>{t('SINTA Metrics (opsional)')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.sinta_metrics}
                    onChange={e => setAkademikForm({ ...akademikForm, sinta_metrics: e.target.value })}
                    placeholder={t('Contoh: Skor SINTA 3 · S3')}
                  />
                </div>
              </div>

              {/* ORCID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>{t('ORCID URL')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.orcid_url}
                    onChange={e => setAkademikForm({ ...akademikForm, orcid_url: e.target.value })}
                    placeholder={t('https://orcid.org/0000-0002-XXXX-XXXX')}
                  />
                </div>
                <div>
                  <Label>{t('ORCID Metrics (opsional)')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.orcid_metrics}
                    onChange={e => setAkademikForm({ ...akademikForm, orcid_metrics: e.target.value })}
                    placeholder={t('Contoh: 0000-0002-XXXX-XXXX')}
                  />
                </div>
              </div>

              {/* ResearchGate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>{t('ResearchGate URL')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.researchgate_url}
                    onChange={e => setAkademikForm({ ...akademikForm, researchgate_url: e.target.value })}
                    placeholder={t('https://www.researchgate.net/profile/...')}
                  />
                </div>
                <div>
                  <Label>{t('ResearchGate Metrics (opsional)')}</Label>
                  <input
                    className={INPUT}
                    value={akademikForm.researchgate_metrics}
                    onChange={e => setAkademikForm({ ...akademikForm, researchgate_metrics: e.target.value })}
                    placeholder={t('Contoh: RG Score 18.4')}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <button className={BTN_GHOST} onClick={goPrev}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>{t('Kembali')}
                                      </button>
            <div className="flex items-center gap-3">
              <button className={BTN_PRIMARY} onClick={saveLinkAkademik} disabled={saving}>
                <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
                {saving ? 'Menyimpan...' : 'Simpan Link Akademik'}
              </button>
              <button className={BTN_GHOST} onClick={goNext}>
                
                                              {t('Lanjut')}<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PENDIDIKAN                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pendidikan' && (
        <div className="space-y-4 animate-fadeIn">
          {educations.length === 0 && !addingEdu && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data pendidikan.')}</p></Card>
          )}
          {educations.map((e) => (
            <Card key={e.id}>
              {editEdu?.id === e.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>{t('Jenjang *')}</Label>
                      <select className={INPUT} value={editEdu.jenjang} onChange={v => setEditEdu({ ...editEdu, jenjang: v.target.value })}>
                        <option value="">{t('Pilih Jenjang')}</option>
                        <option value="S1 - Sarjana">{t('S1 - Sarjana')}</option>
                        <option value="S2 - Magister">{t('S2 - Magister')}</option>
                        <option value="S3 - Doktor">{t('S3 - Doktor')}</option>
                        <option value="Profesi">{t('Profesi')}</option>
                        <option value="Spesialis">{t('Spesialis')}</option>
                      </select>
                    </div>
                    <div><Label>{t('Institusi *')}</Label><input className={INPUT} value={editEdu.institusi} onChange={v => setEditEdu({ ...editEdu, institusi: v.target.value })} /></div>
                    <div><Label>{t('Jurusan')}</Label><input className={INPUT} value={editEdu.jurusan || ''} onChange={v => setEditEdu({ ...editEdu, jurusan: v.target.value })} /></div>
                    <div><Label>{t('Tahun Lulus')}</Label><input type="number" className={INPUT} value={editEdu.tahun_lulus || ''} onChange={v => setEditEdu({ ...editEdu, tahun_lulus: v.target.value })} /></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className={BTN_PRIMARY} onClick={() => updateEdu(e.id)} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{t('Simpan')}</button>
                    <button className={BTN_GHOST} onClick={() => setEditEdu(null)}>{t('Batal')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{e.jenjang} — {e.institusi}</p>
                    {e.jurusan && <p className="text-sm text-[#5B6660]">{e.jurusan}</p>}
                    {e.tahun_lulus && <p className="text-xs text-[#5B6660] mt-1">{t('Lulus')} {e.tahun_lulus}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className={BTN_GHOST} onClick={() => setEditEdu({ ...e })}><span className="material-symbols-outlined text-[16px]">edit</span>{t('Edit')}</button>
                    <button className={BTN_DANGER} onClick={() => deleteEdu(e.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {addingEdu ? (
            <Card>
              <SectionTitle icon="add_circle">{t('Tambah Pendidikan')}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label>{t('Jenjang *')}</Label>
                  <select className={INPUT} value={newEdu.jenjang} onChange={v => setNewEdu({ ...newEdu, jenjang: v.target.value })}>
                    <option value="">{t('Pilih Jenjang')}</option>
                    <option value="S1 - Sarjana">{t('S1 - Sarjana')}</option>
                    <option value="S2 - Magister">{t('S2 - Magister')}</option>
                    <option value="S3 - Doktor">{t('S3 - Doktor')}</option>
                    <option value="Profesi">{t('Profesi')}</option>
                    <option value="Spesialis">{t('Spesialis')}</option>
                  </select>
                </div>
                <div><Label>{t('Institusi *')}</Label><input className={INPUT} value={newEdu.institusi} onChange={v => setNewEdu({ ...newEdu, institusi: v.target.value })} placeholder={t('Nama Universitas')} /></div>
                <div><Label>{t('Jurusan / Program Studi')}</Label><input className={INPUT} value={newEdu.jurusan} onChange={v => setNewEdu({ ...newEdu, jurusan: v.target.value })} placeholder={t('Ilmu Lingkungan')} /></div>
                <div><Label>{t('Tahun Lulus')}</Label><input type="number" className={INPUT} value={newEdu.tahun_lulus} onChange={v => setNewEdu({ ...newEdu, tahun_lulus: v.target.value })} placeholder="2015" /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addEdu} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                <button className={BTN_GHOST} onClick={() => setAddingEdu(false)}>{t('Batal')}</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingEdu(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Pendidikan')}
                                          </button>
          )}

          <WizardNav onBack={goPrev} onNext={goNext} nextLabel={`Lanjut ke ${TABS[currentTabIdx + 1]?.label}`} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PENGALAMAN                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'pengalaman' && (
        <div className="space-y-4 animate-fadeIn">
          {experiences.length === 0 && !addingExp && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data pengalaman.')}</p></Card>
          )}
          {experiences.map((e) => (
            <Card key={e.id}>
              {editExp?.id === e.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label>{t('Posisi / Jabatan *')}</Label><input className={INPUT} value={editExp.posisi} onChange={v => setEditExp({ ...editExp, posisi: v.target.value })} /></div>
                    <div><Label>{t('Instansi / Organisasi *')}</Label><input className={INPUT} value={editExp.instansi} onChange={v => setEditExp({ ...editExp, instansi: v.target.value })} /></div>
                    <div><Label>{t('Tahun Mulai')}</Label><input type="number" className={INPUT} value={editExp.tahun_mulai || ''} onChange={v => setEditExp({ ...editExp, tahun_mulai: v.target.value })} /></div>
                    <div><Label>{t('Tahun Selesai')}</Label><input type="number" className={INPUT} value={editExp.tahun_selesai || ''} onChange={v => setEditExp({ ...editExp, tahun_selesai: v.target.value })} placeholder={t('Kosong = masih berlangsung')} /></div>
                    <div className="md:col-span-2"><Label>{t('Deskripsi')}</Label><textarea className={INPUT + ' resize-none min-h-[72px]'} value={editExp.deskripsi || ''} onChange={v => setEditExp({ ...editExp, deskripsi: v.target.value })} /></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className={BTN_PRIMARY} onClick={() => updateExp(e.id)} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{t('Simpan')}</button>
                    <button className={BTN_GHOST} onClick={() => setEditExp(null)}>{t('Batal')}</button>
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
                    <button className={BTN_GHOST} onClick={() => setEditExp({ ...e })}><span className="material-symbols-outlined text-[16px]">edit</span>{t('Edit')}</button>
                    <button className={BTN_DANGER} onClick={() => deleteExp(e.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {addingExp ? (
            <Card>
              <SectionTitle icon="add_circle">{t('Tambah Pengalaman')}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div><Label>{t('Posisi / Jabatan *')}</Label><input className={INPUT} value={newExp.posisi} onChange={v => setNewExp({ ...newExp, posisi: v.target.value })} placeholder={t('Konsultan AMDAL')} /></div>
                <div><Label>{t('Instansi / Organisasi *')}</Label><input className={INPUT} value={newExp.instansi} onChange={v => setNewExp({ ...newExp, instansi: v.target.value })} placeholder={t('PT. Contoh Jaya')} /></div>
                <div><Label>{t('Tahun Mulai')}</Label><input type="number" className={INPUT} value={newExp.tahun_mulai} onChange={v => setNewExp({ ...newExp, tahun_mulai: v.target.value })} placeholder="2020" /></div>
                <div><Label>{t('Tahun Selesai')}</Label><input type="number" className={INPUT} value={newExp.tahun_selesai} onChange={v => setNewExp({ ...newExp, tahun_selesai: v.target.value })} placeholder={t('Kosong = masih berlangsung')} /></div>
                <div className="md:col-span-2"><Label>{t('Deskripsi Singkat')}</Label><textarea className={INPUT + ' resize-none min-h-[72px]'} value={newExp.deskripsi} onChange={v => setNewExp({ ...newExp, deskripsi: v.target.value })} /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addExp} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                <button className={BTN_GHOST} onClick={() => setAddingExp(false)}>{t('Batal')}</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingExp(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Pengalaman')}
                                          </button>
          )}

          <WizardNav onBack={goPrev} onNext={goNext} nextLabel={`Lanjut ke ${TABS[currentTabIdx + 1]?.label}`} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: SERTIFIKAT                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'sertifikat' && (
        <div className="space-y-4 animate-fadeIn">
          {certificates.length === 0 && !addingCert && (
            <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data sertifikat.')}</p></Card>
          )}
          {certificates.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#2E5E3B] text-[22px] mt-0.5">workspace_premium</span>
                  <div>
                    <p className="font-bold text-[#1F2A22]">{c.nama_sertifikat}</p>
                    {c.penerbit && <p className="text-sm text-[#5B6660]">{c.penerbit}</p>}
                    {c.tahun && <p className="text-xs text-[#5B6660] mt-1">{t('Tahun')} {c.tahun}</p>}
                    {c.file_url && (
                      <a
                        href={getFileUrl(c.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0284C7] hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        
                                                              {t('Lihat File')}
                                                            </a>
                    )}
                  </div>
                </div>
                <button className={BTN_DANGER} onClick={() => deleteCert(c.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
              </div>
            </Card>
          ))}

          {addingCert ? (
            <Card>
              <SectionTitle icon="add_circle">{t('Tambah Sertifikat')}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="md:col-span-2"><Label>{t('Nama Sertifikat *')}</Label><input className={INPUT} value={newCert.nama_sertifikat} onChange={v => setNewCert({ ...newCert, nama_sertifikat: v.target.value })} placeholder={t('Sertifikat AMDAL A')} /></div>
                <div><Label>{t('Tahun')}</Label><input type="number" className={INPUT} value={newCert.tahun} onChange={v => setNewCert({ ...newCert, tahun: v.target.value })} placeholder="2022" /></div>
                <div className="md:col-span-3"><Label>{t('Penerbit / Lembaga')}</Label><input className={INPUT} value={newCert.penerbit} onChange={v => setNewCert({ ...newCert, penerbit: v.target.value })} placeholder={t('KLHK / BPLHD / Instansi Penerbit')} /></div>
              </div>
              <div className="flex gap-2">
                <button className={BTN_PRIMARY} onClick={addCert} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                <button className={BTN_GHOST} onClick={() => setAddingCert(false)}>{t('Batal')}</button>
              </div>
            </Card>
          ) : (
            <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingCert(true)}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Sertifikat')}
                                          </button>
          )}

          <WizardNav onBack={goPrev} onNext={goNext} nextLabel={`Lanjut ke ${TABS[currentTabIdx + 1]?.label}`} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: PUBLIKASI & RIWAYAT                                */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'publikasi' && (
        <div className="space-y-10 animate-fadeIn">
          {/* ── Publikasi ─────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionTitle icon="article">{t('Publikasi')}</SectionTitle>
            {publikasi.length === 0 && !addingPub && (
              <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data publikasi.')}</p></Card>
            )}
            {publikasi.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {p.jenis && <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] bg-[#F5F4F0] px-2 py-0.5 rounded-full">{p.jenis}</span>}
                    <p className="font-bold text-[#1F2A22] mt-1.5">{p.judul}</p>
                    {p.penerbit && <p className="text-sm text-[#5B6660]">{p.penerbit}{p.tahun ? ` · ${p.tahun}` : ''}</p>}
                    {p.link && p.link !== '#' && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#0284C7] hover:underline mt-1 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>{t('Lihat Publikasi')}
                                                          </a>
                    )}
                  </div>
                  <button className={BTN_DANGER} onClick={() => deletePub(p.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                </div>
              </Card>
            ))}
            {addingPub ? (
              <Card>
                <SectionTitle icon="add_circle">{t('Tambah Publikasi')}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <Label>{t('Jenis')}</Label>
                    <select className={INPUT} value={newPub.jenis} onChange={v => setNewPub({ ...newPub, jenis: v.target.value })}>
                      <option value="">{t('Pilih Jenis')}</option>
                      <option value="Jurnal">{t('Jurnal')}</option>
                      <option value="Prosiding">{t('Prosiding')}</option>
                      <option value="Buku">{t('Buku')}</option>
                      <option value="Lainnya">{t('Lainnya')}</option>
                    </select>
                  </div>
                  <div><Label>{t('Tahun')}</Label><input type="number" className={INPUT} value={newPub.tahun} onChange={v => setNewPub({ ...newPub, tahun: v.target.value })} placeholder="2023" /></div>
                  <div className="md:col-span-2"><Label>{t('Judul *')}</Label><input className={INPUT} value={newPub.judul} onChange={v => setNewPub({ ...newPub, judul: v.target.value })} placeholder={t('Judul publikasi')} /></div>
                  <div><Label>{t('Penerbit / Media')}</Label><input className={INPUT} value={newPub.penerbit} onChange={v => setNewPub({ ...newPub, penerbit: v.target.value })} placeholder={t('Nama jurnal / penerbit')} /></div>
                  <div><Label>{t('Link (opsional)')}</Label><input className={INPUT} value={newPub.link} onChange={v => setNewPub({ ...newPub, link: v.target.value })} placeholder={t('https://...')} /></div>
                </div>
                <div className="flex gap-2">
                  <button className={BTN_PRIMARY} onClick={addPub} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                  <button className={BTN_GHOST} onClick={() => setAddingPub(false)}>{t('Batal')}</button>
                </div>
              </Card>
            ) : (
              <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingPub(true)}>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Publikasi')}
                                                </button>
            )}
          </div>

          {/* ── Organisasi ────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionTitle icon="groups">{t('Organisasi')}</SectionTitle>
            {organisasi.length === 0 && !addingOrg && (
              <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data organisasi.')}</p></Card>
            )}
            {organisasi.map((o) => (
              <Card key={o.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{o.nama}</p>
                    <p className="text-sm text-[#5B6660]">{o.jabatan}{o.periode ? ` · ${o.periode}` : ''}</p>
                    {o.kontribusi && <p className="text-xs text-[#5B6660] mt-1">{o.kontribusi}</p>}
                  </div>
                  <button className={BTN_DANGER} onClick={() => deleteOrg(o.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                </div>
              </Card>
            ))}
            {addingOrg ? (
              <Card>
                <SectionTitle icon="add_circle">{t('Tambah Organisasi')}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div><Label>{t('Nama Organisasi *')}</Label><input className={INPUT} value={newOrg.nama} onChange={v => setNewOrg({ ...newOrg, nama: v.target.value })} placeholder={t('Ikatan Ahli...')} /></div>
                  <div><Label>{t('Jabatan')}</Label><input className={INPUT} value={newOrg.jabatan} onChange={v => setNewOrg({ ...newOrg, jabatan: v.target.value })} placeholder={t('Anggota / Pengurus')} /></div>
                  <div><Label>{t('Periode')}</Label><input className={INPUT} value={newOrg.periode} onChange={v => setNewOrg({ ...newOrg, periode: v.target.value })} placeholder={t('2019 — Sekarang')} /></div>
                  <div className="md:col-span-2"><Label>{t('Kontribusi')}</Label><textarea className={INPUT + ' resize-none min-h-[64px]'} value={newOrg.kontribusi} onChange={v => setNewOrg({ ...newOrg, kontribusi: v.target.value })} /></div>
                </div>
                <div className="flex gap-2">
                  <button className={BTN_PRIMARY} onClick={addOrg} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                  <button className={BTN_GHOST} onClick={() => setAddingOrg(false)}>{t('Batal')}</button>
                </div>
              </Card>
            ) : (
              <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingOrg(true)}>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Organisasi')}
                                                </button>
            )}
          </div>

          {/* ── Reviewer Jurnal ───────────────────────────────── */}
          <div className="space-y-4">
            <SectionTitle icon="fact_check">{t('Reviewer Jurnal')}</SectionTitle>
            {reviewerJurnal.length === 0 && !addingRev && (
              <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada data reviewer jurnal.')}</p></Card>
            )}
            {reviewerJurnal.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{r.nama}</p>
                    <p className="text-sm text-[#5B6660]">{r.institusi}{r.periode ? ` · ${r.periode}` : ''}</p>
                    {r.bidang && <p className="text-xs text-[#5B6660] mt-1">{r.bidang}</p>}
                  </div>
                  <button className={BTN_DANGER} onClick={() => deleteRev(r.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                </div>
              </Card>
            ))}
            {addingRev ? (
              <Card>
                <SectionTitle icon="add_circle">{t('Tambah Reviewer Jurnal')}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div><Label>{t('Nama Jurnal *')}</Label><input className={INPUT} value={newRev.nama} onChange={v => setNewRev({ ...newRev, nama: v.target.value })} /></div>
                  <div><Label>{t('Institusi Penerbit')}</Label><input className={INPUT} value={newRev.institusi} onChange={v => setNewRev({ ...newRev, institusi: v.target.value })} /></div>
                  <div><Label>{t('Bidang')}</Label><input className={INPUT} value={newRev.bidang} onChange={v => setNewRev({ ...newRev, bidang: v.target.value })} /></div>
                  <div><Label>{t('Periode')}</Label><input className={INPUT} value={newRev.periode} onChange={v => setNewRev({ ...newRev, periode: v.target.value })} placeholder={t('2020 — Sekarang')} /></div>
                </div>
                <div className="flex gap-2">
                  <button className={BTN_PRIMARY} onClick={addRev} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                  <button className={BTN_GHOST} onClick={() => setAddingRev(false)}>{t('Batal')}</button>
                </div>
              </Card>
            ) : (
              <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingRev(true)}>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Reviewer Jurnal')}
                                                </button>
            )}
          </div>

          {/* ── Narasumber ────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionTitle icon="campaign">{t('Narasumber')}</SectionTitle>
            {narasumber.length === 0 && !addingNara && (
              <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada riwayat sebagai narasumber.')}</p></Card>
            )}
            {narasumber.map((n) => (
              <Card key={n.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{n.title}</p>
                    <p className="text-sm text-[#5B6660]">{n.penyelenggara}</p>
                    {(n.tempat || n.tanggal) && <p className="text-xs text-[#5B6660] mt-1">{n.tempat}{n.tempat && n.tanggal ? ', ' : ''}{n.tanggal}</p>}
                  </div>
                  <button className={BTN_DANGER} onClick={() => deleteNara(n.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                </div>
              </Card>
            ))}
            {addingNara ? (
              <Card>
                <SectionTitle icon="add_circle">{t('Tambah Riwayat Narasumber')}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="md:col-span-2"><Label>{t('Judul Kegiatan *')}</Label><input className={INPUT} value={newNara.title} onChange={v => setNewNara({ ...newNara, title: v.target.value })} /></div>
                  <div><Label>{t('Penyelenggara')}</Label><input className={INPUT} value={newNara.penyelenggara} onChange={v => setNewNara({ ...newNara, penyelenggara: v.target.value })} /></div>
                  <div><Label>{t('Tempat')}</Label><input className={INPUT} value={newNara.tempat} onChange={v => setNewNara({ ...newNara, tempat: v.target.value })} /></div>
                  <div><Label>{t('Tanggal')}</Label><input className={INPUT} value={newNara.tanggal} onChange={v => setNewNara({ ...newNara, tanggal: v.target.value })} placeholder={t('15 Nov 2022')} /></div>
                </div>
                <div className="flex gap-2">
                  <button className={BTN_PRIMARY} onClick={addNara} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                  <button className={BTN_GHOST} onClick={() => setAddingNara(false)}>{t('Batal')}</button>
                </div>
              </Card>
            ) : (
              <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingNara(true)}>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Riwayat Narasumber')}
                                                </button>
            )}
          </div>

          {/* ── Instruktur / Trainer ──────────────────────────── */}
          <div className="space-y-4">
            <SectionTitle icon="cast_for_education">{t('Instruktur / Trainer')}</SectionTitle>
            {instruktur.length === 0 && !addingIns && (
              <Card><p className="text-sm text-[#5B6660] text-center py-4">{t('Belum ada riwayat sebagai instruktur.')}</p></Card>
            )}
            {instruktur.map((i) => (
              <Card key={i.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#1F2A22]">{i.nama}</p>
                    <p className="text-sm text-[#5B6660]">{i.materi}</p>
                    <p className="text-xs text-[#5B6660] mt-1">{i.peran}{i.peran && i.penyelenggara ? ' · ' : ''}{i.penyelenggara}{i.tahun ? ` (${i.tahun})` : ''}</p>
                  </div>
                  <button className={BTN_DANGER} onClick={() => deleteIns(i.id)}><span className="material-symbols-outlined text-[16px]">delete</span>{t('Hapus')}</button>
                </div>
              </Card>
            ))}
            {addingIns ? (
              <Card>
                <SectionTitle icon="add_circle">{t('Tambah Riwayat Instruktur')}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="md:col-span-2"><Label>{t('Nama Kegiatan *')}</Label><input className={INPUT} value={newIns.nama} onChange={v => setNewIns({ ...newIns, nama: v.target.value })} /></div>
                  <div><Label>{t('Materi')}</Label><input className={INPUT} value={newIns.materi} onChange={v => setNewIns({ ...newIns, materi: v.target.value })} /></div>
                  <div><Label>{t('Penyelenggara')}</Label><input className={INPUT} value={newIns.penyelenggara} onChange={v => setNewIns({ ...newIns, penyelenggara: v.target.value })} /></div>
                  <div><Label>{t('Peran')}</Label><input className={INPUT} value={newIns.peran} onChange={v => setNewIns({ ...newIns, peran: v.target.value })} placeholder={t('Instruktur Utama / Fasilitator')} /></div>
                  <div><Label>{t('Tahun')}</Label><input type="number" className={INPUT} value={newIns.tahun} onChange={v => setNewIns({ ...newIns, tahun: v.target.value })} /></div>
                </div>
                <div className="flex gap-2">
                  <button className={BTN_PRIMARY} onClick={addIns} disabled={saving}><span className="material-symbols-outlined text-[16px]">save</span>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                  <button className={BTN_GHOST} onClick={() => setAddingIns(false)}>{t('Batal')}</button>
                </div>
              </Card>
            ) : (
              <button className={BTN_GHOST + ' self-start'} onClick={() => setAddingIns(true)}>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>{t('Tambah Riwayat Instruktur')}
                                                </button>
            )}
          </div>

          <WizardNav onBack={goPrev} onNext={goNext} nextLabel={`Lanjut ke ${TABS[currentTabIdx + 1]?.label}`} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: DOKUMEN & FOTO                                     */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'dokumen' && (
        <div className="space-y-6 animate-fadeIn">
          {/* ── Foto Profil ─────────────────────────────────── */}
          <Card>
            <SectionTitle icon="photo_camera">{t('Foto Profil')}</SectionTitle>
            <div className="flex items-start gap-6">
              {/* Foto (klik untuk buka opsi WhatsApp-style) */}
              <button
                onClick={() => setPhotoModal(true)}
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#2E5E3B]/20 bg-[#F5F4F0] flex items-center justify-center shrink-0 hover:opacity-80 hover:scale-105 transition-all cursor-pointer"
              >
                {photoPreview
                  ? <img src={photoPreview} alt="Foto profil" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-4xl text-[#5B6660]/40">person</span>}
              </button>
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-xs font-semibold text-[#1F2A22] mb-1">{t('Panduan Foto Profil:')}</p>
                  <ul className="text-xs text-[#5B6660] list-disc list-inside space-y-0.5">
                    <li>{t('Format JPG atau PNG, maksimal 2MB')}</li>
                    <li>{t('Gunakan foto formal dengan latar polos')}</li>
                    <li>{t('Wajah terlihat jelas dan profesional')}</li>
                    <li><strong>{t('Klik foto')}</strong>  {t('untuk mengganti, melihat, atau menghapus')}</li>
                  </ul>
                </div>
                {/* Hidden input for file selection (triggered from modal) */}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  ref={photoRef}
                  onChange={handlePhotoChange}
                />
                {/* Preview setelah crop - tombol upload */}
                {photoFile && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#5B6660] bg-[#F5F4F0] px-3 py-2 rounded-lg">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span className="flex-1 truncate">{t('Foto siap diupload ·')} {(photoFile.size / 1024).toFixed(0)} KB</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={BTN_PRIMARY}
                        disabled={saving}
                        onClick={() => uploadDoc(
                          photoFile,
                          'foto_profil',
                          'Pas Foto Formal',
                          () => {
                            setPhotoFile(null);
                            if (photoRef.current) photoRef.current.value = '';
                          }
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'cloud_upload'}</span>
                        {saving ? 'Mengunggah...' : 'Upload Foto'}
                      </button>
                      <button
                        className={BTN_DANGER}
                        onClick={() => {
                          setPhotoFile(null);
                          setPreview(expert?.photo ? getFileUrl(expert.photo) : null);
                          if (photoRef.current) photoRef.current.value = '';
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        
                                                                      {t('Batal')}
                                                                    </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── Foto Cover / Background ────────────────────── */}
          <Card>
            <SectionTitle icon="image">{t('Foto Cover / Background')}</SectionTitle>
            <div className="space-y-4">
              {/* Preview Cover */}
              {coverPreview && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-[#2E5E3B]/20">
                  <img src={coverPreview} alt="Foto cover" className="w-full h-full object-cover" />
                  <button
                    onClick={deleteCover}
                    disabled={saving}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                    title={t('Hapus foto cover')}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}

              {/* Panduan */}
              <div>
                <p className="text-xs font-semibold text-[#1F2A22] mb-1">{t('Panduan Foto Cover:')}</p>
                <ul className="text-xs text-[#5B6660] list-disc list-inside space-y-0.5">
                  <li>{t('Format JPG atau PNG, maksimal 5MB')}</li>
                  <li>{t('Ukuran rekomendasi: 1400x400 piksel (landscape)')}</li>
                  <li>{t('Gunakan foto yang profesional dan relevan dengan keahlian Anda')}</li>
                  <li>{t('Foto ini akan ditampilkan di halaman profil dan pencarian')}</li>
                </ul>
              </div>

              {/* File Input */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <label className={BTN_GHOST + ' cursor-pointer'}>
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    {coverPreview ? 'Ganti Foto Cover' : 'Pilih Foto Cover'}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      ref={coverRef}
                      onChange={handleCoverChange}
                    />
                  </label>

                  {coverFile && (
                    <>
                      <button
                        className={BTN_PRIMARY}
                        disabled={saving}
                        onClick={uploadCover}
                      >
                        <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'cloud_upload'}</span>
                        {saving ? 'Mengunggah...' : 'Upload Cover'}
                      </button>
                      <button
                        className={BTN_DANGER}
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(expert?.cover ? getFileUrl(expert.cover) : null);
                          if (coverRef.current) coverRef.current.value = '';
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        
                                                                      {t('Batal')}
                                                                    </button>
                    </>
                  )}
                </div>

                {coverFile && (
                  <div className="flex items-center gap-2 text-xs text-[#5B6660] bg-[#F5F4F0] px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-[#0EA5E9]">image</span>
                    <span className="flex-1 truncate">{coverFile.name}</span>
                    <span className="font-semibold">{(coverFile.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── CV ──────────────────────────────────────────── */}
          <Card>
            <SectionTitle icon="description">{t('Curriculum Vitae (CV)')}</SectionTitle>
            <p className="text-xs text-[#5B6660] mb-3">{t('Format PDF, maksimal 5MB. Pastikan CV Anda terbaru dan lengkap.')}</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <label className={BTN_GHOST + ' cursor-pointer'}>
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>{t('Pilih File CV')}
                                                    <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    ref={cvRef}
                    onChange={handleCvChange}
                  />
                </label>
                {cvFile && (
                  <>
                    <button
                      className={BTN_PRIMARY}
                      disabled={saving}
                      onClick={() => uploadDoc(
                        cvFile,
                        'lainnya',
                        'CV / Curriculum Vitae',
                        () => {
                          setCvFile(null);
                          setCvFileName('');
                          if (cvRef.current) cvRef.current.value = '';
                        }
                      )}
                    >
                      <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'cloud_upload'}</span>
                      {saving ? 'Mengunggah...' : 'Upload CV'}
                    </button>
                    <button
                      className={BTN_DANGER}
                      onClick={() => {
                        setCvFile(null);
                        setCvFileName('');
                        if (cvRef.current) cvRef.current.value = '';
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      
                                                                {t('Batal')}
                                                              </button>
                  </>
                )}
              </div>
              {cvFile && (
                <div className="flex items-center gap-2 text-xs text-[#5B6660] bg-[#F5F4F0] px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-red-600">picture_as_pdf</span>
                  <span className="flex-1 truncate">{cvFileName}</span>
                  <span className="font-semibold">{(cvFile.size / 1024).toFixed(0)} KB</span>
                </div>
              )}
            </div>
          </Card>

          {/* ── Bukti Kompetensi ────────────────────────────── */}
          <Card>
            <SectionTitle icon="verified">{t('Bukti Kompetensi')}</SectionTitle>
            <p className="text-xs text-[#5B6660] mb-3">{t('Sertifikat, ijazah, atau dokumen pendukung lainnya (PDF/JPG/PNG, maksimal 5MB).')}</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <label className={BTN_GHOST + ' cursor-pointer'}>
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>{t('Pilih Bukti Kompetensi')}
                                                    <input
                    type="file"
                    accept=".pdf,image/jpeg,image/jpg,image/png,application/pdf"
                    className="hidden"
                    ref={buktiRef}
                    onChange={handleBuktiChange}
                  />
                </label>
                {buktiFile && (
                  <>
                    <button
                      className={BTN_PRIMARY}
                      disabled={saving}
                      onClick={() => uploadDoc(
                        buktiFile,
                        'lainnya',
                        'Bukti Kompetensi',
                        () => {
                          setBuktiFile(null);
                          setBuktiFileName('');
                          if (buktiRef.current) buktiRef.current.value = '';
                        }
                      )}
                    >
                      <span className="material-symbols-outlined text-[16px]">{saving ? 'sync' : 'cloud_upload'}</span>
                      {saving ? 'Mengunggah...' : 'Upload Bukti'}
                    </button>
                    <button
                      className={BTN_DANGER}
                      onClick={() => {
                        setBuktiFile(null);
                        setBuktiFileName('');
                        if (buktiRef.current) buktiRef.current.value = '';
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      
                                                                {t('Batal')}
                                                              </button>
                  </>
                )}
              </div>
              {buktiFile && (
                <div className="flex items-center gap-2 text-xs text-[#5B6660] bg-[#F5F4F0] px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">
                    {buktiFile.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                  </span>
                  <span className="flex-1 truncate">{buktiFileName}</span>
                  <span className="font-semibold">{(buktiFile.size / 1024).toFixed(0)} KB</span>
                </div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <button
                className={BTN_PRIMARY + ' w-full sm:w-auto'}
                disabled={!isProfileComplete || submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await fetch('/my/profile/submit', { method: 'POST' });
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {submitting ? 'Mengirim...' : 'Kirim Verifikasi Profil'}
              </button>
            </div>
          </Card>

          {/* ── Daftar Dokumen Tersimpan ─────────────────────── */}
          {documents.length > 0 ? (
            <Card>
              <SectionTitle icon="folder_open">{t('Dokumen Tersimpan (')}{documents.length})</SectionTitle>
              <ul className="divide-y divide-outline-variant/20">
                {documents.map((doc) => {
                  const docTypeLabel = {
                    'foto_profil': 'Foto Profil',
                    'ktp': 'KTP',
                    'ijazah': 'Ijazah',
                    'lainnya': 'Dokumen Lainnya'
                  };
                  const docIcon = {
                    'foto_profil': 'photo_camera',
                    'ktp': 'badge',
                    'ijazah': 'school',
                    'lainnya': 'description'
                  };

                  return (
                    <li key={doc.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#2E5E3B]/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-[#2E5E3B]">
                            {docIcon[doc.type] || 'description'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[#1F2A22] truncate">
                              {doc.label || docTypeLabel[doc.type] || doc.type}
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] bg-[#F5F4F0] px-2 py-0.5 rounded-full shrink-0">
                              {docTypeLabel[doc.type] || doc.type}
                            </span>
                          </div>
                          {doc.file_path && (
                            <a
                              href={getFileUrl(doc.file_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[#0284C7] hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              
                                                                        {t('Lihat & Unduh File')}
                                                                      </a>
                          )}
                        </div>
                      </div>
                      <button
                        className={BTN_DANGER}
                        onClick={() => deleteDoc(doc.id)}
                        title={t('Hapus dokumen')}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        
                                                      {t('Hapus')}
                                                    </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#F5F4F0] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl text-[#5B6660]/40">folder_open</span>
                </div>
                <p className="text-sm text-[#5B6660] mb-1">{t('Belum ada dokumen tersimpan')}</p>
                <p className="text-xs text-[#5B6660]/70">{t('Upload foto profil, CV, atau dokumen pendukung di atas')}</p>
              </div>
            </Card>
          )}

          <WizardNav onBack={goPrev} onNext={goNext} nextLabel={`Lanjut ke ${TABS[currentTabIdx + 1]?.label}`} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB: VERIFIKASI                                          */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'verifikasi' && (
        <div className="space-y-6 animate-fadeIn">
          <button className={BTN_GHOST + ' self-start'} onClick={goPrev}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>{t('Kembali ke')} {TABS[currentTabIdx - 1]?.label}
          </button>

          {/* ── Status Saat Ini ──────────────────────────────── */}
          <Card>
            <SectionTitle icon="verified_user">{t('Kirim Profil untuk Verifikasi')}</SectionTitle>
            <div className="text-sm text-[#414844] leading-relaxed mb-6">
              <p>{t('Setelah Anda melengkapi seluruh data profil, memilih paket keanggotaan, dan mengunggah dokumen pendukung, Anda dapat mengirimkan profil ini untuk ditinjau oleh admin.')}</p>
              <p className="mt-2">{t('Pastikan semua data sudah benar karena profil tidak dapat diubah selama proses verifikasi berlangsung.')}</p>
            </div>

            {expert?.profile_status === 'aktif' ? (
              <div className="bg-[#E3F2E7] border border-[#A7D7B0] rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#2E5E3B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                <div className="text-sm text-[#1C3822]">
                  <p className="font-semibold mb-0.5">{t('Profil Telah Disetujui')}</p>
                  <p className="text-xs">{t('Profil Anda sudah aktif dan tayang di direktori publik.')}</p>
                </div>
              </div>
            ) : expert?.profile_status === 'menunggu_verifikasi' ? (
              <div className="bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#B36B00] text-[20px] shrink-0 mt-0.5">schedule</span>
                <div className="text-sm text-[#5C3D00]">
                  <p className="font-semibold mb-0.5">{t('Menunggu Verifikasi Admin')}</p>
                  <p className="text-xs">{t('Profil Anda sedang ditinjau. Kami akan memberi tahu Anda melalui email setelah proses selesai.')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ── Kelengkapan profil ────────────────────────────── */}
                {!isProfileComplete && (
                  <div className="bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#B36B00] text-[20px] shrink-0 mt-0.5">warning</span>
                    <div className="text-sm text-[#5C3D00]">
                      <p className="font-semibold mb-1">{t('Lengkapi profil Anda terlebih dahulu')}</p>
                      <p className="text-xs leading-relaxed mb-2">{t('Profil baru bisa dikirim ke admin setelah bagian berikut lengkap:')}</p>
                      <ul className="text-xs list-disc list-inside space-y-0.5">
                        {missingSteps.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Info paket & pembayaran (opsional, divalidasi backend) */}
                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 flex items-start gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#0284C7] text-[20px] shrink-0 mt-0.5">workspace_premium</span>
                  <div className="text-sm text-[#0369A1]">
                    <p className="font-semibold mb-0.5">{t('Syarat Verifikasi')}</p>
                    <p className="text-xs">{t('Anda harus memiliki')} <strong>{t('Paket Aktif')}</strong>  {t('(telah memilih paket dan melunasi pembayaran) sebelum admin memproses verifikasi profil ini.')}</p>
                  </div>
                </div>

                <div className="border-t border-black/5 pt-4">
                  <button
                    onClick={submitVerification}
                    disabled={!isProfileComplete || submitting}
                    className="w-full sm:w-auto bg-[#0284C7] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0369A1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />  {t('Mengirim...')}</>
                    ) : (
                      <><span className="material-symbols-outlined text-[20px]">send</span>  {t('Kirim Profil Sekarang')}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* CAMERA CAPTURE (Real-time camera)                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {cameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* IMAGE CROPPER (WhatsApp Style)                          */}
      {/* ════════════════════════════════════════════════════════ */}
      {cropperOpen && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL: FOTO PROFIL (WhatsApp Style)                    */}
      {/* ════════════════════════════════════════════════════════ */}
      {photoModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPhotoModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Foto */}
            {photoPreview && (
              <div className="p-6 pb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#F5F4F0]">
                  <img src={photoPreview} alt="Foto profil" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Opsi */}
            <div className="px-2 pb-2">
              {photoPreview && (
                <button
                  onClick={viewFullPhoto}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-xl"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#5B6660]">visibility</span>
                  <span className="text-[15px] font-medium text-[#1F2A22]">{t('Lihat Foto')}</span>
                </button>
              )}

              <button
                onClick={triggerCamera}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-xl"
              >
                <span className="material-symbols-outlined text-[24px] text-[#5B6660]">photo_camera</span>
                <span className="text-[15px] font-medium text-[#1F2A22]">{t('Ambil Foto')}</span>
              </button>

              <button
                onClick={triggerPhotoInput}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-xl"
              >
                <span className="material-symbols-outlined text-[24px] text-[#5B6660]">photo_library</span>
                <span className="text-[15px] font-medium text-[#1F2A22]">
                  {photoPreview ? 'Ganti dari Galeri' : 'Pilih dari Galeri'}
                </span>
              </button>

              {photoPreview && (
                <button
                  onClick={deletePhoto}
                  disabled={saving}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 active:bg-red-100 transition-colors rounded-xl disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#B3261E]">delete</span>
                  <span className="text-[15px] font-medium text-[#B3261E]">
                    {saving ? 'Menghapus...' : 'Hapus Foto'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setPhotoModal(false)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-2 text-[14px] font-semibold text-[#5B6660] hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-xl"
              >
                
                                              {t('Batal')}
                                            </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL: LIHAT FOTO FULLSCREEN                            */}
      {/* ════════════════════════════════════════════════════════ */}
      {fullPhotoView && photoPreview && (
        <div
          className="fixed inset-0 bg-black z-[110] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFullPhotoView(false)}
        >
          <button
            onClick={() => setFullPhotoView(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
          <img
            src={photoPreview}
            alt="Foto profil"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL: MAP PICKER                                        */}
      {/* ════════════════════════════════════════════════════════ */}
      {mapPickerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
          onClick={cancelMapPicker}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] h-[90vh] shadow-2xl flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <div>
                <h3 className="text-lg font-bold text-[#1F2A22]">{t('Pilih Lokasi Anda')}</h3>
                <p className="text-xs text-[#5B6660] mt-0.5">{t('Klik pada peta atau geser marker untuk menandai lokasi')}</p>
              </div>
              <button
                onClick={cancelMapPicker}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-[#5B6660]">close</span>
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative min-h-[400px] overflow-hidden">
              <div
                ref={mapRef}
                id="location-picker-map"
                className="w-full h-full"
              />

              {/* Info Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-outline-variant/20">
                {form.lat && form.lng ? (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0EA5E9] text-[22px] shrink-0 mt-0.5">location_on</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1F2A22] mb-1">{t('Lokasi Terpilih')}</p>
                      <p className="text-xs text-[#5B6660]">
                        
                                                                      {t('Koordinat:')} {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}
                      </p>
                      {form.location && (
                        <p className="text-xs text-[#5B6660] mt-0.5">{form.location}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[#5B6660]">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>{t('Klik pada peta untuk menandai lokasi Anda')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20 gap-3">
              <button
                onClick={() => {
                  if (navigator.geolocation && mapInstance) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords;
                        mapInstance.setView([latitude, longitude], 15);

                        if (mapMarker) {
                          mapMarker.setLatLng([latitude, longitude]);
                        } else {
                          const newMarker = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstance);
                          setMapMarker(newMarker);
                          newMarker.on('dragend', function () {
                            const position = newMarker.getLatLng();
                            updateLocationFromCoords(position.lat, position.lng);
                          });
                        }
                        updateLocationFromCoords(latitude, longitude);
                      },
                      () => {
                        flash('err', 'Tidak dapat mengambil lokasi Anda. Pastikan izin lokasi aktif.');
                      }
                    );
                  }
                }}
                className="flex items-center gap-2 text-sm font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
                
                                              {t('Gunakan Lokasi Saya')}
                                            </button>

              <div className="flex gap-2">
                <button
                  onClick={cancelMapPicker}
                  className={BTN_GHOST}
                >
                  
                                                    {t('Batal')}
                                                  </button>
                <button
                  onClick={saveMapLocation}
                  disabled={!form.lat || !form.lng}
                  className={BTN_PRIMARY + ' disabled:opacity-50 disabled:cursor-not-allowed'}
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  
                                                    {t('Pilih Lokasi Ini')}
                                                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </DashboardLayout>
  );
}