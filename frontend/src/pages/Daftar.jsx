import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Daftar() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // POST /api/register -> Laravel creates the user and returns { token, user }
      const res = await api.post('/register', form);
      localStorage.setItem('amdal_token', res.data.token);
      navigate('/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24 px-margin-mobile flex justify-center">
      {/* Kotak coklat di belakang navbar — tinggi sama persis dengan navbar (h-20 / 80px) */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#3E2B1F] z-40" />

      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-outline-variant/30 shadow-sm">
        <h1 className="font-headline-md text-headline-md text-on-background mb-6 text-center">Daftar Member</h1>

        {error && <p className="bg-error-container text-on-error-container text-sm rounded-lg p-3 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nama Lengkap</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange('name')}
              className="w-full mt-1 border border-outline-variant/40 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="w-full mt-1 border border-outline-variant/40 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange('password')}
              className="w-full mt-1 border border-outline-variant/40 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-3 rounded-full font-label-md hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Sudah punya akun?{' '}
          <Link to="/sign-in" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}