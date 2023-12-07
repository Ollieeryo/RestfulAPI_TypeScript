import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  // moderator 具有部分管理權限
  const users = [
    { email: 'admin1@example.com', password: '12345678', role: 'admin' },
    { email: 'admin2@example.com', password: '12345678', role: 'admin' },
    { email: 'moderator1@example.com', password: '12345678', role: 'moderator' },
    { email: 'moderator2@example.com', password: '12345678', role: 'moderator' },
    { email: 'user1@example.com', password: '12345678', role: 'user' },
    { email: 'user2@example.com', password: '12345678', role: 'user' },
  ];

  for (const user of users) {
    // 先把密碼加密
    const hashPassword = await bcrypt.hash(user.password, 10);

    await prisma.userList.create({
      data: {
        email: user.email,
        password: hashPassword,
        role: user.role,
      },
    });
  }

  console.log('Seed data inserted successfully.');
}

seedDatabase()
  .catch((error) => {
    console.error('Error seeding database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
