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
exports.userController = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const databaseService_1 = __importDefault(require("../services/databaseService"));
const prisma = new client_1.PrismaClient();
// 環境變數需要設型別，有可能是 undefined
const tokenSecretKey = process.env.JWT_SECRET_KEY;
// 註冊、登入、權限不同
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (tokenSecretKey && typeof tokenSecretKey === 'string') {
            if (!email || !password) {
                return res.status(400).json({ message: 'Username and Password must have value' });
            }
            const user = yield prisma.userList.findUnique({
                where: { email },
                select: {
                    userId: true,
                    email: true,
                    role: true,
                },
            });
            //  因為 TS 的規則，所以加上 user 是 false 的情況
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            // 確認使用者存不存在和密碼有無錯誤由 passport 來處理
            // 生成 JWT token
            const token = jsonwebtoken_1.default.sign(user, tokenSecretKey, {
                expiresIn: '1d',
            });
            const data = {
                token: token,
                userId: user.userId,
                email: user.email,
                role: user.role,
            };
            res.status(200).json(data);
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prisma);
    }
});
// 註冊一般使用者，權限 user
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, email, password, confirmPassword } = req.body;
    try {
        // 產生 jwt token 需要 tokenSecretKey
        if (tokenSecretKey && typeof tokenSecretKey === 'string') {
            // 檢查用戶是否已存在
            const existingUser = yield prisma.userList.findUnique({
                where: { email },
            });
            // 檢查 email 是否已經被註冊
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists, try to use another' });
            }
            // 檢查密碼輸入是否相同
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Password and ConfirmPassword must be same value' });
            }
            // 使用 bcrypt 對密碼進行哈希加密
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            // 創建新用戶
            const newUser = yield prisma.userList.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    role: role, // 根據需求設置權限
                },
            });
            // 生成 JWT token
            const token = jsonwebtoken_1.default.sign({ userId: newUser.userId, email: newUser.email, role: newUser.role }, tokenSecretKey, {
                expiresIn: '30d',
            });
            const data = {
                token,
                userId: newUser.userId,
                email: newUser.email,
                role: newUser.role,
            };
            res.status(201).json({ data, message: 'Registration successful' });
        }
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prisma);
    }
});
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    const { email, password } = req.body;
    try {
        // 查詢要更新的用户
        const user = yield prisma.userList.findUnique({
            where: { userId: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 更新使用者帳密資料
        const updatedUser = yield prisma.userList.update({
            where: { userId: userId },
            data: {
                email: email || user.email,
                password: password ? yield bcryptjs_1.default.hash(password, 10) : user.password, // 如果沒有提供新密碼，則保持原密碼
            },
        });
        res.status(200).json({
            userId: updatedUser.userId,
            email: updatedUser.email,
            message: 'User information updated',
        });
    }
    catch (error) {
        console.error('Error during user info update:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prisma);
    }
});
// 驗證 token 是否有效
const verifyToken = (req, res) => {
    // 能進行到這代表通過 middleware jwt token 驗證
    res.status(200).json({ message: 'Token is valid' });
};
exports.userController = {
    signIn,
    signUp,
    updateUserInfo,
    verifyToken,
};
