import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — PATRA Digital Hub",
  description:
    "Kebijakan privasi PATRA Digital Hub menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "10 Maret 2026";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Kebijakan Privasi
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
            Selamat datang di <strong>PATRA Digital Hub</strong>, platform
            digital resmi HMTM &ldquo;PATRA&rdquo; ITB Ganesha. Kebijakan
            privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
            menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan
            kami di{" "}
            <Link href="/" className="text-brand-primary hover:underline">
              patra-itb.org
            </Link>
            .
          </p>
          <p>
            Dengan mengakses atau menggunakan platform ini, Anda menyetujui
            praktik yang dijelaskan dalam kebijakan ini. Jika Anda tidak
            menyetujuinya, harap hentikan penggunaan platform.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            1. Data yang Kami Kumpulkan
          </h2>
          <p>Kami dapat mengumpulkan data berikut:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Data Akun:</strong> Nama, alamat email, NIM, angkatan, dan
              program studi yang Anda berikan saat mendaftar.
            </li>
            <li>
              <strong>Data Konten:</strong> Artikel, komentar, dan konten lain
              yang Anda publikasikan melalui platform.
            </li>
            <li>
              <strong>Data Teknis:</strong> Alamat IP, tipe perangkat, dan
              informasi browser yang dikumpulkan secara otomatis saat Anda
              mengakses platform.
            </li>
            <li>
              <strong>Data Kehadiran Event:</strong> Informasi pendaftaran dan
              kehadiran pada kegiatan PATRA yang Anda ikuti.
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-bold mb-3">
            2. Cara Kami Menggunakan Data
          </h2>
          <p>Data Anda digunakan untuk:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Mengelola dan mengautentikasi akun Anda.</li>
            <li>
              Menampilkan konten yang relevan (artikel, kegiatan, informasi
              akademik).
            </li>
            <li>
              Mengirimkan notifikasi terkait kegiatan atau pembaruan platform.
            </li>
            <li>
              Menganalisis penggunaan platform untuk meningkatkan layanan.
            </li>
            <li>Memoderasi konten dan menjaga keamanan komunitas.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-bold mb-3">3. Pembagian Data</h2>
          <p>
            Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak
            ketiga. Data hanya dibagikan dalam kondisi berikut:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Kepada penyedia layanan teknis (hosting, database) yang membantu
              kami mengoperasikan platform, dengan perjanjian kerahasiaan.
            </li>
            <li>
              Apabila diwajibkan oleh hukum atau peraturan yang berlaku di
              Indonesia.
            </li>
            <li>
              Untuk melindungi hak, keamanan, atau properti PATRA Digital Hub
              dan penggunanya.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-bold mb-3">4. Keamanan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang
            wajar untuk melindungi data Anda, termasuk enkripsi password,
            koneksi HTTPS, dan pembatasan akses berbasis peran (RBAC). Namun,
            tidak ada sistem yang 100% aman; kami mendorong Anda untuk menjaga
            kerahasiaan kredensial akun Anda.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-bold mb-3">5. Hak Anda</h2>
          <p>Anda memiliki hak untuk:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Mengakses dan memperbarui data profil Anda kapan saja.</li>
            <li>
              Meminta penghapusan akun dan data terkait dengan menghubungi
              administrator.
            </li>
            <li>
              Menarik persetujuan penggunaan data, dengan konsekuensi bahwa
              akses ke platform mungkin dibatasi.
            </li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-bold mb-3">6. Cookie</h2>
          <p>
            Platform menggunakan cookie sesi untuk keperluan autentikasi dan
            preferensi pengguna. Anda dapat menonaktifkan cookie melalui
            pengaturan browser, namun beberapa fitur mungkin tidak berfungsi
            dengan baik.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-bold mb-3">7. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu.
            Perubahan signifikan akan diberitahukan melalui pengumuman di
            platform atau notifikasi email. Penggunaan berkelanjutan setelah
            pembaruan berarti Anda menyetujui kebijakan yang diperbarui.
          </p>
        </section>

        {/* 8 — Contact */}
        <section>
          <h2 className="text-xl font-bold mb-3">8. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan terkait kebijakan privasi ini, silakan
            hubungi kami melalui:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Email:{" "}
              <a
                href="mailto:contact@patra-itb.org"
                className="text-brand-primary hover:underline"
              >
                contact@patra-itb.org
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href="https://www.instagram.com/hmtmpatraitb/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                @hmtmpatraitb
              </a>
            </li>
          </ul>
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
