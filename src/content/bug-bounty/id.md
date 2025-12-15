# Program Bug Bounty

> Terakhir Diperbarui: {{LAST_UPDATED}}

## Pengantar

Di {{SITE_NAME}}, kami bekerja sama dengan peneliti keamanan untuk menciptakan lingkungan internet yang lebih aman. Jika Anda menemukan kerentanan keamanan di layanan kami, harap segera hubungi kami.

Program ini saat ini beroperasi sebagai **Saluran Pengungkapan Kerentanan (Vulnerability Disclosure Channel)** yang berfokus pada pelaporan dan kolaborasi yang bertanggung jawab, bukan imbalan uang. Kami menghargai dan bekerja sama secara transparan dengan peneliti yang mengungkapkan kerentanan secara etis.

## Ruang Lingkup (In-Scope)

Peneliti hanya boleh menguji domain dan layanan berikut:

- Situs web resmi {{SITE_NAME}} dan subdomainnya
- Aplikasi seluler resmi {{SITE_NAME}} (jika tersedia)
- Titik akhir (endpoint) API yang dioperasikan langsung oleh {{SITE_NAME}}

Domain dan layanan pihak ketiga (gateway pembayaran, alat analitik, penyedia hosting, dll.) yang tidak tercantum di atas tidak tercakup dalam program ini. Jika Anda tidak yakin apakah target termasuk dalam ruang lingkup, silakan hubungi kami sebelum melakukan pengujian.

## Kebijakan Imbalan

Saat ini, Program Bug Bounty {{SITE_NAME}} tidak menawarkan imbalan uang reguler. Namun, untuk menunjukkan penghargaan kami atas kontribusi yang signifikan, kami mengoperasikan hal berikut:

- **Hall of Fame**: Mencantumkan nama-nama peneliti yang melaporkan kerentanan yang valid (saat beroperasi).
- **Pengakuan Publik**: Memberikan pengakuan publik atau surat rekomendasi dengan persetujuan peneliti.
- **Prioritas Masa Depan**: Memberikan kesempatan partisipasi prioritas jika kami beralih ke program berbayar di masa mendatang.

Kami mungkin akan memperkenalkan sistem imbalan uang (Bounty) di masa mendatang tergantung pada anggaran dan skala layanan, dan kami akan mengumumkannya di halaman ini jika diterapkan.

## Kriteria Tingkat Keparahan

| Tingkat Keparahan | CVSS | Contoh |
|---|---|---|
| Critical | 9.0-10.0 | Eksekusi kode jarak jauh (RCE), kebocoran DB lengkap, pengambilalihan akun massal |
| High | 7.0-8.9 | Injeksi SQL, Stored XSS, bypass otentikasi |
| Medium | 4.0-6.9 | Reflected XSS, CSRF tindakan sensitif, pengungkapan informasi |
| Low | 0.1-3.9 | Header keamanan hilang, pengungkapan versi |

Tingkat keparahan dapat disesuaikan berdasarkan dampak aktual.

## Melaporkan Kerentanan

### Saluran Pelaporan

- **Email**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Subjek**: `[Security Report] Vulnerability Summary` (Ringkasan Kerentanan)
- **Bahasa**: Harap tulis dalam bahasa Korea, Inggris, atau Indonesia.

### Format Laporan

Untuk membantu kami menganalisis dan mereproduksi masalah, harap sertakan hal berikut:

1. Jenis kerentanan dan deskripsi rinci.
2. Langkah-langkah spesifik untuk mereproduksi masalah (termasuk skrip atau baris perintah).
3. URL, titik akhir API, atau komponen yang terpengaruh.
4. Kode Proof of Concept (PoC) atau tangkapan layar.

### Standar Kualitas Laporan

- Laporan yang tidak dapat direproduksi atau kurang detail mungkin tidak diterima.
- Laporan keluaran pemindai otomatis tidak diterima.
- **Duplikat**: Kerentanan duplikat hanya dikreditkan kepada pelapor pertama. (Berdasarkan cap waktu penerimaan server email)

### Proses

1. **Konfirmasi Penerimaan**: Kami akan mengirimkan email konfirmasi dalam waktu 72 jam setelah laporan Anda.
2. **Analisis & Perencanaan**: Setelah kerentanan diverifikasi, kami akan menilai tingkat keparahannya dan memberi tahu Anda perkiraan jadwal perbaikan. Jika kami tidak dapat memenuhi tenggat waktu, kami akan menjelaskan alasannya dan memberikan jadwal yang diperbarui.
3. **Resolusi & Pemberitahuan**: Kami akan memberi tahu Anda setelah patch selesai. Penyelesaian mungkin memakan waktu jika perubahan struktural diperlukan untuk stabilitas layanan.
4. **Pengungkapan & Pengakuan**: Setelah diselesaikan, kami akan memutuskan pengungkapan melalui konsultasi dengan peneliti. Laporan yang valid akan diakui sesuai dengan 'Kebijakan Imbalan' di atas.
5. **Penerbitan CVE**: Untuk kerentanan yang signifikan, kami dapat meminta penerbitan nomor CVE dengan persetujuan pelapor.

