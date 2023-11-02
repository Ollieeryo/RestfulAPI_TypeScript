import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../types/user';
import { Request, Response } from 'express';
import prismaDisconnect from '../services/databaseService';

const prisma = new PrismaClient();

type AuthRequestBody = {
  role: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// 環境變數需要設型別，有可能是 undefined
const tokenSecretKey: string | undefined = process.env.JWT_SECRET_KEY;

// 註冊、登入、權限不同
const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as User;
    if (tokenSecretKey && typeof tokenSecretKey === 'string') {
      if (!email || !password) {
        return res.status(400).json({ message: 'Username and Password must have value' });
      }

      const user = await prisma.userList.findUnique({
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
      const token = jwt.sign(user, tokenSecretKey, {
        expiresIn: '30d',
      });

      const data = {
        token: token,
        userId: user.userId,
        email: user.email,
        role: user.role,
      };

      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prisma);
  }
};
// 註冊一般使用者，權限 user
const signUp = async (req: Request, res: Response) => {
  const { role, email, password, confirmPassword }: AuthRequestBody = req.body;

  try {
    // 產生 jwt token 需要 tokenSecretKey
    if (tokenSecretKey && typeof tokenSecretKey === 'string') {
      // 檢查用戶是否已存在
      const existingUser = await prisma.userList.findUnique({
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
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const newUser = await prisma.userList.create({
        data: {
          email: email,
          password: hashedPassword,
          role: role, // 根據需求設置權限
        },
      });

      // 生成 JWT token
      const token = jwt.sign(
        { userId: newUser.userId, email: newUser.email, role: newUser.role },
        tokenSecretKey,
        {
          expiresIn: '30d',
        },
      );

      const data = {
        token,
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
      };

      res.status(201).json({ data, message: 'Registration successful' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prisma);
  }
};
const updateUserInfo = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { email, password } = req.body as User;

  try {
    // 查詢要更新的用户
    const user = await prisma.userList.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 更新使用者帳密資料
    const updatedUser = await prisma.userList.update({
      where: { userId: userId },
      data: {
        email: email || user.email, //如果沒有提供新帳號，則保持原帳號
        password: password ? await bcrypt.hash(password, 10) : user.password, // 如果沒有提供新密碼，則保持原密碼
      },
    });

    res.status(200).json({
      userId: updatedUser.userId,
      email: updatedUser.email,
      message: 'User information updated',
    });
  } catch (error) {
    console.error('Error during user info update:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prisma);
  }
};

// 驗證 token 是否有效
const verifyToken = (req: Request, res: Response) => {
  // 能進行到這代表通過 middleware jwt token 驗證
  res.status(200).json({ message: 'Token is valid' });
};

export const userController = {
  signIn,
  signUp,
  updateUserInfo,
  verifyToken,
};
