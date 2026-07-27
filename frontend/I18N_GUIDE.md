# Multi-Language (i18n) Implementation Guide

## 📋 Setup Complete

✅ react-i18next installed and configured
✅ Translation files created (Indonesian & English)
✅ Language switcher added to navbar
✅ localStorage persistence enabled
✅ Navbar & Footer translated

---

## 🚀 How to Use i18n in Components

### 1. Import the hook:
```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Use the hook in your component:
```jsx
export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.hero_title')}</h1>
      <p>{t('home.hero_description')}</p>
    </div>
  );
}
```

### 3. With interpolation (variables):
```jsx
<h1>{t('dashboard.welcome', { name: userName })}</h1>
// Output: "Selamat Datang, John" (ID) or "Welcome, John" (EN)
```

### 4. Pluralization:
```jsx
<p>{t('expert.showing_results', { count: totalExperts })}</p>
// Output: "Menampilkan 5 hasil"
```

---

## 📂 Translation File Structure

All translations are in `src/i18n/locales/`:
- `id.json` - Bahasa Indonesia
- `en.json` - English

### Categories:
- `common` - Common words (loading, save, cancel, etc.)
- `navbar` - Navigation menu
- `footer` - Footer content
- `home` - Home page
- `about` - About Us page
- `expert` - Expert listing & profile
- `profile` - User profile
- `dashboard` - Dashboard
- `payment` - Payment pages
- `membership` - Membership packages
- `auth` - Login, Register, Verify
- `admin` - Admin dashboard
- `error` - Error messages
- `validation` - Form validation
- `success` - Success messages

---

## 🔄 How to Add New Translations

### Step 1: Add to both JSON files

**id.json:**
```json
{
  "mypage": {
    "title": "Judul Saya",
    "description": "Deskripsi dalam Bahasa Indonesia"
  }
}
```

**en.json:**
```json
{
  "mypage": {
    "title": "My Title",
    "description": "Description in English"
  }
}
```

### Step 2: Use in component:
```jsx
<h1>{t('mypage.title')}</h1>
<p>{t('mypage.description')}</p>
```

---

## 🎯 Pages That Need Translation

### ✅ Already Translated:
- Navbar
- Footer
- Layout components

### ⏳ Need Translation (TODO):
- **Home.jsx** - Hero section, features, how it works
- **TentangKami.jsx** - About us content
- **Member.jsx** - Member listing
- **TenagaAhli.jsx** - Expert listing
- **InstrukturPengajar.jsx** - Instructor listing
- **Narasumber.jsx** - Speaker listing
- **PenelitiArtikelJurnal.jsx** - Researcher listing
- **ProfilAhli.jsx** - Expert profile detail
- **Search.jsx** - Search page
- **Dashboard.jsx** - User dashboard ✅ (Already has translations)
- **ProfilSaya.jsx** - Edit profile
- **PilihPaket.jsx** - Choose package
- **Pembayaran.jsx** - Payment page
- **ProfilPublik.jsx** - Public profile view
- **Pengaturan.jsx** - Settings
- **SignIn.jsx** - Login page
- **Daftar.jsx** - Register page
- **VerifikasiEmail.jsx** - Email verification
- **NotFound.jsx** - 404 page
- **AdminDashboard.jsx** - Admin dashboard
- **AdminExperts.jsx** - Admin experts management
- **AdminPayments.jsx** - Admin payments
- **AdminUserVerification.jsx** - Admin user verification
- **AdminPackages.jsx** - Admin packages management

---

## 💡 Example: Translating a Page

### Before (Hardcoded):
```jsx
export default function MyPage() {
  return (
    <div>
      <h1>Selamat Datang</h1>
      <button>Simpan</button>
    </div>
  );
}
```

### After (Translated):
```jsx
import { useTranslation } from 'react-i18next';

export default function MyPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('mypage.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

---

## 🌐 Language Switcher

The language switcher is automatically included in the navbar. It:
- Shows current language with flag icon (🇮🇩/🇬🇧)
- Saves selection to localStorage
- Persists across page refreshes
- Updates all translated content instantly

---

## 🛠️ Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Click language switcher in navbar**
3. **Verify all text changes to selected language**
4. **Refresh page - language should persist**

---

## 📝 Translation Keys Reference

### Common Actions:
- `common.loading` - "Memuat..." / "Loading..."
- `common.search` - "Cari" / "Search"
- `common.save` - "Simpan" / "Save"
- `common.cancel` - "Batal" / "Cancel"
- `common.delete` - "Hapus" / "Delete"
- `common.edit` - "Edit" / "Edit"

### Navbar:
- `navbar.home` - "Beranda" / "Home"
- `navbar.about` - "Tentang Kami" / "About Us"
- `navbar.login` - "Masuk" / "Login"
- `navbar.register` - "Daftar" / "Register"

### Dashboard:
- `dashboard.welcome` - "Selamat Datang, {{name}}" / "Welcome, {{name}}"
- `dashboard.account_status` - "Status Akun" / "Account Status"
- `dashboard.points_level` - "Poin & Level" / "Points & Level"

### Forms:
- `auth.email` - "Email" / "Email"
- `auth.password` - "Password" / "Password"
- `auth.login_button` - "Masuk" / "Login"

---

## 🔍 Finding Translation Keys

All translations are defined in:
- `src/i18n/locales/id.json`
- `src/i18n/locales/en.json`

Use your code editor's search (Ctrl+F) to find existing translations before adding new ones.

---

## ✨ Best Practices

1. **Always use translation keys, never hardcode text**
   ```jsx
   ❌ <h1>Selamat Datang</h1>
   ✅ <h1>{t('welcome')}</h1>
   ```

2. **Group related translations**
   ```json
   {
     "profile": {
       "title": "Profil",
       "edit": "Edit Profil",
       "save": "Simpan Profil"
     }
   }
   ```

3. **Use common translations for repeated text**
   ```jsx
   <button>{t('common.save')}</button>
   ```

4. **Keep translations consistent**
   - Use the same translation key for the same concept across pages

5. **Test both languages**
   - Ensure translations make sense in context
   - Check for text overflow in UI

---

## 🚨 Troubleshooting

### Translation key not found:
- Check if key exists in both `id.json` and `en.json`
- Verify correct key path (e.g., `home.title` not `home_title`)

### Text not updating when changing language:
- Ensure component uses `useTranslation()` hook
- Check if key is wrapped in `t()` function

### Language not persisting:
- Check browser localStorage
- Clear cache and cookies
- Verify i18n config has `caches: ['localStorage']`

---

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)

---

**Created by:** TenagaAhli.com Development Team
**Date:** July 27, 2026
**Version:** 1.0.0
