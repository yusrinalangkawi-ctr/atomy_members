# Sistem Pengurusan Keahlian (HTML, CSS & JAVA)

Sistem ini dibina menggunakan kombinasi **HTML5**, **CSS Tulen (Custom CSS)**, dan **JAVA** / **JavaScript**.

---

## 📁 Struktur Fail
```
java_html_css/
├── index.html        # Antara muka web (UI, borang, dashboard, laporan)
├── style.css         # Gaya CSS tulen (Emerald & Slate, moden & responsif)
├── app.js            # Logik kawalan (carian, validasi, WhatsApp, eksport Excel)
├── MemberServer.java # Pelayan backend Java (REST API & fail statik)
└── README.md         # Panduan penggunaan
```

---

## 🚀 Kaedah 1: Menggunakan Pelayan JAVA (Disyorkan)
Pelayan `MemberServer.java` menggunakan **Java Standard Library** terbina dalam (`com.sun.net.httpserver.HttpServer`). Anda **tidak perlukan** sebarang library tambahan (seperti Spring Boot atau Maven) untuk menjalankannya.

### Langkah-langkah:
1. Buka terminal/command prompt di dalam folder `java_html_css`:
   ```bash
   cd java_html_css
   ```
2. Kompil kod Java:
   ```bash
   javac MemberServer.java
   ```
3. Jalankan pelayan:
   ```bash
   java MemberServer
   ```
4. Buka pelayar web (browser) anda di:
   ```
   http://localhost:8080
   ```

---

## 💻 Kaedah 2: Buka Terus Tanpa Pelayan (Standalone HTML/CSS/JS)
Jika anda tidak mahu menjalankan pelayan Java dan hanya mahu melihat serta menguji antara muka web:
1. Klik dua kali (double-click) pada fail **`index.html`** untuk membukanya terus dalam pelayar anda (Chrome, Edge, Safari, Firefox).
2. Sistem akan beroperasi menggunakan **LocalStorage** pelayar secara automatik!

---

## 🔑 Maklumat Akses Pentadbir
* **Nama Pengguna**: `admin`
* **Kata Laluan**: `admin123`

---

## ✨ Ciri-Ciri Utama:
- **Janaan Member ID Automatik & Atomik**: Dilindungi dengan `ReentrantLock` & `AtomicInteger` dalam Java.
- **Pemeriksaan Duplikasi**: Menghalang no telefon atau NRIC yang sama didaftarkan dua kali.
- **Integrasi WhatsApp**: Pautan terus `wa.me` untuk notifikasi kepada ahli baru dan admin.
- **Eksport Laporan**: Sokongan muat turun fail **Excel (.xlsx)**, **CSV**, dan cetakan PDF.
- **100% Responsif**: Mesra telefon pintar (Bottom Navigation) dan komputer meja (Sidebar).
