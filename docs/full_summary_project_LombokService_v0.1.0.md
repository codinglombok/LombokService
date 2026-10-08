# Ringkasan Proyek LombokService

## Apa ini

Render service definitions for systemd, launchd, Windows (sc.exe) and OpenWrt procd from one specification, with exact quoting and escaping per target. Part of the Lombok Ecosystem.

## Mengapa dibuat

Memasang program sebagai layanan berarti menulis berkas berbeda untuk tiap sistem dengan aturan kutip dan escape yang berbeda dan mudah salah. Library ini menerima satu spesifikasi dan menghasilkan teks yang tepat untuk tiap target, menolak kombinasi yang tidak didukung alih-alih diam-diam mengabaikannya.

## Fitur utama

- Empat target: systemd, launchd, Windows sc.exe, OpenWrt procd
- Aturan kutip per target (systemd, argv Windows, shell POSIX, XML)
- Validasi ketat spesifikasi; kombinasi tak didukung ditolak
- Keluaran deterministik (variabel lingkungan terurut)

## Status saat ini

Versi 0.1.0, belum dirilis. TypeScript dan Python lulus 165 kasus vector. Port lain belum ada.

## Contoh pemakai

- Pemasang (installer) yang membuat definisi layanan untuk sistem operasi pengguna
- Alat penyebaran/konfigurasi yang menghasilkan unit untuk banyak server
- Firmware router atau gateway yang perlu skrip init
- Pengujian: memastikan definisi layanan tidak berubah antar versi

## Batasan yang Diketahui

- Hanya empat target; SysV, FreeBSD rc.d, runit BELUM.
- Hanya subset bidang umum; opsi lanjutan tidak ada.
- Tidak diverifikasi dengan systemd-analyze, plutil, sc.exe atau procd sungguhan di sesi pembuatan (hanya vector).
- Windows tidak mendukung env dan workingDir lewat sc.exe.
- Port Rust, Go, PHP BELUM.

## Info lanjut

SPEC: `SPEC_LombokService_v0.1.0.md`; API: `API_LombokService_v0.1.0.md`; panduan: `guide_how_to_use_LombokService_v0.1.0.md`.

## Gap vs pembanding

Pembanding: pemasang layanan khusus platform (nssm, winsw, node-windows, python-daemon), templat manual. Gap jujur: tidak memasang atau memverifikasi; keunggulan: satu spesifikasi, kutip yang diuji lintas bahasa, penolakan eksplisit untuk yang tak didukung.
