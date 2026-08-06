# Pamflet CRUD API Documentation

## Overview
Pamflet module untuk mengelola pamflet pengumuman, pelatihan, seminar, dan workshop di admin dashboard.

## Database Schema
**Table:** `pamflets`

| Column        | Type      | Description                           |
|---------------|-----------|---------------------------------------|
| id            | bigint    | Primary key                           |
| title         | string    | Judul pamflet (required)              |
| description   | text      | Deskripsi pamflet                     |
| image         | string    | Path gambar (jpg/png, max 5MB)        |
| type          | string    | announcement/training/seminar/workshop|
| event_date    | date      | Tanggal acara                         |
| location      | string    | Lokasi acara                          |
| organizer     | string    | Penyelenggara                         |
| is_published  | boolean   | Status publikasi (default: false)     |
| order         | integer   | Urutan tampil (default: 0)            |
| created_at    | timestamp | Waktu dibuat                          |
| updated_at    | timestamp | Waktu diupdate                        |

## API Endpoints

### 1. Get All Pamflets
**GET** `/admin/pamflets`

**Query Parameters:**
- `type` (string, optional): Filter by type (announcement/training/seminar/workshop)
- `is_published` (boolean, optional): Filter by publication status
- `keyword` (string, optional): Search in title, description, organizer

**Response:**
```json
[
  {
    "id": 1,
    "title": "Pelatihan AMDAL",
    "description": "Deskripsi...",
    "image": "pamflets/images/xxx.jpg",
    "type": "training",
    "event_date": "2026-09-05",
    "location": "Jakarta",
    "organizer": "TenagaAhli.com",
    "is_published": true,
    "order": 1,
    "created_at": "2026-08-06T10:00:00.000000Z",
    "updated_at": "2026-08-06T10:00:00.000000Z"
  }
]
```

### 2. Create Pamflet
**POST** `/admin/pamflets`

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Body (FormData):**
- `title` (string, required): Judul pamflet
- `description` (string, optional): Deskripsi
- `image` (file, optional): Image file (jpg/jpeg/png, max 5MB)
- `type` (string, optional): announcement/training/seminar/workshop
- `event_date` (date, optional): YYYY-MM-DD
- `location` (string, optional): Lokasi acara
- `organizer` (string, optional): Penyelenggara
- `is_published` (boolean, optional): true/false (1/0)
- `order` (integer, optional): Urutan

**Response:**
```json
{
  "message": "Pamflet berhasil dibuat",
  "data": { ... }
}
```

### 3. Get Single Pamflet
**GET** `/admin/pamflets/{id}`

**Response:**
```json
{
  "id": 1,
  "title": "...",
  ...
}
```

### 4. Update Pamflet
**PUT/PATCH** `/admin/pamflets/{id}`

atau

**POST** `/admin/pamflets/{id}` dengan `_method=PUT` (untuk multipart/form-data)

**Body:** Same as Create

**Response:**
```json
{
  "message": "Pamflet berhasil diperbarui",
  "data": { ... }
}
```

### 5. Delete Pamflet
**DELETE** `/admin/pamflets/{id}`

**Response:**
```json
{
  "message": "Pamflet berhasil dihapus"
}
```

## File Upload
- **Images:** Stored in `storage/app/public/pamflets/images/`
- Image file is automatically deleted when pamflet is updated or deleted

## Frontend Routes
- List: `/admin/pamflet`
- Create: `/admin/pamflet/tambah`
- Edit: `/admin/pamflet/{id}/edit`

## Frontend Components
- `AdminPamflets.jsx` - List page with search, filter, pagination
- `AdminPamfletForm.jsx` - Create/Edit form with image upload (single file only)

## Testing
Run seeder to create sample data:
```bash
php artisan db:seed --class=PamfletSeeder
```

## Notes
- All routes require authentication (`auth:sanctum` middleware)
- Only image upload supported (no document file)
- Images are validated for type (jpg/png) and size (max 5MB)
- Old image is automatically deleted on update
- Pamflets are ordered by `order` (asc) then `created_at` (desc)
