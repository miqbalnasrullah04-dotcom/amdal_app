import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="pt-40 pb-32 text-center px-margin-mobile">
      <h1 className="font-display-lg text-headline-xl text-primary mb-4">404</h1>
      <p className="text-on-surface-variant mb-8">Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-label-md hover:bg-primary-container transition-colors">
        Kembali ke Home
      </Link>
    </div>
  );
}
