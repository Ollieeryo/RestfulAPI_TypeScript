import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Datasource } from '@prisma/client/runtime/library';
import prismaDisconnect from '../services/databaseService';

const mgmtEtl: Datasource = {
  url: process.env.MGMTETL_URL,
};
const prismaMgmtEtl = new PrismaClient({ datasources: { db: mgmtEtl } });

// 瀏覽 API list
const browseApiList = async (req: Request, res: Response) => {
  try {
    const apiList = await prismaMgmtEtl.aPIList.findMany();
    res.json(apiList);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
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
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
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
    prismaDisconnect(prismaMgmtEtl);
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
    prismaDisconnect(prismaMgmtEtl);
  }
};

export const apiListController = {
  browseApiList,
  editApiList,
  addApiList,
  getApiListById,
};
