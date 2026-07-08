import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // POST /api/login -> Laravel returns { token, user }
      const res = await api.post('/login', form);
      localStorage.setItem('amdal_token', res.data.token);
      navigate('/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile flex justify-center">
      {/* Kotak coklat di belakang navbar — tinggi sama persis dengan navbar (h-20 / 80px) */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#3E2B1F] z-40" />

      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-outline-variant/30 shadow-sm">
        <h1 className="font-headline-md text-headline-md text-on-background mb-6 text-center">Sign in</h1>

        {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border border-outline-variant/40 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kata Sandi</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 border border-outline-variant/40 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-3 rounded-full font-label-md hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Belum punya akun?{' '}
          <Link to="/daftar" className="text-primary font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}