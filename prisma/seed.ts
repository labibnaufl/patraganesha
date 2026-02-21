import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Test1234"; // All test accounts use this

async function main() {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ── Super Admin (use env vars or defaults) ──
  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL || "patrabesarkuat@gmail.com";
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || "SuperAdminBesarKuat123";
  const superAdminHashed = await bcrypt.hash(superAdminPassword, 10);

  const users = [
    {
      email: superAdminEmail,
      name: "Super Admin PATRA",
      password: superAdminHashed,
      role: "SUPER_ADMIN" as const,
      status: "VERIFIED" as const,
      emailVerified: true,
      nim: null,
      generation: null,
      major: null,
      banned: false,
      banReason: null,
    },
    {
      email: "admin@patra.test",
      name: "Admin Departemen",
      password: hashed,
      role: "ADMIN" as const,
      status: "VERIFIED" as const,
      emailVerified: true,
      nim: "10220001",
      generation: 2022,
      major: "Teknik Perminyakan",
      banned: false,
      banReason: null,
    },
    {
      email: "user.verified@patra.test",
      name: "Budi Santoso",
      password: hashed,
      role: "USER" as const,
      status: "VERIFIED" as const,
      emailVerified: true,
      nim: "10230001",
      generation: 2023,
      major: "Teknik Perminyakan",
      banned: false,
      banReason: null,
    },
    {
      email: "user.pending@patra.test",
      name: "Siti Rahayu",
      password: hashed,
      role: "GUEST" as const,
      status: "PENDING" as const,
      emailVerified: true,
      nim: "10240001",
      generation: 2024,
      major: "Teknik Perminyakan",
      banned: false,
      banReason: null,
    },
    {
      email: "user.unverified@patra.test",
      name: "Andi Pratama",
      password: hashed,
      role: "GUEST" as const,
      status: "PENDING" as const,
      emailVerified: false,
      nim: "10240002",
      generation: 2024,
      major: "Teknik Perminyakan",
      banned: false,
      banReason: null,
    },
    {
      email: "user.rejected@patra.test",
      name: "Dewi Lestari",
      password: hashed,
      role: "GUEST" as const,
      status: "REJECTED" as const,
      emailVerified: true,
      nim: null,
      generation: null,
      major: null,
      banned: false,
      banReason: null,
    },
    {
      email: "user.banned@patra.test",
      name: "Rudi Banned",
      password: hashed,
      role: "USER" as const,
      status: "VERIFIED" as const,
      emailVerified: true,
      nim: "10220099",
      generation: 2022,
      major: "Teknik Perminyakan",
      banned: true,
      banReason: "Pelanggaran aturan komunitas",
    },
  ];

  console.log("🌱 Seeding database...\n");

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        nim: u.nim,
        generation: u.generation,
        major: u.major,
        banned: u.banned,
        banReason: u.banReason,
      },
      create: {
        email: u.email,
        name: u.name,
        password: u.password,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        nim: u.nim,
        generation: u.generation,
        major: u.major,
        banned: u.banned,
        banReason: u.banReason,
      },
    });

    const tag = `[${u.role}/${u.status}${u.banned ? "/BANNED" : ""}]`;
    console.log(`  ✓ ${tag.padEnd(28)} ${user.email}`);
  }

  // ── Sample Tags ──
  const tags = [
    {
      name: "Energi",
      slug: "energi",
      description: "Topik terkait energi dan perminyakan",
    },
    {
      name: "Teknologi",
      slug: "teknologi",
      description: "Perkembangan teknologi terkini",
    },
    { name: "ITB", slug: "itb", description: "Berita dan info seputar ITB" },
    {
      name: "Mahasiswa",
      slug: "mahasiswa",
      description: "Info untuk mahasiswa",
    },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, description: tag.description },
      create: tag,
    });
  }
  console.log(`  ✓ ${tags.length} tags created/updated`);

  console.log(`\n✅ Seeded ${users.length} users`);
  console.log(`   Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`   All others:  <email> / ${DEFAULT_PASSWORD}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
