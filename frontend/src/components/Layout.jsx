import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Halaman yang tidak memakai Layout (Navbar & Footer) sama sekali —
// biasanya karena halaman itu render Navbar-nya sendiri.
const FULL_PAGE_ROUTES = [
  '/narasumber',
  '/tenaga-ahli',
  '/instruktur-pengajar',
  '/peneliti-artikel-jurnal',
];

// Halaman yang tetap pakai Navbar dari Layout, tapi tidak butuh Footer
// (misalnya halaman search dengan panel map yang harus penuh satu layar).
const NO_FOOTER_ROUTES = [
  '/search',
];

export default function Layout({ children }) {
  const location = useLocation();
  const isFullPage = FULL_PAGE_ROUTES.includes(location.pathname);
  const hideFooter = NO_FOOTER_ROUTES.includes(location.pathname);

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}