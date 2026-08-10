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
import LupaPassword from './pages/LupaPassword.jsx';
import Daftar from './pages/Daftar.jsx';
import VerifikasiEmail from './pages/VerifikasiEmail.jsx';
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
import Membership from './pages/Membership.jsx';
import PilihPaket from './pages/PilihPaket.jsx';
import Pembayaran from './pages/Pembayaran.jsx';
import Invoice from './pages/Invoice.jsx';
import DaftarInvoice from './pages/DaftarInvoice.jsx';
import Pesan from './pages/Pesan.jsx';
import Tiket from './pages/Tiket.jsx';
import Ulasan from './pages/Ulasan.jsx';
import Statistik from './pages/Statistik.jsx';
import ProfilPublik from './pages/ProfilPublik.jsx';
import Pengaturan from './pages/Pengaturan.jsx';

// Admin
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminExperts from './pages/admin/AdminExperts.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminMembership from './pages/admin/AdminMembership.jsx';
import AdminTickets from './pages/admin/AdminTickets.jsx';
import AdminUserVerification from './pages/admin/AdminUserVerification.jsx';
import AdminPackages from './pages/admin/AdminPackages.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminExpertForm from './pages/admin/AdminExpertForm.jsx';
import AdminPackageForm from './pages/admin/AdminPackageForm.jsx';
import AdminInvoices from './pages/admin/AdminInvoices.jsx';
import AdminPublicProfile from './pages/admin/AdminPublicProfile.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminPamflets from './pages/admin/AdminPamflets.jsx';
import AdminPamfletForm from './pages/admin/AdminPamfletForm.jsx';

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
        <Route path="membership" element={<AdminMembership />} />
        <Route path="tiket" element={<AdminTickets />} />
        <Route path="paket" element={<AdminPackages />} />
        <Route path="paket/harga" element={<AdminPackages />} />
        <Route path="paket/tambah" element={<AdminPackageForm />} />
        <Route path="paket/:id/edit" element={<AdminPackageForm />} />
        <Route path="pamflet" element={<AdminPamflets />} />
        <Route path="pamflet/tambah" element={<AdminPamfletForm />} />
        <Route path="pamflet/:id/edit" element={<AdminPamfletForm />} />
        <Route path="tenaga-ahli" element={<AdminExperts />} />
        <Route path="tenaga-ahli/tambah" element={<AdminExpertForm />} />
        <Route path="tenaga-ahli/:id/edit" element={<AdminExpertForm />} />
        <Route path="invoice" element={<AdminInvoices />} />
        <Route path="profil-publik" element={<AdminPublicProfile />} />
        <Route path="pengguna" element={<AdminUsers />} />
        <Route path="laporan" element={<AdminReports />} />
        <Route path="pengaturan" element={<AdminSettings />} />
      </Route>

      {/* ── AUTH PAGES (No Navbar/Footer) ── */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/lupa-password" element={<LupaPassword />} />
      <Route path="/daftar" element={<Daftar />} />
      <Route path="/verifikasi-email" element={<VerifikasiEmail />} />

      {/* ── USER MEMBERSHIP & DASHBOARD (No Navbar/Footer, No RouteLoader) ── */}
      <Route path="/membership" element={<ProtectedRoute requiredRole="user"><Membership /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><Dashboard /></ProtectedRoute>} />
      <Route path="/profil-saya" element={<ProtectedRoute requiredRole="user"><ProfilSaya /></ProtectedRoute>} />
      <Route path="/paket" element={<ProtectedRoute requiredRole="user"><PilihPaket /></ProtectedRoute>} />
      <Route path="/pembayaran" element={<ProtectedRoute requiredRole="user"><Pembayaran /></ProtectedRoute>} />
      <Route path="/invoice" element={<ProtectedRoute requiredRole="user"><DaftarInvoice /></ProtectedRoute>} />
      <Route path="/invoice/:id" element={<ProtectedRoute requiredRole="user"><Invoice /></ProtectedRoute>} />
      <Route path="/pesan" element={<ProtectedRoute requiredRole="user"><Pesan /></ProtectedRoute>} />
      <Route path="/tiket" element={<ProtectedRoute requiredRole="user"><Tiket /></ProtectedRoute>} />
      <Route path="/ulasan" element={<ProtectedRoute requiredRole="user"><Ulasan /></ProtectedRoute>} />
      <Route path="/statistik" element={<ProtectedRoute requiredRole="user"><Statistik /></ProtectedRoute>} />
      <Route path="/profil-publik" element={<ProtectedRoute requiredRole="user"><ProfilPublik /></ProtectedRoute>} />
      <Route path="/pengaturan" element={<ProtectedRoute requiredRole="user"><Pengaturan /></ProtectedRoute>} />

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
                <Route path="/search" element={<Search />} />
                <Route path="/narasumber" element={<Narasumber />} />
                <Route path="/tenaga-ahli" element={<TenagaAhli />} />
                <Route path="/instruktur-pengajar" element={<InstrukturPengajar />} />
                <Route path="/peneliti-artikel-jurnal" element={<PenelitiArtikelJurnal />} />
                <Route path="/profil/:slug" element={<ProfilAhli />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </RouteLoader>
        }
      />
    </Routes>
  );
}
