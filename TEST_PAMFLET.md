# 🧪 Pamflet CRUD Testing Guide

## Quick Test Checklist

### ✅ Backend Tests

1. **Database Check**
```bash
cd backend
php artisan tinker --execute="echo App\Models\Pamflet::count() . ' pamflets in database'"
```
Expected: `5 pamflets in database`

2. **Routes Check**
```bash
php artisan route:list --name=pamflet
```
Expected: 6 routes displayed

3. **Model Test**
```bash
php artisan tinker --execute="echo App\Models\Pamflet::first()->title"
```
Expected: First pamflet title displayed

### ✅ Frontend Tests

1. **Build Test**
```bash
cd frontend
npm run build
```
Expected: Build completes without errors

2. **Dev Server**
```bash
npm run dev
```
Expected: Server starts on http://localhost:5174

### ✅ Manual UI Tests

1. **Login as Admin**
   - Go to `/sign-in`
   - Login with admin credentials
   - Should redirect to `/admin`

2. **Navigate to Pamflet Menu**
   - Click "Pamflet" in sidebar
   - Should show list of 5 pamflets
   - Filters should work (Type, Status, Search)

3. **Create New Pamflet**
   - Click "Tambah Pamflet" button
   - Fill all fields
   - Upload image (jpg/png, < 5MB)
   - Upload document (pdf, < 10MB)
   - Click "Simpan"
   - Should redirect to list with new item

4. **Edit Pamflet**
   - Click "Edit" on any pamflet
   - Modify fields
   - Upload new image (optional)
   - Click "Simpan"
   - Should update successfully

5. **Delete Pamflet**
   - Click "Hapus" on any pamflet
   - Confirm deletion
   - Should remove from list
   - Files should be deleted from storage

### ✅ Filter Tests

1. **Filter by Type**
   - Select "Pelatihan" from Type dropdown
   - Should show only training pamflets

2. **Filter by Status**
   - Select "Dipublikasi" from Status dropdown
   - Should show only published pamflets

3. **Search**
   - Type "AMDAL" in search box
   - Should filter results matching keyword

### ✅ File Upload Tests

1. **Image Upload**
   - Try uploading JPG (< 5MB): ✅ Should work
   - Try uploading PNG (< 5MB): ✅ Should work
   - Try uploading PDF: ❌ Should reject
   - Try uploading > 5MB: ❌ Should reject

2. **Document Upload**
   - Try uploading PDF (< 10MB): ✅ Should work
   - Try uploading DOC (< 10MB): ✅ Should work
   - Try uploading DOCX (< 10MB): ✅ Should work
   - Try uploading JPG: ❌ Should reject
   - Try uploading > 10MB: ❌ Should reject

### ✅ Validation Tests

1. **Required Fields**
   - Try submitting without title: ❌ Should show error
   - All other fields optional: ✅ Should work

2. **Date Format**
   - Enter valid date (YYYY-MM-DD): ✅ Should work
   - Enter invalid date: ❌ Should show error

### ✅ API Tests (using curl or Postman)

1. **List Pamflets** (requires auth token)
```bash
GET http://localhost/TenagaAhli/TenagaAhli/backend/public/admin/pamflets
Header: Authorization: Bearer {token}
```

2. **Create Pamflet** (requires auth token)
```bash
POST http://localhost/TenagaAhli/TenagaAhli/backend/public/admin/pamflets
Header: Authorization: Bearer {token}
Header: Content-Type: multipart/form-data
Body: FormData with fields
```

3. **Update Pamflet** (requires auth token)
```bash
POST http://localhost/TenagaAhli/TenagaAhli/backend/public/admin/pamflets/{id}
Header: Authorization: Bearer {token}
Body: FormData with _method=PUT
```

4. **Delete Pamflet** (requires auth token)
```bash
DELETE http://localhost/TenagaAhli/TenagaAhli/backend/public/admin/pamflets/{id}
Header: Authorization: Bearer {token}
```

## Expected Results Summary

✅ All CRUD operations work without errors
✅ File uploads validated correctly
✅ Filters work as expected
✅ Search functionality works
✅ Old files deleted on update/delete
✅ Authorization required for all operations
✅ Validation messages show correctly
✅ UI responsive and user-friendly

## Troubleshooting

### Issue: 404 Not Found
- Check if Laravel backend is running
- Verify routes: `php artisan route:list --name=pamflet`
- Check APP_URL in `.env`

### Issue: 401 Unauthorized
- Verify auth token in request headers
- Check if user is logged in as admin

### Issue: File upload fails
- Check folder permissions: `storage/app/public/pamflets/`
- Verify max upload size in `php.ini`
- Check file validation rules

### Issue: Frontend not showing
- Clear browser cache
- Rebuild frontend: `npm run build`
- Check console for errors

---

**Status:** Ready for Production ✅
**Last Updated:** 2026-08-06
