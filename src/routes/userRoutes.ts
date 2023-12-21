const passport = require('../config/passport');

import express from 'express';
import { userController } from '../controllers/userController';
import { authenticateJWT, authenticatedAdmin } from '../middleware/auth';
import { apiListController } from '../controllers/apiListController';
import { siteListController } from '../controllers/siteListController';
import { dataController } from '../controllers/dataController';
import { pythonController } from '../controllers/pythonController';

const router = express.Router();

// 先在 local 用 bcrypt 進行 hash 密碼比對驗證(使用者輸入密碼、資料庫密碼)，因為登入時沒有 JWT 所以不需要驗證
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn);
// 只用來驗證 token 是否有效
router.get('/token/verify', authenticateJWT, userController.verifyToken);
router.post('/signup', userController.signUp);
router.patch('/users/:id', authenticateJWT, userController.updateUserInfo);

// api list table 相關
router.get('/apilist', authenticateJWT, apiListController.browseApiList);
router.post('/apilist/create', authenticateJWT, authenticatedAdmin, apiListController.addApiList);
router.patch(
  '/apilist/edit/:id',
  authenticateJWT,
  authenticatedAdmin,
  apiListController.editApiList,
);
router.get('/apilist/:id', authenticateJWT, apiListController.getApiListById);

// site list
router.get('/sitelist', authenticateJWT, siteListController.getSites);
router.get('/site/devices/:id', authenticateJWT, siteListController.getSiteDevices);

// RawData
router.get('/rawdata/tables', authenticateJWT, dataController.getRawDataTables);
router.get('/rawdata/table/limit', authenticateJWT, dataController.getRawData);
router.get('/rawdata/table/gatewayid', authenticateJWT, dataController.getRawDataTableGatewayId);
router.get('/rawdata/table', authenticateJWT, dataController.getRawDataByGatewayId);
router.get(
  '/rawdata/:tableNameFrom/:tableNameTo/:gatewayId/:dateFrom/:dateTo',
  authenticateJWT,
  dataController.getRawDataByMonthAndDate,
);

// DataETL
router.get('/dataetl/names/:siteId', authenticateJWT, dataController.getSiteOwnedNameByDataEtl);
router.get('/dataetl/:tableName/:gatewayId', authenticateJWT, dataController.getDataEtlByGatewayId);
router.get(
  '/dataetl/:tableNameFrom/:tableNameTo/:gatewayId/:deviceName/:dateFrom/:dateTo',
  authenticateJWT,
  dataController.getDataEtlByMonthAndDate,
);
router.get(
  '/dataetl/:tableName/:gatewayId/:deviceName/:date',
  authenticateJWT,
  dataController.getDataEtlByDateAndTime,
);

// DataPlatform
router.get(
  '/dataplatform/names/:siteId',
  authenticateJWT,
  dataController.getSiteOwnedNameByDataPlatform,
);
router.get(
  '/dataplatform/:tableName/:siteId',
  authenticateJWT,
  dataController.getDataPlatformBySiteIdAndName,
);
router.get(
  '/dataplatform/:tableNameFrom/:tableNameTo/:siteId/:deviceName/:dateFrom/:dateTo',
  authenticateJWT,
  dataController.getDataPlatformByMonthAndDate,
);
router.get(
  '/dataplatform/:tableName/:siteId/:deviceName/:date',
  authenticateJWT,
  dataController.getDataPlatformByDateAndTime,
);

//Python
router.get('/run-python-script', pythonController.runPythonScript);

export default router;
