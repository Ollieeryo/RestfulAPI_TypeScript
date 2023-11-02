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
exports.apiListController = void 0;
const client_1 = require("@prisma/client");
const databaseService_1 = __importDefault(require("../services/databaseService"));
const mgmtEtl = {
    url: process.env.MGMTETL_URL,
};
const prismaMgmtEtl = new client_1.PrismaClient({ datasources: { db: mgmtEtl } });
// 瀏覽 API list
const browseApiList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiList = yield prismaMgmtEtl.aPIList.findMany();
        res.json(apiList);
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
// admin 可以修改 api list 的資料
const editApiList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyId = parseInt(req.params.id);
    const { description, username, password, key } = req.body;
    try {
        // 查詢要更新的 api
        const api = yield prismaMgmtEtl.aPIList.findUnique({
            where: { keyId: keyId },
        });
        if (!api) {
            return res.status(404).json({ message: 'Api not found' });
        }
        // 更新指定 api
        const updatedApi = yield prismaMgmtEtl.aPIList.update({
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
    }
    catch (error) {
        console.error('Error during fetching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
// admin 可以新增 api list
const addApiList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { description, username, password, key } = req.body;
        // 因為 mysql 中的 keyId 沒有設置 auto increment，所以暫時拿 length 手動增加
        const apiList = yield prismaMgmtEtl.aPIList.findMany();
        const apiListKeyId = apiList.length + 1;
        //依照需求可以增加 username 不能與資料庫重複的條件
        const api = yield prismaMgmtEtl.aPIList.create({
            data: {
                keyId: apiListKeyId,
                description,
                username,
                password,
                key,
            },
        });
        res.status(201).json({ api, message: 'Api list created successful' });
    }
    catch (error) {
        console.error('Unable to create API list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
// 特定 keyId api list 資料
const getApiListById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyId = parseInt(req.params.id);
        const api = yield prismaMgmtEtl.aPIList.findUnique({
            where: {
                keyId: keyId,
            },
        });
        res.status(201).json(api);
    }
    catch (error) {
        console.error('Unable to create API list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        (0, databaseService_1.default)(prismaMgmtEtl);
    }
});
exports.apiListController = {
    browseApiList,
    editApiList,
    addApiList,
    getApiListById,
};
