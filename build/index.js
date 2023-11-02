"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const corsMiddleware_1 = __importDefault(require("./middleware/corsMiddleware"));
const bodyParserMiddleware_1 = require("./middleware/bodyParserMiddleware");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
const port = 3000;
app.use(corsMiddleware_1.default);
app.use(bodyParserMiddleware_1.jsonParser);
app.use(bodyParserMiddleware_1.urlencodedParser);
app.use('/api', userRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
