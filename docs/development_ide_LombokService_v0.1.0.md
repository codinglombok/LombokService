# Pengembangan LombokService

## 1. Roadmap

- 0.1.1: CI, coverage, fuzz, publish; verifikasi dengan alat target asli
- 0.2.0: port Rust, Go, PHP; target FreeBSD rc.d dan SysV
- 0.3.0: bidang lanjutan opsional (batas sumber daya, ketergantungan)

## 2. Deferred scope

Memasang, memulai, atau memeriksa layanan; hak akses berkas; skrip SysV lama dan FreeBSD rc.d (BELUM); bidang lanjutan unit systemd (sandboxing, ketergantungan khusus).

## 3. Prinsip desain untuk kontributor

- Kontrak dulu: ubah SPEC dan vector sebelum kode; perbedaan antar-port adalah bug.
- Tanpa dependensi runtime; tanpa jam, tanpa jaringan, tanpa acak tersembunyi.
- Setiap fitur README memiliki kasus vector atau test.
- Tidak ada nama klien atau aplikasi pemilik di berkas publik.
- Tanpa emoji di `*.md`.

## 4. Cara berkontribusi

Fork, cabang `feat/...`, jalankan kedua runner vector, perbarui `API_` dan `SPEC_` bila perilaku berubah, buka PR. Bangkitkan ulang vector dengan `node scripts/gen_vectors.ts` hanya bila kontrak berubah, dan tinjau diff vector.

## 5. Pertanyaan terbuka

- Apakah dukungan env pada Windows perlu dibuat lewat registri layanan?
- Perlu versi target (misal systemd minimum) sebagai parameter?
