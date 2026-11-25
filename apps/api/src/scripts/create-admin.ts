import "dotenv/config";
import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("=========================================");
  console.log("   BOOTSTRAP ADMIN — TJ RENTCAR          ");
  console.log("=========================================");

  // Read arguments or prompt
  const args = process.argv.slice(2);
  let name = args[0];
  let email = args[1];
  let password = args[2];
  let roleInput = args[3] || "SUPER_ADMIN";

  if (!name) {
    name = await prompt("Masukkan nama lengkap admin: ");
  }
  if (!email) {
    email = await prompt("Masukkan email admin: ");
  }
  if (!password) {
    password = await prompt("Masukkan password (min 8 karakter): ");
  }

  if (!name || !email || !password || password.length < 8) {
    console.error("❌ Nama, email, dan password (min 8 karakter) wajib diisi.");
    process.exit(1);
  }

  const role = roleInput.toUpperCase() === "SUPER_ADMIN" ? Role.SUPER_ADMIN : Role.ADMIN;
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name,
      passwordHash,
      role,
      isActive: true,
    },
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive: true,
    },
  });

  console.log(`✅ Admin berhasil dibuat/diperbarui!`);
  console.log(`- ID: ${admin.id}`);
  console.log(`- Nama: ${admin.name}`);
  console.log(`- Email: ${admin.email}`);
  console.log(`- Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
