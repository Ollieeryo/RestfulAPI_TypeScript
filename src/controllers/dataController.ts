import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Datasource } from '@prisma/client/runtime/library';
import prismaDisconnect from '../services/databaseService';

const rawData: Datasource = {
  url: process.env.RAWDATA_URL,
};
const rawData2023: Datasource = {
  url: process.env.RAWDATA2023_URL,
};
const dataEtl: Datasource = {
  url: process.env.DATAETL_URL,
};
const dataEtl2023: Datasource = {
  url: process.env.DATAETL2023_URL,
};
const dataPlatform: Datasource = {
  url: process.env.DATAPLATFORM_URL,
};
const dataPlatform2023: Datasource = {
  url: process.env.DATAPLATFORM2023_URL,
};
const mgmtEtl: Datasource = {
  url: process.env.MGMTETL_URL,
};

const prismaRawData = new PrismaClient({ datasources: { db: rawData } });
const prismaRawData2023 = new PrismaClient({ datasources: { db: rawData2023 } });
const prismaDataEtl = new PrismaClient({ datasources: { db: dataEtl } });
const prismaDataEtl2023 = new PrismaClient({ datasources: { db: dataEtl2023 } });
const prismaDataPlatform = new PrismaClient({ datasources: { db: dataPlatform } });
const prismaDataPlatform2023 = new PrismaClient({ datasources: { db: dataPlatform2023 } });
const prismaMgmtEtl = new PrismaClient({ datasources: { db: mgmtEtl } });

// rawData
// tables
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

// raw data by tableName
const getRawData = async (req: Request, res: Response) => {
  try {
    const tableName = req.query.tableName as string;

    const data = await prismaRawData.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableName,
    )} ORDER BY DBts DESC LIMIT 10`;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData);
  }
};

// rawData table gatewayId
const getRawDataTableGatewayId = async (req: Request, res: Response) => {
  try {
    const tableName = req.query.tableName as string;

    const data = await prismaRawData.$queryRaw`SELECT DISTINCT gatewayId FROM ${Prisma.raw(
      tableName,
    )}`;

    let gatewayId;
    if (Array.isArray(data)) {
      data.sort((a, b) => a.gatewayId - b.gatewayId);

      gatewayId = data.map((item) => {
        return { label: item.gatewayId };
      });
    }

    res.json(gatewayId);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData);
  }
};

// rawData by tableName and gatewayId
const getRawDataByGatewayId = async (req: Request, res: Response) => {
  try {
    const tableName = req.query.tableName as string;
    const gatewayId = parseInt(req.query.gatewayId as string, 10);

    const data = await prismaRawData.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableName,
    )} WHERE gatewayId = ${gatewayId} ORDER BY DBts DESC LIMIT 1000`;
    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData);
  }
};

// 還沒使用的 API
const getRawDataByMonthAndDate = async (req: Request, res: Response) => {
  try {
    const tableNameFrom = req.params.tableNameFrom; //ex: modbus_11
    const tableNameTo = req.params.tableNameTo;
    const dateFrom = req.params.dateFrom;
    const dateTo = req.params.dateTo;
    const gatewayId = req.params.gatewayId;

    const data = await prismaRawData2023.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableNameFrom,
    )} WHERE DATE(DBts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} UNION SELECT * FROM ${Prisma.raw(
      tableNameTo,
    )} WHERE DATE(DBts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId}  ORDER BY DBts DESC LIMIT 1000`;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaRawData2023);
  }
};

// dataETL
const getSiteOwnedNameByDataEtl = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId;
    const data =
      await prismaMgmtEtl.$queryRaw`SELECT name AS label, gatewayId, description FROM DataETL WHERE siteId = ${siteId} `;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
  }
};

// data by tableName, gateway id and name
const getDataEtlByGatewayId = async (req: Request, res: Response) => {
  try {
    const tableName = req.params.tableName;
    const gatewayId = req.params.gatewayId;
    const name = req.query.name;

    const data = await prismaDataEtl.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableName,
    )} WHERE gatewayId = ${gatewayId} and name = ${name} ORDER BY ts DESC LIMIT 1000`;

    let processedData;
    if (Array.isArray(data)) {
      processedData = data.map((item) => {
        if (typeof item.gatewayId === 'bigint') {
          // 如果 gatewayId 是 BigInt，將其轉為整數
          return {
            ...item,
            gatewayId: Number(item.gatewayId),
          };
        } else {
          // gatewayId 不是 BigInt，保持不變
          return item;
        }
      });
    }

    res.json(processedData);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaDataEtl);
  }
};

// 還沒使用的 API router 還沒寫(參考getDataPlatformByMonthAndDate)
const getDataEtlByMonthAndDate = async (req: Request, res: Response) => {
  try {
    const tableNameFrom = req.params.tableNameFrom;
    const tableNameTo = req.params.tableNameTo;
    const dateFrom = req.params.dateFrom;
    const dateTo = req.params.dateTo;
    const gatewayId = req.params.gatewayId;
    const deviceName = req.params.deviceName;

    const data = await prismaDataEtl2023.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableNameFrom,
    )} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} AND name=${deviceName} UNION SELECT * FROM ${Prisma.raw(
      tableNameTo,
    )} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} AND name=${deviceName} ORDER BY ts DESC LIMIT 1000`;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaDataEtl2023);
  }
};

// data platform
const getSiteOwnedNameByDataPlatform = async (req: Request, res: Response) => {
  try {
    const siteId = req.params.siteId;

    // desc 為 mySql 保留字，需要用反引號
    const data =
      await prismaMgmtEtl.$queryRaw`SELECT name AS label, \`desc\` AS description FROM DataPlatform WHERE siteId = ${siteId} `;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaMgmtEtl);
  }
};

const getDataPlatformBySiteIdAndName = async (req: Request, res: Response) => {
  try {
    const tableName = req.params.tableName;
    const siteId = req.params.siteId;
    const name = req.query.name;

    const data = await prismaDataPlatform.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableName,
    )} WHERE siteId = ${siteId} AND name = ${name} ORDER BY ts DESC LIMIT 1000`;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaDataPlatform);
  }
};

const getDataPlatformByMonthAndDate = async (req: Request, res: Response) => {
  try {
    const tableNameFrom = req.params.tableNameFrom;
    const tableNameTo = req.params.tableNameTo;
    const dateFrom = req.params.dateFrom;
    const dateTo = req.params.dateTo;
    const siteId = req.params.siteId;
    const deviceName = req.params.deviceName;

    const data = await prismaDataPlatform2023.$queryRaw`SELECT * FROM ${Prisma.raw(
      tableNameFrom,
    )} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND siteId=${siteId} AND name=${deviceName} UNION SELECT * FROM ${Prisma.raw(
      tableNameTo,
    )} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND siteId=${siteId} AND name=${deviceName} ORDER BY ts DESC LIMIT 1000`;

    res.json(data);
  } catch (error) {
    console.error('Error during fetching:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    prismaDisconnect(prismaDataPlatform2023);
  }
};

export const dataController = {
  getRawDataTables,
  getRawData,
  getRawDataByGatewayId,
  getRawDataTableGatewayId,
  getRawDataByMonthAndDate,
  getSiteOwnedNameByDataPlatform,
  getDataEtlByGatewayId,
  getDataEtlByMonthAndDate,
  getDataPlatformBySiteIdAndName,
  getDataPlatformByMonthAndDate,
  getSiteOwnedNameByDataEtl,
};
