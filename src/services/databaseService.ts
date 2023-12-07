import { PrismaClient } from '@prisma/client';

const prismaDisconnect = (prisma: PrismaClient) => {
  return prisma.$disconnect();
};

export default prismaDisconnect;
