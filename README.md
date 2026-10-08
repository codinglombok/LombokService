# LombokService

Render service definitions for systemd, launchd, Windows (sc.exe) and OpenWrt procd from one specification, with exact quoting and escaping per target. Part of the Lombok Ecosystem.

## Mengapa library ini?

Memasang program sebagai layanan berarti menulis berkas berbeda untuk tiap sistem dengan aturan kutip dan escape yang berbeda dan mudah salah. Library ini menerima satu spesifikasi dan menghasilkan teks yang tepat untuk tiap target, menolak kombinasi yang tidak didukung alih-alih diam-diam mengabaikannya.

## Fitur

- Empat target: systemd, launchd, Windows sc.exe, OpenWrt procd
- Aturan kutip per target (systemd, argv Windows, shell POSIX, XML)
- Validasi ketat spesifikasi; kombinasi tak didukung ditolak
- Keluaran deterministik (variabel lingkungan terurut)

## Skenario pemakaian

- Pemasang (installer) yang membuat definisi layanan untuk sistem operasi pengguna
- Alat penyebaran/konfigurasi yang menghasilkan unit untuk banyak server
- Firmware router atau gateway yang perlu skrip init
- Pengujian: memastikan definisi layanan tidak berubah antar versi

## Instalasi

Belum terbit di registry (0.1.0 belum dirilis). Setelah rilis:

```
npm install lombokservice
pip install lombokservice
```

## API ringkas

- `render(target, spec) -> string; target: systemd | launchd | windows | openwrt`
- `spec: name, description?, exec[], workingDir?, user?, env?, restart? (always | on-failure | never), restartDelaySec?, network?`

Rincian: `docs/API_LombokService_v0.1.0.md`.

## Status port

| Port | Status |
|---|---|
| TypeScript (referensi) | YA, lulus seluruh 165 kasus vector |
| Python | YA, lulus seluruh 165 kasus vector |
| Rust, Go, PHP | BELUM |

## Standar yang diimplementasikan

Kontrak normatif ada di `docs/SPEC_LombokService_v0.1.0.md`; vector di `vectors/lombokservice-vectors-v1.json`.

## Batasan yang diketahui

- Hanya empat target; SysV, FreeBSD rc.d, runit BELUM.
- Hanya subset bidang umum; opsi lanjutan tidak ada.
- Tidak diverifikasi dengan systemd-analyze, plutil, sc.exe atau procd sungguhan di sesi pembuatan (hanya vector).
- Windows tidak mendukung env dan workingDir lewat sc.exe.
- Port Rust, Go, PHP BELUM.

## Pengembangan

```
node --test typescript/test/          # TypeScript (Node 22+)
python -m pytest python/tests         # Python 3.10+
node scripts/gen_vectors.ts           # membangkitkan ulang vector dari referensi TypeScript
```

## Ekosistem Lombok

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## Lisensi

Apache-2.0 OR MIT (lihat `LICENSE-APACHE` dan `LICENSE-MIT`).
