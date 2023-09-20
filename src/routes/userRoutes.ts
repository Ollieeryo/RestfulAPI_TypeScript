const passport = require('../config/passport');

import express from 'express';
import { userController } from '../controllers/userController';
import { authenticateJWT, authenticatedAdmin } from '../middleware/auth';

const router = express.Router();

// 先在 local 用 bcrypt 進行 hash 密碼比對驗證(使用者輸入密碼、資料庫密碼)，因為登入時沒有 JWT 所以不需要驗證
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn);
// 只用來驗證 token 是否有效
router.get('/token/verify', authenticateJWT, userController.verifyToken);
router.post('/signup', userController.signUp);
router.patch('/users/:id', authenticateJWT, userController.updateUserInfo);

// api list table 相關
router.get('/apilist', authenticateJWT, userController.browseApiList);
router.post('/apilist/create', authenticateJWT, authenticatedAdmin, userController.addApiList);
router.patch('/apilist/edit/:id', authenticateJWT, authenticatedAdmin, userController.editApiList);
router.get('/apilist/:id', authenticateJWT, userController.getApiListById);

export default router;
