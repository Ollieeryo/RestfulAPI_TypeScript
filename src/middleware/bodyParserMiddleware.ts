import bodyParser from 'body-parser';

// 解析 json 檔案
export const jsonParser = bodyParser.json();
// 解析前端傳遞 url 參數
export const urlencodedParser = bodyParser.urlencoded({ extended: true });
