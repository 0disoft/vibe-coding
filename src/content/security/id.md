# Kebijakan Keamanan

> Terakhir Diperbarui: {{LAST_UPDATED}}

## Teknologi & Prinsip Perlindungan Data

Data pengguna diproses dengan aman dengan langkah-langkah perlindungan yang diterapkan pada beberapa lapisan, termasuk enkripsi saat istirahat dan TLS saat transit.

### Perlindungan Kata Sandi

**Kata sandi pengguna tidak pernah disimpan dalam teks biasa dan dilindungi menggunakan teknologi hashing terbaru.**

- **Algoritma**: {{ENC_ALGO_PASSWORD}}
- **Alasan**: {{ENC_REASON_PASSWORD}}
- Garam (Salt) unik diterapkan pada setiap kata sandi untuk mencegah serangan rainbow table.

### Enkripsi Data

**Informasi sensitif dienkripsi segera sebelum penyimpanan, dengan manajemen kunci yang dipisahkan secara ketat.**

- **Algoritma**: {{ENC_ALGO_DATA}}
- **Alasan**: {{ENC_REASON_DATA}}
- **Derivasi Kunci**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Kami menggunakan Enkripsi Amplop (Envelope Encryption) untuk melindungi Kunci Enkripsi Data (DEK) dengan Kunci Enkripsi Kunci (KEK) terpisah.

### Integritas Data

**Fungsi hash berkinerja tinggi digunakan untuk memverifikasi bahwa data sistem kritis belum dirusak.**

- **Algoritma**: {{ENC_ALGO_INTEGRITY}}
- **Alasan**: {{ENC_REASON_INTEGRITY}}

### Keamanan Transportasi

**Semua komunikasi antara pengguna dan server dilindungi oleh terowongan terenkripsi menggunakan protokol keamanan terbaru.**

- **Protokol**: {{ENC_ALGO_TRANSPORT}}
- **Alasan**: {{ENC_REASON_TRANSPORT}}
- HTTPS diberlakukan untuk semua komunikasi, dan HSTS diterapkan untuk mencegah serangan penurunan versi secara ketat.

## Keamanan Administratif & Fisik

Di luar langkah-langkah teknis, kami mengelola keamanan secara menyeluruh terkait orang dan proses.

- **Kontrol Akses Karyawan**: Akses data hanya diberikan kepada personel penting berdasarkan 'Prinsip Hak Istimewa Paling Sedikit'. Semua riwayat akses dicatat dan diaudit. Akses tanpa alasan yang sah sangat dilarang.
- **Keamanan Fisik**: Semua infrastruktur cloud pihak ketiga beroperasi di pusat data yang telah memperoleh sertifikasi keamanan fisik seperti ISO 27001.

## Keamanan Akun & Sesi

- **Perlindungan Login**: Kami menerapkan batas upaya login dan mekanisme penundaan untuk memblokir serangan brute-force otomatis.
- **Manajemen Sesi**: Sesi berakhir secara otomatis setelah periode tidak aktif, dan notifikasi dikirim untuk perubahan akun penting.
- **Autentikasi Dua Faktor**: Kami berencana untuk memperkenalkan fungsionalitas 2FA di masa mendatang.

## Keamanan Aplikasi

Kami merancang dengan mempertimbangkan praktik terbaik keamanan seperti OWASP Top 10 sejak tahap pengembangan.

- **Validasi Input**: Pernyataan yang Disiapkan dan ORM digunakan untuk kueri basis data, dan input pengguna divalidasi di sisi server dan klien.
- **Pertahanan Serangan**: Token CSRF, atribut cookie SameSite, dan CSP (Kebijakan Keamanan Konten) diterapkan untuk memitigasi pembajakan sesi dan serangan injeksi skrip.

## Keamanan Rantai Pasokan Perangkat Lunak

- **Manajemen Ketergantungan**: Pustaka dan paket eksternal hanya diinstal dari registri resmi, dan versi terverifikasi dipastikan melalui file kunci.
- **Pemeriksaan Kerentanan**: Laporan kerentanan ditinjau secara berkala, dan ketergantungan berisiko tinggi diprioritaskan untuk pembaruan.

## Penyimpanan & Penghapusan Data

- **Penghapusan Akun**: Atas permintaan penghapusan akun, data terkait dihancurkan secara permanen setelah masa tenggang 30 hari (untuk pemulihan penghapusan yang tidak disengaja).
- **Data Cadangan**: Cadangan untuk stabilitas sistem disimpan selama maksimal 90 hari dan kemudian dihapus dengan aman. Karena keterbatasan teknis, penghapusan total dari sistem cadangan mungkin memerlukan waktu tambahan.
- **Data Log**: Log akses disimpan selama 1 tahun untuk analisis ancaman keamanan jangka panjang dan identifikasi tren.
- **Pengecualian Penyimpanan Hukum**: Data yang diharuskan oleh hukum untuk disimpan selama periode tertentu dapat disimpan secara terpisah selama durasi yang berlaku.

## Respons Insiden

Jika terjadi insiden keamanan, kami mengikuti prosedur ini untuk respons cepat dan meminimalkan kerusakan:

1. **Deteksi & Penahanan (Segera)**: Mengisolasi ancaman dan mencegah kerusakan lebih lanjut.
2. **Analisis Dampak**: Menilai ruang lingkup dan tingkat keparahan secepat mungkin, biasanya dalam hitungan jam.
3. **Pemberitahuan Pengguna**: Untuk insiden yang memengaruhi pengguna (misalnya, kebocoran data), beri tahu pengguna secepat mungkin dan patuhi tenggat waktu hukum (misalnya, 72 jam).
4. **Pengungkapan Transparan**: Publikasikan laporan terperinci (penyebab, tindakan, langkah pencegahan) setelah insiden diselesaikan.

## Audit Keamanan & Layanan Pihak Ketiga

- **Audit Keamanan**: Kami saat ini dalam tahap stabilisasi layanan dan melakukan tinjauan kode internal dan pemeriksaan keamanan secara berkala. Kami berencana untuk memperkenalkan audit keamanan pihak ketiga secara berkala seiring dengan skala layanan.
- **Infrastruktur Pihak Ketiga**: Kami mematuhi prinsip untuk tidak menyimpan informasi sensitif yang tidak dienkripsi secara langsung. Untuk fungsi inti seperti pembayaran dan autentikasi, kami menggunakan layanan tepercaya ({{THIRD_PARTY_PROVIDERS}}, dll.) yang telah memperoleh sertifikasi keamanan yang diakui secara internasional (SOC 2, ISO 27001) atau menjalani penilaian keamanan yang setara secara berkala.

## Rekomendasi Keamanan untuk Pengguna

Keamanan akun adalah tanggung jawab bersama.

- **Kata Sandi Kuat**: Gunakan kata sandi yang unik dan rumit yang tidak digunakan di situs lain.
- **Hati-hati terhadap Phishing**: Berhati-hatilah terhadap pesan yang mengaku sebagai email resmi dan periksa alamat sebelum mengklik tautan.

## Kontak

Jika Anda memiliki pertanyaan mengenai Kebijakan Keamanan kami, silakan hubungi kami di [{{EMAIL}}](mailto:{{EMAIL}}).

Untuk laporan kerentanan dan kebijakan perlindungan peneliti, silakan lihat halaman [Program Bug Bounty](/id/bug-bounty) kami.
