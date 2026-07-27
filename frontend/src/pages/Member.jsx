import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import NavbarBackground from '../components/NavbarBackground.jsx';
import { usePageLoading } from '../context/LoadingContext.jsx';

const dummyMembers = [
  { id: 1, nama: 'Ir. Boy Rangga, ST, M.Ling', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0030' },
  { id: 2, nama: 'Ir. M.Nasir, S.Hut, M.Si', instansi: 'PSLH UIN AR RANIRY', nomor: 'CERT. IDN. 001.5.0723.0029' },
  { id: 3, nama: 'Dika Supyandi', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0028' },
  { id: 4, nama: 'Surya Armi, S.Sos', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0027' },
  { id: 5, nama: 'Riki Yulianda, S. Sos., M. Si', instansi: 'Prodi Sosiologi FISIP UTU', nomor: 'CERT. IDN. 001.5.0723.0026' },
  { id: 6, nama: 'Dhea Amelia S.PWK', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0025' },
  { id: 7, nama: 'Andiana Marjayanti, M.PWK', instansi: 'CV. KOTAKITA KALBAR', nomor: 'CERT. IDN. 001.5.0723.0024' },
  { id: 8, nama: 'Dr. Zaulfikar, M.Sc.', instansi: 'Universitas Teuku Umar', nomor: 'CERT. IDN. 001.5.0723.0023' },
  { id: 9, nama: 'Huda Eka Nurdiyatmi, S.PWK, M.PWK', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0022' },
  { id: 10, nama: 'Risa Triwiyanti, ST., M.PWK', instansi: 'Umum', nomor: 'CERT. IDN. 001.5.0723.0021' },
  { id: 11, nama: 'Dr. Ali Aulia Ghozali, S.Si., M.Si.', instansi: 'Institut Teknologi Yogyakarta', nomor: 'CERT. IDN. 001.5.0723.0020' },
  { id: 12, merge: 'Dr. Ir. Eldina Fatimah, M. Sc.', instansi: 'FT Sipil, Universitas Syiah Kuala', nomor: 'CERT. IDN. 001.5.0723.0019' },
  { id: 13, nama: 'Ir. Syaiful Bakhri, M.Kes.', instansi: 'PT. Quart Trust', nomor: 'CERT. IDN. 001.5.0723.0018' },
  { id: 14, nama: 'Prof. Dr. Ir. Muhammad Nur Aidi MS', instansi: 'Penaprolis', nomor: 'CERT. IDN. 001.5.0523.0017' },
  { id: 15, nama: 'Citra Fadhilah Utami', instansi: 'BPIW-Kementerian PUPR', nomor: 'CERT. IDN. 001.5.0523.0016' },
];

export default function Member() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reportReady } = usePageLoading();
  const [keyword, setKeyword] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    setLoading(true);
    api
      .get('/members')
      .then((res) => {
        // Backend bisa saja membungkus data dalam { data: [...] } atau
        // mengembalikan object lain, bukan array langsung. Validasi dulu
        // sebelum di-set supaya .map()/.filter() di bawah tidak crash.
        const raw = res.data;
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.members)
          ? raw.members
          : [];
        setMembers(data.length > 0 ? data : dummyMembers);
      })
      .catch(() => setMembers(dummyMembers))
      .finally(() => { setLoading(false); reportReady(); });
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const filteredMembers = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    let result = Array.isArray(members) ? members : [];

    if (q) {
      result = result.filter(
        (m) =>
          (m.nama && m.nama.toLowerCase().includes(q)) ||
          (m.merge && m.merge.toLowerCase().includes(q)) ||
          (m.instansi && m.instansi.toLowerCase().includes(q)) ||
          (m.nomor && m.nomor.toLowerCase().includes(q))
      );
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const valA = (a[sortConfig.key] || a.merge || '').toLowerCase();
        const valB = (b[sortConfig.key] || b.merge || '').toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [members, keyword, sortConfig]);

  const totalEntries = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + entriesPerPage);
  const showingFrom = totalEntries === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + entriesPerPage, totalEntries);

  const columns = [
    { key: 'nama', label: t('member.name', 'Nama') },
    { key: 'instansi', label: t('member.institution', 'Instansi') },
    { key: 'nomor', label: t('member.member_number', 'Nomor Member') },
  ];

  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1 align-middle">
        <span
          className={`material-symbols-outlined text-[14px] leading-none ${
            isActive && sortConfig.direction === 'asc' ? 'text-[#0EA5E9]' : 'text-on-surface-variant/40'
          }`}
        >
          arrow_drop_up
        </span>
        <span
          className={`material-symbols-outlined text-[14px] leading-none ${
            isActive && sortConfig.direction === 'desc' ? 'text-[#0EA5E9]' : 'text-on-surface-variant/40'
          }`}
        >
          arrow_drop_down
        </span>
      </span>
    );
  };

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <NavbarBackground />


      <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">{t('member.title', 'Member')}</h1>
      <p className="text-on-surface-variant mb-8">
        {t('member.subtitle', 'Daftar tenaga ahli AMDAL yang telah tersertifikasi dan terdaftar di AMDAL.ID.')}
      </p>

      <div className="bg-white rounded-xl border border-[#0EA5E9]/25 shadow-sm overflow-hidden">
        {/* Toolbar: entries + search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-[#0EA5E9]/20">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span>{t('member.show', 'Show')}</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#0EA5E9]/30 rounded-lg px-2 py-1.5 text-sm focus:ring-[#0EA5E9] focus:border-[#0EA5E9] bg-white text-on-surface-variant outline-none"
            >
              {[10, 18, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>{t('member.entries', 'entries')}</span>
          </div>

          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">
              search
            </span>
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('member.search_placeholder', 'Cari nama, instansi, atau nomor member')}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#0EA5E9]/30 rounded-lg focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#0EA5E9]/5">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-4 font-label-md text-on-background cursor-pointer select-none whitespace-nowrap"
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon columnKey={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? null : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-on-surface-variant">
                    {t('member.no_data', 'Tidak ada data yang cocok.')}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`border-t border-[#0EA5E9]/10 hover:bg-[#0EA5E9]/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#0EA5E9]/[0.03]'
                    }`}
                  >
                    <td className="px-6 py-4 text-on-background">{m.nama || m.merge}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{m.instansi}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{m.nomor}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: info + pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 border-t border-[#0EA5E9]/20 text-sm text-on-surface-variant">
          <span>
            {t('member.showing', 'Showing')} {showingFrom} {t('member.to', 'to')} {showingTo} {t('member.of', 'of')} {totalEntries} {t('member.entries', 'entries')}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#0EA5E9]/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0EA5E9]/10 transition-colors"
            >
              {t('member.previous', 'Previous')}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc, page, i, arr) => {
                if (i > 0 && page - arr[i - 1] > 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-on-surface-variant/60">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#0EA5E9] text-white'
                        : 'border border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/10'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#0EA5E9]/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0EA5E9]/10 transition-colors"
            >
              {t('member.next', 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}