import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteLoader from './components/RouteLoader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home from './pages/Home.jsx';
import TentangKami from './pages/TentangKami.jsx';
import Member from './pages/Member.jsx';
import PeraturanAMDAL from './pages/PeraturanAMDAL';
import Pamflet from './pages/Pamflet.jsx';
import SignIn from './pages/SignIn.jsx';
import Daftar from './pages/Daftar.jsx';
import MenungguVerifikasi from './pages/MenungguVerifikasi.jsx';
import NotFound from './pages/NotFound.jsx';
import Search from './pages/Search.jsx';
import Narasumber from './pages/Narasumber';
import TenagaAhli from './pages/TenagaAhli';
import InstrukturPengajar from './pages/InstrukturPengajar';
import PenelitiArtikelJurnal from './pages/PenelitiArtikelJurnal';
import ProfilAhli from './pages/ProfilAhli';

// Dashboard user (protected)
import Dashboard from './pages/Dashboard.jsx';
import ProfilSaya from './pages/ProfilSaya.jsx';
import PilihPaket from './pages/PilihPaket.jsx';
import Pembayaran from './pages/Pembayaran.jsx';
import ProfilPublik from './pages/ProfilPublik.jsx';
import Pengaturan from './pages/Pengaturan.jsx';

// Admin
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminExperts from './pages/admin/AdminExperts.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminUserVerification from './pages/admin/AdminUserVerification.jsx';
import AdminPackages from './pages/admin/AdminPackages.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminExpertForm from './pages/admin/AdminExpertForm.jsx';
import AdminPackageForm from './pages/admin/AdminPackageForm.jsx';

export default function App() {
  return (
    <Routes>
      {/* ── ADMIN ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verifikasi" element={<AdminUserVerification />} />
        <Route path="pembayaran" element={<AdminPayments />} />
        <Route path="paket" element={<AdminPackages />} />
        <Route path="paket/tambah" element={<AdminPackageForm />} />
        <Route path="paket/:id/edit" element={<AdminPackageForm />} />
        <Route path="tenaga-ahli" element={<AdminExperts />} />
        <Route path="tenaga-ahli/tambah" element={<AdminExpertForm />} />
        <Route path="tenaga-ahli/:id/edit" element={<AdminExpertForm />} />
        <Route path="laporan" element={<AdminReports />} />
        <Route path="pengaturan" element={<AdminSettings />} />
      </Route>

      {/* ── PUBLIC + USER ── */}
      <Route
        path="/*"
        element={
          <RouteLoader>
            <Layout>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/tentang-kami" element={<TentangKami />} />
                <Route path="/member" element={<Member />} />
                <Route path="/peraturan-amdal" element={<PeraturanAMDAL />} />
                <Route path="/pamflet" element={<Pamflet />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/daftar" element={<Daftar />} />
                <Route path="/menunggu-verifikasi" element={<MenungguVerifikasi />} />
                <Route path="/search" element={<Search />} />
                <Route path="/narasumber" element={<Narasumber />} />
                <Route path="/tenaga-ahli" element={<TenagaAhli />} />
                <Route path="/instruktur-pengajar" element={<InstrukturPengajar />} />
                <Route path="/peneliti-artikel-jurnal" element={<PenelitiArtikelJurnal />} />
                <Route path="/profil/:slug" element={<ProfilAhli />} />

                {/* Dashboard user (protected) */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profil-saya" element={<ProtectedRoute><ProfilSaya /></ProtectedRoute>} />
                <Route path="/paket" element={<ProtectedRoute><PilihPaket /></ProtectedRoute>} />
                <Route path="/pembayaran" element={<ProtectedRoute><Pembayaran /></ProtectedRoute>} />
                <Route path="/profil-publik" element={<ProtectedRoute><ProfilPublik /></ProtectedRoute>} />
                <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </RouteLoader>
        }
      />
    </Routes>
  );
}
