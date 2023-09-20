import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../types/user';
import { Request, Response } from 'express';
import { Datasource } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();
const mgmtEtl: Datasource = {
  url: process.env.MGMTETL_URL,
};
const prismaMgmtEtl = new PrismaClient({ datasources: { db: mgmtEtl } });

type AuthRequestBody = {
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
        token,
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
    prisma.$disconnect();
  }
};
// 註冊一般使用者，權限 user
const signUp = async (req: Request, res: Response) => {
  const { email, password, confirmPassword }: AuthRequestBody = req.body;

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
          role: 'user', // 根據需求設置權限
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
    prisma.$disconnect();
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
    prisma.$disconnect();
  }
};

// 使用者根據權限處理 API List
const browseApiList = async (req: Request, res: Response) => {
  try {
    const apiList = await prismaMgmtEtl.aPIList.findMany();
    res.json(apiList);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaMgmtEtl.$disconnect();
  }
};

// admin 可以修改 api list 的資料
const editApiList = async (req: Request, res: Response) => {
  const keyId = parseInt(req.params.id);
  const { description, username, password, key } = req.body;
  try {
    // 查詢要更新的 api
    const api = await prismaMgmtEtl.aPIList.findUnique({
      where: { keyId: keyId },
    });

    if (!api) {
      return res.status(404).json({ message: 'Api not found' });
    }

    // 更新指定 api
    const updatedApi = await prismaMgmtEtl.aPIList.update({
      where: { keyId: keyId },
      data: {
        description: description || api.description,
        username: username || api.username,
        password: password || api.password,
        key: key || api.key,
      },
    });

    const data = {
      description: updatedApi.description,
      username: updatedApi.username,
      password: updatedApi.password,
      key: updatedApi.key,
    };

    res.json({ data, message: 'Update API list successful' });
  } catch (error) {
    console.error('Error during api list update:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaMgmtEtl.$disconnect();
  }
};

// admin 可以新增 api list
const addApiList = async (req: Request, res: Response) => {
  try {
    const { description, username, password, key } = req.body;
    // 因為 mysql 中的 keyId 沒有設置 auto increment，所以暫時拿 length 手動增加
    const apiList = await prismaMgmtEtl.aPIList.findMany();
    const apiListKeyId = apiList.length + 1;

    //依照需求可以增加 username 不能與資料庫重複的條件

    const api = await prismaMgmtEtl.aPIList.create({
      data: {
        keyId: apiListKeyId,
        description,
        username,
        password,
        key,
      },
    });

    res.status(201).json({ api, message: 'Api list created successful' });
  } catch (error) {
    console.error('Unable to create API list:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaMgmtEtl.$disconnect();
  }
};

// 特定 keyId api list 資料
const getApiListById = async (req: Request, res: Response) => {
  try {
    const keyId = parseInt(req.params.id);
    const api = await prismaMgmtEtl.aPIList.findUnique({
      where: {
        keyId: keyId,
      },
    });

    res.status(201).json(api);
  } catch (error) {
    console.error('Unable to create API list:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaMgmtEtl.$disconnect();
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
  browseApiList,
  editApiList,
  addApiList,
  getApiListById,
  verifyToken,
};
