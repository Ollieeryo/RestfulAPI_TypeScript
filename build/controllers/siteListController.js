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
exports.siteListController = void 0;
const client_1 = require("@prisma/client");
const databaseService_1 = __importDefault(require("../services/databaseService"));
const mgmtEtl = {
    url: process.env.MGMTETL_URL,
};
const prismaMgmtEtl = new client_1.PrismaClient({ datasources: { db: mgmtEtl } });
// 瀏覽 site list
const getSites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const siteList = yield prismaMgmtEtl.site.findMany();
        res.json(siteList);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
const getSiteDevices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const siteId = parseInt(req.params.id);
        const deviceList = yield prismaMgmtEtl.dataETL.findMany({
            where: {
                siteId: siteId,
            },
        });
        res.json(deviceList);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
exports.siteListController = {
    getSites,
    getSiteDevices,
};
