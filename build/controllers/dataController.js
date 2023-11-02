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
const prismaRawData = new client_1.PrismaClient({ datasources: { db: rawData } });
// rawData schema tables
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
// 瀏覽 raw data
const getRawData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableName = req.query.tableName;
        const data = yield prismaRawData.$queryRaw `SELECT * FROM ${client_1.Prisma.raw(tableName)}`;
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
exports.dataController = {
    getRawDataTables,
    getRawData,
};
