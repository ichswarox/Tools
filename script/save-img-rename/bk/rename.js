// 引入所需模块
import fs from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';

// --- 配置区域 ---
// 请将这里替换为你的目标文件夹路径
const directoryPath = '/Users/Apple/Downloads/ae-images';
// --- 结束配置 ---


/**
 * 生成指定长度的随机小写字母后缀
 * @param {number} length - 需要生成的后缀长度
 * @returns {string} 生成的随机字符串
 */
function generateRandomSuffix(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


async function renameLatestFile() {
  try {
    //console.log(`正在扫描文件夹: ${directoryPath}`);

    // 1. 读取文件夹中的所有文件
    const files = fs.readdirSync(directoryPath);

    if (files.length === 0) {
      console.log('文件夹为空，没有可重命名的文件。');
      return;
    }

    // 2. 找到最新的文件
    const latestFile = files
      .map(fileName => {
        // 忽略 .DS_Store 等系统隐藏文件
        if (fileName.startsWith('.')) {
          return null;
        }
        const filePath = path.join(directoryPath, fileName);
        const stats = fs.statSync(filePath);
        return { name: fileName, mtime: stats.mtime, isFile: stats.isFile() };
      })
      .filter(file => file && file.isFile) // 过滤掉文件夹和 null
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0]; // 按时间降序排序，取第一个

    if (!latestFile) {
      console.log('文件夹中没有找到任何文件。');
      return;
    }
    
    const oldFileName = latestFile.name;
    const oldFilePath = path.join(directoryPath, oldFileName);
    //console.log(`找到最新文件: ${oldFileName}`);

    // 3. 从剪贴板获取新的文件名
    const newNameFromClipboard = await clipboardy.read();

    if (!newNameFromClipboard || newNameFromClipboard.trim() === '') {
      console.log('剪贴板为空，无法重命名。');
      return;
    }
    
    // 清理剪贴板内容，防止包含非法字符 (例如 /)
    const sanitizedNewName = newNameFromClipboard.trim().replace(/[\/\\?%*:|"<>]/g, '-');
    console.log(`从剪贴板获取新名称: ${sanitizedNewName}`);

    // --- 新增功能 ---
    // 生成一个2位的随机字母后缀
    const randomSuffix = generateRandomSuffix(2);
    // --- 结束新增 ---

    // 4. 拼接新的文件路径 (保留原文件的扩展名,并加上随机字母)
    const fileExtension = path.extname(oldFileName);
    // --- 修改部分 ---
    // 将随机后缀添加到文件名和扩展名之间
    const newFileName = `${sanitizedNewName}-${randomSuffix}${fileExtension}`;
    // --- 结束修改 ---
    const newFilePath = path.join(directoryPath, newFileName);

    // 5. 执行重命名操作
    fs.renameSync(oldFilePath, newFilePath);

    console.log('✅ 重命名成功!');
    //console.log(`   旧名称: ${oldFileName}`);
    //console.log(`   新名称: ${newFileName}`);

  } catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`错误: 文件夹不存在 -> ${directoryPath}`);
    } else if (error.code === 'EACCES') {
        console.error(`错误: 没有权限访问文件夹 -> ${directoryPath}`);
    } else {
        console.error('发生未知错误:', error);
    }
  }
}

// 运行主函数
renameLatestFile();