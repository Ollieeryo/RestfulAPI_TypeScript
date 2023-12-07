const passport = require('../config/passport');
import User from '../types/user';
import { Request, Response, NextFunction } from 'express';

// 驗證 JWT token
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // 這裡 user 的參數是從 passport.ts 中 jwt 策略中回傳的
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err || !user) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    // 比較 token 中的 userId 與前端傳遞到 api url 的 id 是否相同，確保同一個使用者只能修改自己的帳號資料，可能需要另外一個函式處理
    // const userIdToUpdate = parseInt(req.params.id); // 從API url 請求中獲取要修改的用戶ID
    // if (userIdToUpdate) {
    //   if (user.userId !== userIdToUpdate) {
    //     return res.status(403).json({ message: 'You are not authorized to perform this action' });
    //   }
    // }

    // 如果 JWT 驗證成功，將使用者信息存儲在 req.user 中
    req.user = user;
    next();
  })(req, res, next);
};

// 辨認身分
export const authenticatedAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 這裡 user 的參數是從 passport.ts 中 jwt 策略中回傳的
  const user: Partial<User> | undefined = req.user;
  if (user && user.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'permission denied' });
};

export const authenticatedModerator = (req: Request, res: Response, next: NextFunction) => {
  // 這裡 user 的參數是從 passport.ts 中 jwt 策略中回傳的
  const user: Partial<User> | undefined = req.user;
  if (user && user.role === 'moderator') return next();
  return res.status(403).json({ status: 'error', message: 'permission denied' });
};

export const authenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  // 這裡 user 的參數是從 passport.ts 中 jwt 策略中回傳的
  const user: Partial<User> | undefined = req.user;
  if (user && user.role === 'user') return next();
  return res.status(403).json({ status: 'error', message: 'permission denied' });
};
