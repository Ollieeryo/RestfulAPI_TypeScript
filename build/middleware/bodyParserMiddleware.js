"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlencodedParser = exports.jsonParser = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
// 解析 json 檔案
exports.jsonParser = body_parser_1.default.json();
// 解析前端傳遞 url 參數
exports.urlencodedParser = body_parser_1.default.urlencoded({ extended: true });
