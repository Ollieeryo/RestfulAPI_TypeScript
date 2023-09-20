"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const corsMiddleware_1 = __importDefault(require("@/src/middleware/corsMiddleware"));
const bodyParserMiddleware_1 = require("@/src/middleware/bodyParserMiddleware");
const userRoutes_1 = __importDefault(require("@/src/routes/userRoutes"));
// import productRoutes from './routes/productRoutes';
// import userRoutes from './routes/userRoutes';
// import dataRoutes from './routes/dataRoutes';
const app = (0, express_1.default)();
const port = 3000;
app.use(corsMiddleware_1.default);
app.use(bodyParserMiddleware_1.bodyParserMiddleware.jsonParser, bodyParserMiddleware_1.bodyParserMiddleware.urlencodedParser);
app.use('/api', userRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
