import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteLoader from './components/RouteLoader.jsx';
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

export default function App() {
  return (
    // RouteLoader dipasang di sini karena App.jsx sudah otomatis berada di
    // dalam <BrowserRouter> (lihat main.jsx), jadi useLocation() di dalam
    // RouteLoader bisa jalan. Dia akan menampilkan PageLoader (logo AMDAL)
    // setiap kali refresh pertama kali dan setiap kali route/path berubah.
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </RouteLoader>
  );
}