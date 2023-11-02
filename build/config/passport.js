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
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const passport_local_1 = require("passport-local");
const prisma = new client_1.PrismaClient();
const JWTStrategy = passport_jwt_1.default.Strategy;
const ExtractJWT = passport_jwt_1.default.ExtractJwt;
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.userList.findUnique({
            where: { email },
        });
        if (!user) {
            return cb(Error('帳號不存在'), false);
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return cb(Error('密碼錯誤'), false);
        }
        return cb(null, user);
    }
    catch (error) {
        return cb(error);
    }
})));
const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY,
};
passport_1.default.use(new JWTStrategy(jwtOptions, (jwtPayload, cb) => __awaiter(void 0, void 0, void 0, function* () {
    // 在這裡處理 JWT 身份驗證結果，然後調用 cb 來通知 Passport 結果
    try {
        const user = yield prisma.userList.findUnique({
            where: { userId: jwtPayload.userId },
        });
        if (!user) {
            // 找不到使用者，返回錯誤訊息
            return cb(new Error('User not found'), false);
        }
        return cb(null, user);
    }
    catch (error) {
        return cb(error);
    }
})));
// 看看是不是要建立一個 middleware 檔案來使用
// 自定義的中間件，確保只有用戶自己可以修改帳號資訊
// function ensureUserIsAuthorized(req, res, next) {
//   // 在 Passport 認證之後，已驗證的用戶數據將存儲在 req.user 中
//   const authenticatedUserId = req.user.id; // 從已驗證的用戶數據中獲取用戶ID
//   const userIdToUpdate = req.body.userId; // 從請求中獲取要修改的用戶ID
//   if (authenticatedUserId !== userIdToUpdate) {
//     return res.status(403).json({ message: 'You are not authorized to perform this action' });
//   }
//   next();
// }
module.exports = passport_1.default;
