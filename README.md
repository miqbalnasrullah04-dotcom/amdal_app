# AMDAL.ID — React + Laravel

Konversi dari HTML statis ke arsitektur **React (frontend/SPA)** + **Laravel (backend/API)**.
Semua halaman (Home, Tentang Kami, Member, Peraturan KLHS, Pamflet, Sign in, Daftar) sudah
saling terhubung lewat satu Navbar & Footer bersama, memakai `react-router-dom`.

```
amdal-app/
├── frontend/   → React 18 + Vite + Tailwind + React Router
└── backend/    → Laravel (routes, controllers, models, migrations, seeder)
```

## Peta Halaman (React Router) ↔ Laravel API

| Halaman React (`frontend/src/pages`) | Route        | Endpoint Laravel dipakai         |
|---------------------------------------|--------------|-----------------------------------|
| `Home.jsx`                             | `/`          | `GET /api/stats`, `GET /api/experts?featured=1` |
| `TentangKami.jsx`                      | `/tentang-kami` | — (statis) |
| `Member.jsx`                           | `/member`    | `GET /api/experts?keyword=&lokasi=&kategori=` |
| `PeraturanKLHS.jsx`                    | `/peraturan-klhs` | `GET /api/regulations` |
| `Pamflet.jsx`                          | `/pamflet`   | `GET /api/pamflet` |
| `SignIn.jsx`                           | `/sign-in`   | `POST /api/login` |
| `Daftar.jsx`                           | `/daftar`    | `POST /api/register` |

Navbar (`components/Navbar.jsx`) dan Footer (`components/Footer.jsx`) memuat link ke
**semua** halaman tersebut sehingga tiap halaman saling tersambung, sama seperti menu di
desain HTML aslinya (Home, Tentang Kami, Member, Peraturan KLHS, Pamflet, Sign in, Daftar).

Kotak pencarian di Home otomatis mengarahkan (redirect) ke halaman `/member` dengan
query `?keyword=...&lokasi=...`, dan kartu kategori mengarah ke `/member?kategori=...`
— jadi pencarian di Home benar-benar tersambung ke halaman Member.

## 1. Menjalankan Backend (Laravel)

Folder `backend/` di sini berisi file inti (routes, controllers, models, migrations,
seeder, config) yang tinggal disalin ke instalasi Laravel standar:

```bash
composer create-project laravel/laravel amdal-backend
cd amdal-backend

# Salin file dari backend/ hasil convert ke project Laravel ini (timpa file yang sama)
# routes/api.php, routes/web.php, app/Http/Controllers/*, app/Models/*,
# database/migrations/*, database/seeders/DemoSeeder.php, config/cors.php, .env.example

composer require laravel/sanctum
php artisan install:api   # atau: php artisan vendor:publish --tag=sanctum-config

cp .env.example .env
php artisan key:generate

# Sesuaikan koneksi database di .env, lalu:
php artisan migrate
php artisan db:seed --class=DemoSeeder

php artisan serve   # -> http://localhost:8000
```

Pastikan model `User` menggunakan trait `Laravel\Sanctum\HasApiTokens` supaya
`createToken()` di `AuthController` berfungsi.

## 2. Menjalankan Frontend (React)

```bash
cd frontend
npm install
npm run dev   # -> http://localhost:5173
```

Saat development, `vite.config.js` sudah mem-proxy `/api/*` ke `http://localhost:8000`
(server Laravel), jadi kedua server tinggal dijalankan bersamaan.

## 3. Build untuk Produksi (satu domain)

```bash
cd frontend
npm run build          # menghasilkan frontend/dist

# salin isi frontend/dist/* ke backend/public/ (project Laravel)
```

`routes/web.php` di backend sudah berisi catch-all route yang menyajikan `index.html`
React untuk semua path selain `/api/*`, sehingga React Router tetap menangani navigasi
antar halaman di sisi klien setelah Laravel menyajikan file build tersebut.

## 4. Ganti data dummy dengan data asli

Setiap halaman punya fallback data dummy (kalau API belum aktif) di dalam
`useEffect(...).catch(() => setState([...dummy]))`. Setelah backend Laravel berjalan
dan sudah di-seed, data asli dari database otomatis dipakai — fallback dummy hanya
untuk membuat tampilan tetap bisa dicoba sebelum backend siap.
