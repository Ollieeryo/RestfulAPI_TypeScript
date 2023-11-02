import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Datasource } from '@prisma/client/runtime/library';
import prismaDisconnect from '../services/databaseService';

const rawData: Datasource = {
  url: process.env.RAWDATA_URL,
};
const prismaRawData = new PrismaClient({ datasources: { db: rawData } });

// rawData schema tables
const getRawDataTables = async (req: Request, res: Response) => {
  let modifiedData;
  try {
    const result = await prismaRawData.$queryRaw`SHOW TABLES`;

    // change key
    if (Array.isArray(result)) {
      modifiedData = result.map((item) => {
        return { label: item['Tables_in_rawData'] };
      });
    }

    res.json(modifiedData);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData);
  }
};

// 瀏覽 raw data
const getRawData = async (req: Request, res: Response) => {
  try {
    const tableName = req.query.tableName as string;

    const data = await prismaRawData.$queryRaw`SELECT * FROM ${Prisma.raw(tableName)}`;
    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData);
  }
};

export const dataController = {
  getRawDataTables,
  getRawData,
};
