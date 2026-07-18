/**
 * NavbarBackground
 *
 * Kotak gradasi biru yang ditaruh di belakang Navbar (z-40).
 * Navbar sendiri berada di z-50 dengan background semi-transparan/
 * blur, sehingga komponen ini yang memberikan warna solid di bawahnya.
 *
 * Tinggi (disamakan dengan tinggi asli Navbar):
 *   - Mobile  : h-[72px] → logo h-12 (48px) + py-3 (24px)
 *   - Desktop : h-20     → logo md:h-14 (56px) + py-3 (24px)
 *
 * Gunakan komponen ini di semua halaman yang memerlukan background
 * biru di belakang Navbar agar ukuran selalu konsisten.
 */
export default function NavbarBackground() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-[72px] md:h-20 bg-gradient-to-r from-[#0369A1] via-[#0EA5E9] to-[#0284C7] z-40"
      aria-hidden="true"
    />
  );
}