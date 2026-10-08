# SPEC LombokService v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

Kata MUST, SHOULD, dan MAY dibaca sesuai RFC 2119. Tinjauan terakhir: 2026-10-07.

## 0. Standar acuan

Library ini mendefinisikan kontraknya sendiri; tidak ada standar eksternal normatif kecuali yang disebut pada bagian terkait.

## 1. Vector

| Berkas | Kasus | SHA-256 |
|---|---|---|
| `vectors/lombokservice-vectors-v1.json` | 165 | `74675839ab91dc8adfd560a270804830854ae2df777790f14bb277302e4da3ab` |

## 2. Kontrak

1. name cocok ^[a-z][a-z0-9_-]{0,62}$. exec tidak kosong; elemen berupa string tanpa karakter kontrol (U+0000-U+001F, U+007F); hanya elemen pertama tidak boleh kosong. description, workingDir, user tidak kosong dan tanpa karakter kontrol. Kunci env cocok ^[A-Za-z_][A-Za-z0-9_]*$; nilai tanpa karakter kontrol. restart default always; restartDelaySec bilangan bulat 0..3600 default 5; network default false.
2. Variabel lingkungan diurutkan menurut kunci (code point).
3. systemd: bagian [Unit], [Service], [Install]; '%' pada nilai menjadi '%%'; argumen ExecStart yang tidak seluruhnya dari [A-Za-z0-9_@+=:,./-] (setelah '%' dan '$' digandakan) dibungkus tanda kutip ganda dengan '\\' dan '"' di-escape; Restart=no untuk never; RestartSec hanya bila restart bukan never; After/Wants network-online.target hanya bila network benar.
4. launchd: plist XML dengan indentasi tab; '&', '<', '>' di-escape; RunAtLoad benar; KeepAlive benar untuk always, dict SuccessfulExit=false untuk on-failure, tidak ada untuk never; ThrottleInterval bila restart bukan never. description tidak dipakai.
5. windows: env dan workingDir ditolak; tanda kutip ganda pada description atau user ditolak. Baris `sc.exe create` dengan binPath berupa baris perintah (argumen dikutip menurut aturan CommandLineToArgvW) yang dikutip lagi sebagai satu argumen; `obj=` bila user; baris `sc.exe failure ... actions= restart/<detik*1000>` bila restart bukan never.
6. openwrt: workingDir dan restart on-failure ditolak; skrip rc.common dengan procd; argumen dikutip kutip-tunggal POSIX kecuali seluruhnya dari [A-Za-z0-9_@%+=:,./-]; respawn 3600 <delay> 0 hanya untuk always.
7. Setiap keluaran diakhiri LF. Spesifikasi atau target tidak sah memicu RangeError/ValueError.

## 3. Representasi lintas bahasa

Indeks dan panjang string dihitung per code point; angka floating point memakai IEEE 754 double dengan urutan operasi seperti tertulis; bilangan bulat besar tidak boleh kehilangan presisi.

## 4. Non-goals

Memasang, memulai, atau memeriksa layanan; hak akses berkas; skrip SysV lama dan FreeBSD rc.d (BELUM); bidang lanjutan unit systemd (sandboxing, ketergantungan khusus).

## 5. Riwayat perubahan kontrak

- 0.1.0: kontrak awal.
