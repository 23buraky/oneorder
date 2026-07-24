import { prisma } from "../src/index";

const email = process.argv[2];
if (!email) {
  console.error("Usage: tsx scripts/promote-admin.ts <email>");
  process.exit(1);
}

prisma.user
  .update({ where: { email }, data: { role: "ADMIN" } })
  .then((user) => console.log(`Promoted ${user.email} to ADMIN`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
