import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteLoader from './components/RouteLoader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import TentangKami from './pages/TentangKami.jsx';
import Member from './pages/Member.jsx';
import PeraturanAMDAL from './pages/PeraturanAMDAL';
import Pamflet from './pages/Pamflet.jsx';
import SignIn from './pages/SignIn.jsx';
import Daftar from './pages/Daftar.jsx';
import NotFound from './pages/NotFound.jsx';
import Search from './pages/Search.jsx';
import Narasumber from './pages/Narasumber';
import TenagaAhli from './pages/TenagaAhli';
import InstrukturPengajar from './pages/InstrukturPengajar';
import PenelitiArtikelJurnal from './pages/PenelitiArtikelJurnal';
import ProfilAhli from './pages/ProfilAhli';
import ProfilSaya from './pages/ProfilSaya.jsx';

// User (setelah login)
import Dashboard from './pages/Dashboard.jsx';
import LengkapiProfil from './pages/LengkapiProfil.jsx';
import PilihPaket from './pages/PilihPaket.jsx';
import Pembayaran from './pages/Pembayaran.jsx';
import RiwayatPembayaran from './pages/RiwayatPembayaran.jsx';

// Admin - list
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminExperts from './pages/admin/AdminExperts.jsx';
import AdminArticles from './pages/admin/AdminArticles.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminPartners from './pages/admin/AdminPartners.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminUserVerification from './pages/admin/AdminUserVerification.jsx';
import AdminPackages from './pages/admin/AdminPackages.jsx';

// Admin - form (tambah/edit)
import AdminExpertForm from './pages/admin/AdminExpertForm.jsx';
import AdminArticleForm from './pages/admin/AdminArticleForm.jsx';
import AdminCategoryForm from './pages/admin/AdminCategoryForm.jsx';
import AdminPartnerForm from './pages/admin/AdminPartnerForm.jsx';
import AdminPackageForm from './pages/admin/AdminPackageForm.jsx';

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verifikasi-user" element={<AdminUserVerification />} />
        <Route path="pembayaran" element={<AdminPayments />} />

        <Route path="paket" element={<AdminPackages />} />
        <Route path="paket/tambah" element={<AdminPackageForm />} />
        <Route path="paket/:id/edit" element={<AdminPackageForm />} />

        <Route path="tenaga-ahli" element={<AdminExperts />} />
        <Route path="tenaga-ahli/tambah" element={<AdminExpertForm />} />
        <Route path="tenaga-ahli/:id/edit" element={<AdminExpertForm />} />

        <Route path="artikel" element={<AdminArticles />} />
        <Route path="artikel/tambah" element={<AdminArticleForm />} />
        <Route path="artikel/:id/edit" element={<AdminArticleForm />} />

        <Route path="kategori" element={<AdminCategories />} />
        <Route path="kategori/tambah" element={<AdminCategoryForm />} />
        <Route path="kategori/:id/edit" element={<AdminCategoryForm />} />

        <Route path="mitra" element={<AdminPartners />} />
        <Route path="mitra/tambah" element={<AdminPartnerForm />} />
        <Route path="mitra/:id/edit" element={<AdminPartnerForm />} />
      </Route>

      <Route
        path="/*"
        element={
          <RouteLoader>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tentang-kami" element={<TentangKami />} />
                <Route path="/member" element={<Member />} />
                <Route path="/peraturan-amdal" element={<PeraturanAMDAL />} />
                <Route path="/pamflet" element={<Pamflet />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/daftar" element={<Daftar />} />
                <Route path="/search" element={<Search />} />
                <Route path="/narasumber" element={<Narasumber />} />
                <Route path="/tenaga-ahli" element={<TenagaAhli />} />
                <Route path="/instruktur-pengajar" element={<InstrukturPengajar />} />
                <Route path="/peneliti-artikel-jurnal" element={<PenelitiArtikelJurnal />} />
                <Route path="/profil/:slug" element={<ProfilAhli />} />

                <Route
                  path="/profil-saya"
                  element={
                    <ProtectedRoute>
                      <ProfilSaya />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lengkapi-profil"
                  element={
                    <ProtectedRoute>
                      <LengkapiProfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pilih-paket"
                  element={
                    <ProtectedRoute>
                      <PilihPaket />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pembayaran"
                  element={
                    <ProtectedRoute>
                      <Pembayaran />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/riwayat-pembayaran"
                  element={
                    <ProtectedRoute>
                      <RiwayatPembayaran />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </RouteLoader>
        }
      />
    </Routes>
  );
}