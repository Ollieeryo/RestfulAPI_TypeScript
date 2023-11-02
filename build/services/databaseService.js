"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaDisconnect = (prisma) => {
    return prisma.$disconnect();
};
exports.default = prismaDisconnect;
