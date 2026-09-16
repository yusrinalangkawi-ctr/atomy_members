# PANDUAN PEMASANGAN GOOGLE APPS SCRIPT (GOOGLE SHEETS)

Berikut adalah panduan langkah demi langkah cara memasang dan melancarkan **Sistem Pengurusan Keahlian (Member Management System)** menggunakan fail `Code.gs` dan `Index.html` di dalam **Google Apps Script** dengan pangkalan data automatik **Google Sheets**.

---

## 📁 Struktur Fail Disediakan
1. **`Code.gs`** – Kod pelayan (backend) Google Apps Script:
   - Janaan Member ID secara atomik (`MBR-000001`) dengan `LockService` (mencegah ID berganda walaupun pendaftaran serentak).
   - Semakan duplikasi Nombor Telefon dan NRIC (12 digit).
   - Sambungan terus ke tab Google Sheets: `Members`, `WhatsAppLogs`, `ActivityLogs`, dan `Settings`.
   - Log masuk admin, penapisan rekod, kemas kini ahli, soft delete & pulih, serta audit trail.
2. **`Index.html`** – Antara muka pengguna (frontend) responsif:
   - UI moden menggunakan Tailwind CSS dan Lucide Icons.
   - Mengandungi Dashboard Pentadbir, Senarai Ahli (Kad Mudah Alih + Jadual Komputer), Borang Pendaftaran Rasmi, Skrin Kejayaan (Salin ID + Pautan Pantas WhatsApp), Modul Laporan & Eksport Excel (.xlsx) / CSV / Cetak PDF, Log WhatsApp, dan Tetapan Sistem.
   - Dihubungkan ke backend secara terus melalui `google.script.run`.

---

## 🚀 Langkah Demi Langkah Pemasangan

### Langkah 1: Cipta Google Sheet Baru
1. Buka [Google Sheets](https://sheets.new) di pelayar web anda.
2. Namakan Google Sheet anda, contohnya: **"Pangkalan Data Sistem Keahlian"**.

### Langkah 2: Buka Editor Apps Script
1. Pada menu atas Google Sheets, klik **Extensions** (atau **Sambungan**) ➔ **Apps Script**.
2. Tab baharu editor Google Apps Script akan terbuka.

### Langkah 3: Masukkan Kod `Code.gs`
1. Di panel sebelah kiri, anda akan melihat fail lalai bernama `Code.gs`.
2. Padam semua kod asal di dalam fail tersebut.
3. Buka fail **`Code.gs`** yang disediakan dan **Salin (Copy)** keseluruhan kandungannya.
4. **Tampal (Paste)** kod tersebut ke dalam fail `Code.gs` di editor Apps Script.
5. Tekan ikon simpan 💾 (**Save project**).

### Langkah 4: Cipta Fail `Index.html`
1. Di panel sebelah kiri editor Apps Script, klik butang **+** (Add a file) di sebelah *Files*.
2. Pilih **HTML**.
3. Namakan fail tersebut sebagai: `Index` *(Apps Script akan automatik menambah `.html`)*.
4. Padam kod templat asal dan **Salin & Tampal (Paste)** keseluruhan kandungan fail **`Index.html`** yang disediakan.
5. Tekan ikon simpan 💾 (**Save project**).

### Langkah 5: Lancarkan Aplikasi Web (Deploy as Web App)
1. Di sudut kanan atas editor Apps Script, klik butang biru **Deploy** ➔ **New deployment**.
2. Klik ikon gear ⚙️ di sebelah *Select type*, kemudian pilih **Web app**.
3. Isikan tetapan berikut:
   - **Description**: *Sistem Keahlian v1.0*
   - **Execute as**: **Me (emel anda)**
   - **Who has access**: **Anyone** *(membolehkan pengguna / ahli mengakses borang tanpa perlu login akaun Google peribadi)*
4. Klik **Deploy**.
5. Sistem akan meminta kebenaran (Authorization):
   - Klik **Authorize access**.
   - Pilih akaun Google anda.
   - Jika keluar amaran *"Google hasn't verified this app"*, klik **Advanced** ➔ klik **Go to (Untitled project) (unsafe)**.
   - Klik **Allow**.
6. Anda akan menerima **Web App URL** (contoh: `https://script.google.com/macros/s/.../exec`).

### Langkah 6: Gunakan Sistem!
1. Buka pautan **Web App URL** tersebut di telefon bimbit atau komputer anda.
2. Sistem akan memaparkan portal keahlian serta-merta!
3. Pada penggunaan pertama, sistem akan secara automatik membina 4 tab di dalam Google Sheet anda:
   - 🟢 `Members` (Rekod ahli berdaftar)
   - 💬 `WhatsAppLogs` (Sejarah notifikasi WhatsApp)
   - 📋 `ActivityLogs` (Audit trail semua aktiviti)
   - ⚙️ `Settings` (Konfigurasi prefix, digit, dan nombor admin)

---

## 🔑 Maklumat Pentadbir Lalai
- **Username**: `admin`
- **Password**: `admin123`
- Anda boleh menukar kata laluan atau nombor WhatsApp admin di dalam fail `Code.gs` (bahagian `ADMIN_CREDENTIALS` dan `Settings`).

---

## 📱 Ciri-Ciri Utama
- ✅ **Janaan ID Automatik**: Menggunakan format `MBR-000001` dengan turutan automatik berterusan.
- ✅ **Kalis Duplikasi**: Sistem menyekat pendaftaran sekiranya No Telefon atau NRIC 12-digit telah didaftarkan sebelum ini.
- ✅ **WhatsApp Sekali Klik**: Pautan terus `https://wa.me/...` sedia menghantar mesej ucapan selamat datang kepada ahli dan ringkasan kepada nombor admin.
- ✅ **Eksport Excel Segera**: Muat turun senarai ahli yang ditapis terus dalam format Microsoft Excel (.xlsx) atau CSV dengan sekali tekan.
- ✅ **Sokongan Penuh Telefon & Komputer**: Antara muka beradaptasi kepada kad mudah alih (mobile cards) dan jadual komputer meja (desktop table).
