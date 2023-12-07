import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Datasource } from '@prisma/client/runtime/library';
import prismaDisconnect from '../services/databaseService';

const mgmtEtl: Datasource = {
  url: process.env.MGMTETL_URL,
};
const prismaMgmtEtl = new PrismaClient({ datasources: { db: mgmtEtl } });

// 瀏覽 site list
const getSites = async (req: Request, res: Response) => {
  try {
    const siteList = await prismaMgmtEtl.site.findMany();
    res.json(siteList);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
  }
};

const getSiteDevices = async (req: Request, res: Response) => {
  try {
    const siteId = parseInt(req.params.id);
    const deviceList = await prismaMgmtEtl.dataETL.findMany({
      where: {
        siteId: siteId,
      },
    });
    res.json(deviceList);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
  }
};

export const siteListController = {
  getSites,
  getSiteDevices,
};
