"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataController = void 0;
const client_1 = require("@prisma/client");
const databaseService_1 = __importDefault(require("../services/databaseService"));
const rawData = {
    url: process.env.RAWDATA_URL,
};
const rawData2023 = {
    url: process.env.RAWDATA2023_URL,
};
const dataEtl = {
    url: process.env.DATAETL_URL,
};
const dataEtl2023 = {
    url: process.env.DATAETL2023_URL,
};
const dataPlatform = {
    url: process.env.DATAPLATFORM_URL,
};
const dataPlatform2023 = {
    url: process.env.DATAPLATFORM2023_URL,
};
const mgmtEtl = {
    url: process.env.MGMTETL_URL,
};
const prismaRawData = new client_1.PrismaClient({ datasources: { db: rawData } });
const prismaRawData2023 = new client_1.PrismaClient({ datasources: { db: rawData2023 } });
const prismaDataEtl = new client_1.PrismaClient({ datasources: { db: dataEtl } });
const prismaDataEtl2023 = new client_1.PrismaClient({ datasources: { db: dataEtl2023 } });
const prismaDataPlatform = new client_1.PrismaClient({ datasources: { db: dataPlatform } });
const prismaDataPlatform2023 = new client_1.PrismaClient({ datasources: { db: dataPlatform2023 } });
const prismaMgmtEtl = new client_1.PrismaClient({ datasources: { db: mgmtEtl } });
// rawData
// tables
const getRawDataTables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let modifiedData;
    try {
        const result = yield prismaRawData.$queryRaw `SHOW TABLES`;
        // change key
        if (Array.isArray(result)) {
            modifiedData = result.map((item) => {
                return { label: item['Tables_in_rawData'] };
            });
        }
        res.json(modifiedData);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaRawData);
    }
});
// raw data by tableName
const getRawData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.query.tableName;
        const data = yield prismaRawData.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableName)} ORDER BY DBts DESC LIMIT 10`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaRawData);
    }
});
// rawData table gatewayId
const getRawDataTableGatewayId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.query.tableName;
        const data = yield prismaRawData.$queryRaw `SELECT DISTINCT gatewayId FROM ${client_1.Prisma.raw(tableName)}`;
        let gatewayId;
        if (Array.isArray(data)) {
            data.sort((a, b) => a.gatewayId - b.gatewayId);
            gatewayId = data.map((item) => {
                return { label: item.gatewayId };
            });
        }
        res.json(gatewayId);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaRawData);
    }
});
// rawData by tableName and gatewayId
const getRawDataByGatewayId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.query.tableName;
        const gatewayId = parseInt(req.query.gatewayId, 10);
        const data = yield prismaRawData.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableName)} WHERE gatewayId = ${gatewayId} ORDER BY DBts DESC LIMIT 1000`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaRawData);
    }
});
// 還沒使用的 API
const getRawDataByMonthAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableNameFrom = req.params.tableNameFrom; //ex: modbus_11
        const tableNameTo = req.params.tableNameTo;
        const dateFrom = req.params.dateFrom;
        const dateTo = req.params.dateTo;
        const gatewayId = req.params.gatewayId;
        const data = yield prismaRawData2023.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableNameFrom)} WHERE DATE(DBts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} UNION SELECT * FROM ${client_1.Prisma.raw(tableNameTo)} WHERE DATE(DBts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId}  ORDER BY DBts DESC LIMIT 1000`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaRawData2023);
    }
});
// dataETL
const getSiteOwnedNameByDataEtl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const siteId = req.params.siteId;
        const data = yield prismaMgmtEtl.$queryRaw `SELECT name AS label, gatewayId, description FROM DataETL WHERE siteId = ${siteId} `;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
// data by tableName, gateway id and name
const getDataEtlByGatewayId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.params.tableName;
        const gatewayId = req.params.gatewayId;
        const name = req.query.name;
        const data = yield prismaDataEtl.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableName)} WHERE gatewayId = ${gatewayId} and name = ${name} ORDER BY ts DESC LIMIT 1000`;
        let processedData;
        if (Array.isArray(data)) {
            processedData = data.map((item) => {
                if (typeof item.gatewayId === 'bigint') {
                    // 如果 gatewayId 是 BigInt，將其轉為整數
                    return Object.assign(Object.assign({}, item), { gatewayId: Number(item.gatewayId) });
                }
                else {
                    // gatewayId 不是 BigInt，保持不變
                    return item;
                }
            });
        }
        res.json(processedData);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaDataEtl);
    }
});
// 還沒使用的 API router 還沒寫(參考getDataPlatformByMonthAndDate)
const getDataEtlByMonthAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableNameFrom = req.params.tableNameFrom;
        const tableNameTo = req.params.tableNameTo;
        const dateFrom = req.params.dateFrom;
        const dateTo = req.params.dateTo;
        const gatewayId = req.params.gatewayId;
        const deviceName = req.params.deviceName;
        const data = yield prismaDataEtl2023.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableNameFrom)} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} AND name=${deviceName} UNION SELECT * FROM ${client_1.Prisma.raw(tableNameTo)} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND gatewayId=${gatewayId} AND name=${deviceName} ORDER BY ts DESC LIMIT 1000`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaDataEtl2023);
    }
});
// data platform
const getSiteOwnedNameByDataPlatform = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const siteId = req.params.siteId;
        // desc 為 mySql 保留字，需要用反引號
        const data = yield prismaMgmtEtl.$queryRaw `SELECT name AS label, \`desc\` AS description FROM DataPlatform WHERE siteId = ${siteId} `;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
const getDataPlatformBySiteIdAndName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.params.tableName;
        const siteId = req.params.siteId;
        const name = req.query.name;
        const data = yield prismaDataPlatform.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableName)} WHERE siteId = ${siteId} AND name = ${name} ORDER BY ts DESC LIMIT 1000`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaDataPlatform);
    }
});
const getDataPlatformByMonthAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableNameFrom = req.params.tableNameFrom;
        const tableNameTo = req.params.tableNameTo;
        const dateFrom = req.params.dateFrom;
        const dateTo = req.params.dateTo;
        const siteId = req.params.siteId;
        const deviceName = req.params.deviceName;
        const data = yield prismaDataPlatform2023.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableNameFrom)} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND siteId=${siteId} AND name=${deviceName} UNION SELECT * FROM ${client_1.Prisma.raw(tableNameTo)} WHERE DATE(ts) BETWEEN ${dateFrom} AND ${dateTo} AND siteId=${siteId} AND name=${deviceName} ORDER BY ts DESC LIMIT 1000`;
        res.json(data);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaDataPlatform2023);
    }
});
exports.dataController = {
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
