import passport from 'passport';
import passportJWT from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Strategy as LocalStrategy } from 'passport-local';
const prisma = new PrismaClient();
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, cb) => {
      try {
        const user = await prisma.userList.findUnique({
          where: { email },
        });

        if (!user) {
          return cb(Error('帳號不存在'), false);
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
          return cb(Error('密碼錯誤'), false);
        }

        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    },
  ),
);

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // 這行會去前端傳遞的 headers 拿取 jwt token
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
    // 在這裡處理 JWT 身份驗證結果，然後調用 cb 來通知 Passport 結果
    try {
      const user = await prisma.userList.findUnique({
        where: { userId: jwtPayload.userId },
      });

      if (!user) {
        // 找不到使用者，返回錯誤訊息
        return cb(new Error('User not found'), false);
      }

      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  }),
);

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

module.exports = passport;
