import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10);
  await prisma.user.upsert({
    where: { username: 'fiqih' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      username: 'fiqih',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin fiqih created successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
