"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const userController_1 = require("@/src/controllers/userController");
const auth_1 = require("@/src/middleware/auth");
const router = express_1.default.Router();
// 先在 local 用 bcrypt 進行 hash 密碼比對驗證(使用者輸入密碼、資料庫密碼)，因為登入時沒有 JWT 所以不需要驗證
router.post('/signin', passport_1.default.authenticate('local', { session: false }), auth_1.authenticatedAdmin, auth_1.authenticatedModerator, auth_1.authenticatedUser, userController_1.userController.signIn);
exports.default = router;
