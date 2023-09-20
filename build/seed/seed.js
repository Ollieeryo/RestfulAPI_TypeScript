"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const hashPassword = yield bcryptjs_1.default.hash(user.password, 10);
            yield prisma.userList.create({
                data: {
                    email: user.email,
                    password: hashPassword,
                    role: user.role,
                },
            });
        }
        console.log('Seed data inserted successfully.');
    });
}
seedDatabase()
    .catch((error) => {
    console.error('Error seeding database:', error);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