### Kebijakan Pengungkapan Publik (Public Disclosure)

- Kami menyarankan pengungkapan setelah patch selesai dan meminta Anda membagikan detail pengungkapan kepada kami sebelumnya.
- Jika tidak ada tindakan yang tepat diambil dalam **60 hari** setelah laporan, pelapor memiliki hak untuk mengungkapkan detail kerentanan dengan cara yang disepakati bersama. (Namun, kami dapat meminta penyesuaian jadwal untuk masalah yang kompleks.)
- Dalam kasus mendesak di mana eksploitasi aktif diamati, kami dapat berkoordinasi dengan Anda untuk pengungkapan lebih awal.

## Kebijakan & Pedoman Pengujian

Harap patuhi pedoman berikut untuk pengujian kerentanan yang aman.

### Aktivitas yang Diizinkan

- Menguji kerentanan menggunakan akun yang Anda miliki atau akun pengujian yang Anda buat.
- **Verifikasi Minimal**: Akses hanya data minimum yang diperlukan untuk membuktikan kerentanan. Jika Anda secara tidak sengaja mengakses informasi sensitif orang lain, segera hentikan dan sertakan hanya informasi yang disamarkan dalam laporan Anda.

### Lingkungan Pengujian

- **Permintaan Akun Tes**: Jika Anda memerlukan akun tes, Anda dapat memintanya di [{{EMAIL}}](mailto:{{EMAIL}}).
- **Pemindaian Otomatis**: Pemindaian ringan diperbolehkan, tetapi pemindaian beban tinggi yang menghasilkan permintaan berlebihan per detik atau memengaruhi kualitas layanan memerlukan koordinasi sebelumnya.

### Aktivitas yang Dilarang (Di Luar Cakupan)

Aktivitas berikut sangat dilarang dan mungkin tidak dilindungi secara hukum jika dilanggar:

- Menjalankan **pemindaian otomatis yang berlebihan** (pada tingkat yang menyebabkan beban layanan) tanpa koordinasi sebelumnya.
- Segala aktivitas yang secara sengaja menghabiskan sumber daya server (CPU, memori, disk, bandwidth jaringan).
- Mengakses atau memodifikasi akun, data, atau informasi pribadi pengguna lain.
- Rekayasa sosial (phishing, dll.) atau serangan keamanan fisik.

### Secara Eksplisit Di Luar Cakupan (Out-of-Scope)

- Kerentanan ditemukan di layanan atau infrastruktur pihak ketiga.
- Keamanan fisik, sistem SDM, jaringan internal.
- Kerentanan yang sudah publik atau laporan duplikat.
- Masalah yang disebabkan semata-mata oleh pengiriman spam atau email phishing.

### Kerentanan Berisiko Rendah (Tidak Diterima)

Hal-hal berikut dikecualikan dari program karena menimbulkan risiko keamanan yang rendah atau merupakan perilaku yang disengaja:

- CSRF berdampak rendah seperti logout CSRF
- Clickjacking pada halaman tanpa informasi sensitif
- Pengungkapan versi sederhana (banner grabbing)
- Pengaturan keamanan yang hilang tanpa jalur eksploitasi yang terbukti (misalnya, header keamanan yang hilang tanpa dampak langsung, kebijakan pengiriman email yang tidak dikonfigurasi, dll.)
- Isi otomatis browser diaktifkan

Namun, item di atas pun dapat dievaluasi jika dirangkai dengan kerentanan lain untuk membuktikan skenario serangan yang sebenarnya.

### Perlindungan Peneliti (Safe Harbor)

Jika Anda meneliti dan melaporkan kerentanan dengan itikad baik dan sesuai dengan kebijakan ini, kami menjanjikan hal berikut **sejauh diizinkan oleh hukum yang berlaku**:

1. Kami menganggap aktivitas penelitian Anda sebagai penelitian keamanan resmi dan tidak akan mengambil tindakan hukum perdata atau pidana apa pun terhadap Anda.
2. Kami tidak akan secara sukarela melaporkan Anda ke penegak hukum atau mengajukan keluhan.
3. Jika pihak ketiga memulai tindakan hukum terkait aktivitas penelitian Anda, kami akan memberikan dukungan dalam rentang yang wajar, seperti memberikan dokumentasi yang membuktikan bahwa Anda adalah peneliti yang patuh.

Namun, Safe Harbor tidak berlaku dalam kasus berikut:

- Pelanggaran yang jelas terhadap aktivitas yang dilarang dalam dokumen ini.
- Pengujian tidak sah terhadap sistem atau infrastruktur pihak ketiga di luar kendali kami.

## Kontak

Jika Anda memiliki pertanyaan tentang Program Bug Bounty kami, jangan ragu untuk menghubungi kami di [{{EMAIL}}](mailto:{{EMAIL}}).
