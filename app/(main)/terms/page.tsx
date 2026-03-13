import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — HMTM \"PATRA\" ITB",
  description:
    "Syarat dan ketentuan penggunaan platform HMTM &quot;PATRA&quot; ITB, platform digital resmi HMTM PATRA ITB Ganesha.",
};

export default function TermsPage() {
  const lastUpdated = "10 Maret 2026";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Syarat &amp; Ketentuan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="prose prose-neutral max-w-none text-foreground space-y-8 text-[0.9375rem] leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            Dengan mengakses dan menggunakan <strong>HMTM &quot;PATRA&quot; ITB</strong>,
            Anda setuju untuk terikat oleh syarat dan ketentuan berikut. Harap
            baca dengan seksama sebelum menggunakan platform ini.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="text-xl font-bold mb-3">1. Definisi</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Platform</strong>: HMTM &quot;PATRA&quot; ITB yang dapat diakses
              melalui domain resmi.
            </li>
            <li>
              <strong>Pengguna</strong>: Setiap individu yang mengakses atau
              menggunakan platform, baik terdaftar maupun tidak.
            </li>
            <li>
              <strong>Anggota</strong>: Pengguna yang telah mendaftarkan akun
              dan diverifikasi sebagai bagian dari komunitas PATRA.
            </li>
            <li>
              <strong>Konten</strong>: Semua teks, gambar, video, dan materi
              lain yang dipublikasikan di platform.
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-bold mb-3">2. Penerimaan Syarat</h2>
          <p>
            Penggunaan platform berarti Anda menyetujui syarat ini beserta{" "}
            <Link
              href="/privacy-policy"
              className="text-brand-primary hover:underline"
            >
              Kebijakan Privasi
            </Link>{" "}
            kami. Jika Anda tidak menyetujui, Anda tidak diizinkan menggunakan
            layanan kami.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            3. Penggunaan yang Diizinkan
          </h2>
          <p>Anda diperbolehkan untuk:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Mengakses dan membaca konten yang dipublikasikan di platform.
            </li>
            <li>
              Mendaftarkan akun menggunakan informasi yang valid dan akurat.
            </li>
            <li>
              Berpartisipasi dalam kegiatan, mengunggah artikel, dan
              berinteraksi dengan sesama anggota komunitas PATRA.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            4. Penggunaan yang Dilarang
          </h2>
          <p>Anda dilarang untuk:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Mempublikasikan konten yang melanggar hukum, mengandung ujaran
              kebencian, diskriminasi, atau pornografi.
            </li>
            <li>
              Menggunakan platform untuk tujuan komersial tanpa izin tertulis
              dari pengelola.
            </li>
            <li>
              Melakukan scraping, crawling, atau ekstraksi data otomatis tanpa
              persetujuan.
            </li>
            <li>
              Mencoba meretas, mengganggu, atau merusak infrastruktur platform.
            </li>
            <li>Menyebarkan informasi palsu atau menyesatkan.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            5. Hak Kekayaan Intelektual
          </h2>
          <p>
            Seluruh konten yang dibuat oleh tim HMTM &quot;PATRA&quot; ITB (desain, logo,
            teks resmi) dilindungi oleh hak cipta. Konten yang dikirimkan oleh
            pengguna tetap menjadi hak milik pengguna, namun dengan mendunggah
            konten tersebut, Anda memberikan lisensi kepada HMTM &quot;PATRA&quot; ITB
            untuk menampilkan dan mendistribusikan konten tersebut di dalam
            platform.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            6. Pembatasan Tanggung Jawab
          </h2>
          <p>
            HMTM &quot;PATRA&quot; ITB disediakan &ldquo;sebagaimana adanya&rdquo;. Kami
            tidak menjamin ketersediaan platform 24/7 dan tidak bertanggung
            jawab atas kerugian yang timbul akibat gangguan layanan, kesalahan
            konten yang diunggah pengguna, atau penggunaan platform yang
            melanggar syarat ini.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-bold mb-3">7. Perubahan Syarat</h2>
          <p>
            Kami berhak memperbarui syarat ini kapan saja. Perubahan akan
            berlaku segera setelah dipublikasikan di halaman ini. Penggunaan
            berkelanjutan setelah perubahan berarti Anda menyetujui syarat yang
            diperbarui.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-bold mb-3">8. Hukum yang Berlaku</h2>
          <p>
            Syarat ini diatur oleh hukum yang berlaku di Republik Indonesia.
            Setiap sengketa akan diselesaikan secara musyawarah; jika tidak
            tercapai kesepakatan, akan diselesaikan melalui jalur hukum yang
            berlaku.
          </p>
        </section>

        {/* 9 — Contact */}
        <section>
          <h2 className="text-xl font-bold mb-3">9. Hubungi Kami</h2>
          <p>
            Pertanyaan terkait syarat dan ketentuan dapat dikirimkan ke:{" "}
            <a
              href="mailto:contact@patra-itb.org"
              className="text-brand-primary hover:underline"
            >
              contact@patra-itb.org
            </a>
            .
          </p>
        </section>
      </div>

      {/* Back link */}
      <div className="mt-12 pt-8 border-t">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
