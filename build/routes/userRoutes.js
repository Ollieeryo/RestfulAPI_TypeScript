"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require('../config/passport');
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const apiListController_1 = require("../controllers/apiListController");
const siteListController_1 = require("../controllers/siteListController");
const dataController_1 = require("../controllers/dataController");
const pythonController_1 = require("../controllers/pythonController");
const router = express_1.default.Router();
// 先在 local 用 bcrypt 進行 hash 密碼比對驗證(使用者輸入密碼、資料庫密碼)，因為登入時沒有 JWT 所以不需要驗證
router.post('/signin', passport.authenticate('local', { session: false }), userController_1.userController.signIn);
// 只用來驗證 token 是否有效
router.get('/token/verify', auth_1.authenticateJWT, userController_1.userController.verifyToken);
router.post('/signup', userController_1.userController.signUp);
router.patch('/users/:id', auth_1.authenticateJWT, userController_1.userController.updateUserInfo);
// api list table 相關
router.get('/apilist', auth_1.authenticateJWT, apiListController_1.apiListController.browseApiList);
router.post('/apilist/create', auth_1.authenticateJWT, auth_1.authenticatedAdmin, apiListController_1.apiListController.addApiList);
router.patch('/apilist/edit/:id', auth_1.authenticateJWT, auth_1.authenticatedAdmin, apiListController_1.apiListController.editApiList);
router.get('/apilist/:id', auth_1.authenticateJWT, apiListController_1.apiListController.getApiListById);
// site list
router.get('/sitelist', auth_1.authenticateJWT, siteListController_1.siteListController.getSites);
router.get('/site/devices/:id', auth_1.authenticateJWT, siteListController_1.siteListController.getSiteDevices);
// RawData
router.get('/rawdata/tables', auth_1.authenticateJWT, dataController_1.dataController.getRawDataTables);
router.get('/rawdata/table/limit', auth_1.authenticateJWT, dataController_1.dataController.getRawData);
router.get('/rawdata/table/gatewayid', auth_1.authenticateJWT, dataController_1.dataController.getRawDataTableGatewayId);
router.get('/rawdata/table', auth_1.authenticateJWT, dataController_1.dataController.getRawDataByGatewayId);
router.get('/rawdata/:tableNameFrom/:tableNameTo/:gatewayId/:dateFrom/:dateTo', auth_1.authenticateJWT, dataController_1.dataController.getRawDataByMonthAndDate);
// DataETL
router.get('/dataetl/names/:siteId', auth_1.authenticateJWT, dataController_1.dataController.getSiteOwnedNameByDataEtl);
router.get('/dataetl/:tableName/:gatewayId', auth_1.authenticateJWT, dataController_1.dataController.getDataEtlByGatewayId);
router.get('/dataetl/:tableNameFrom/:tableNameTo/:gatewayId/:deviceName/:dateFrom/:dateTo', auth_1.authenticateJWT, dataController_1.dataController.getDataEtlByMonthAndDate);
// DataPlatform
router.get('/dataplatform/names/:siteId', auth_1.authenticateJWT, dataController_1.dataController.getSiteOwnedNameByDataPlatform);
router.get('/dataplatform/:tableName/:siteId', auth_1.authenticateJWT, dataController_1.dataController.getDataPlatformBySiteIdAndName);
router.get('/dataplatform/:tableNameFrom/:tableNameTo/:siteId/:deviceName/:dateFrom/:dateTo', auth_1.authenticateJWT, dataController_1.dataController.getDataPlatformByMonthAndDate);
//Python
router.get('/run-python-script', pythonController_1.pythonController.runPythonScript);
exports.default = router;
