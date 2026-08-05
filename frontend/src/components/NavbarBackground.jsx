/**
 * NavbarBackground
 *
 * Kotak gradasi biru di belakang Navbar (z-40).
 * Tinggi disesuaikan persis dengan tinggi Navbar.jsx:
 *   - Navbar pakai py-3 (12px atas + 12px bawah = 24px)
 *   - Logo mobile  h-7 = 28px  →  28 + 24 = 52px
 *   - Logo desktop h-8 = 32px  →  32 + 24 = 56px
 */
export default function NavbarBackground() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-[52px] md:h-[56px] bg-gradient-to-r from-[#0369A1] via-[#0EA5E9] to-[#0284C7] z-40"
      aria-hidden="true"
    />
  );
}
