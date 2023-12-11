import { Request, Response } from 'express';
const { exec } = require('child_process');
import { promisify } from 'util';

const execAsync = promisify(exec);

const runPythonScript = async (req: Request, res: Response) => {
  const pythonScriptPath = 'python_scripts/test.py';
  const { stdout, stderr } = await execAsync(`python3 ${pythonScriptPath}`);
  try {
    // 解析包含 string 的 array
    // 在示例代碼中使用 .trim() 的目的是去除 Python 腳本輸出中的任何可能的前導或尾隨空格。這樣做是為了確保 JSON 字符串是有效的
    const outputArray = JSON.parse(stdout.trim().replace(/'/g, '"'));
    console.log(`Python script output: ${stdout}, run python script succeeded`);
    res.status(200).json({ outputArray });
  } catch (error) {
    console.error(`Error executing Python script: ${error}: ${stderr}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const pythonController = { runPythonScript };
