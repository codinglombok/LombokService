# Panduan Pemakaian LombokService

## 1. Instalasi

Setelah rilis: `npm install lombokservice` atau `pip install lombokservice`. Sebelum rilis, salin folder `typescript/src` atau `python/src/lombokservice` (tanpa dependensi).

## 2. Konsep dasar

Satu ServiceSpec menggambarkan layanan: nama, perintah (daftar argumen), pengguna, direktori kerja, variabel lingkungan, kebijakan restart. render(target, spec) menghasilkan teks untuk systemd, launchd, Windows, atau OpenWrt. Bidang yang tidak dapat dinyatakan pada target ditolak dengan galat.

## 3. Contoh

Berkas `examples/example.ts` dan `examples/example.py` menghasilkan keluaran berikut (TypeScript; Python sama kecuali format cetak):

```
[Unit]
Description=My daemon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mydaemon --config "/etc/my daemon.toml"
User=svc
Environment="MODE=prod"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Kode TypeScript:

```ts
import { render } from "lombokservice";

const spec = { name: "mydaemon", description: "My daemon", exec: ["/usr/local/bin/mydaemon", "--config", "/etc/my daemon.toml"], user: "svc", env: { MODE: "prod" }, network: true };
process.stdout.write(render("systemd", spec));
```

## 4. Recipes

- Pemasang lintas OS: pilih target dari sistem operasi, tulis hasil render ke lokasi standar target.
- Peninjauan: simpan hasil render di repo untuk melihat perubahan definisi layanan.
- Tes: bandingkan hasil render dengan berkas emas.

## 5. Common pitfalls

- Hanya empat target; SysV, FreeBSD rc.d, runit BELUM.
- Hanya subset bidang umum; opsi lanjutan tidak ada.
- Tidak diverifikasi dengan systemd-analyze, plutil, sc.exe atau procd sungguhan di sesi pembuatan (hanya vector).
- Windows tidak mendukung env dan workingDir lewat sc.exe.
- Port Rust, Go, PHP BELUM.

## 6. Lihat juga

`SPEC_LombokService_v0.1.0.md`, `API_LombokService_v0.1.0.md`, `full_summary_project_LombokService_v0.1.0.md`.
