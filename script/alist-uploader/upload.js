import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import clipboard from 'clipboardy';

// --- Alist Configuration ---
const alistUrl = 'https://list.ucards.store';
const username = 'admin';
const password = 'pjSWWYRK';
const uploadPath = '/img'; // IMPORTANT: This is the folder on Alist
const localFolderPath = '/Users/Apple/Downloads/ae-images';

/**
 * Authenticates with Alist and returns the token.
 * @returns {Promise<string|null>} The token, or null if authentication fails.
 */
async function getAlistToken() {
  const url = `${alistUrl}/api/auth/login`;
  try {
    const response = await axios.post(url, {
      username: username,
      password: password,
    });
    if (response.status === 200 && response.data.code === 200) {
      console.log('✅ Alist authentication successful!');
      return response.data.data.token;
    } else {
      console.error(`❌ Alist authentication failed: ${response.data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during Alist authentication:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return null;
  }
}


/**
 * Finds the most recent file in a directory.
 * @param {string} dirPath The path to the directory.
 * @returns {Promise<string|null>} The full path to the latest file, or null if the directory is empty.
 */
async function getLatestFile(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
      console.log('📂 目录为空，没有文件可上传。');
      return null;
    }

    let latestFile = null;
    let latestTime = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile() && stats.mtimeMs > latestTime) {
        latestTime = stats.mtimeMs;
        latestFile = filePath;
      }
    }
    return latestFile;
  } catch (error) {
    console.error(`❌ 读取目录 ${dirPath} 时出错:`, error.message);
    return null;
  }
}


/**
 * Uploads a file to Alist.
 * @param {string} alistToken The Alist authentication token.
 * @param {Buffer} fileBuffer The file content as a Buffer.
 * @param {string} fileName The name of the file.
 */
async function uploadToAlist(alistToken, fileBuffer, fileName) {
  const url = `${alistUrl}/api/fs/put`;
  const filePath = path.join(uploadPath, fileName);

  console.log(`正在上传 ${fileName} 到 Alist 路径: ${filePath} ...`);

  try {
    const response = await axios.put(url, fileBuffer, {
      headers: {
        'Authorization': alistToken,
        'File-Path': encodeURIComponent(filePath),
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length,
      },
    });

    if (response.status === 200 && response.data.code === 200) {
      console.log('✅ 文件上传成功!');
      const publicUrl = `${alistUrl}/d${filePath}`;
      const markdownUrl = `![${fileName}](${publicUrl})`;
      console.log(`🔗 公共链接: ${markdownUrl}`);
      
      // Copy URL to clipboard
      await clipboard.write(markdownUrl);
      console.log('📋 链接已复制到剪贴板!');

    } else {
      console.error(`❌ 上传失败: ${response.data.message || '未知错误'}`);
      console.error('响应详情:', response.data);
    }
  } catch (error) {
    console.error('❌ 上传过程中发生网络错误:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

/**
 * Main function.
 */
async function main() {
  try {
    const alistToken = await getAlistToken();
    if (!alistToken) {
      console.log('获取Alist token失败，脚本执行结束。');
      return;
    }

    const latestFile = await getLatestFile(localFolderPath);

    if (!latestFile) {
      console.log('没有找到最新文件，脚本执行结束。');
      return;
    }

    console.log(`📁 找到最新文件: ${latestFile}`);
    
    const fileBuffer = await fs.readFile(latestFile);
    const fileName = path.basename(latestFile);

    await uploadToAlist(alistToken, fileBuffer, fileName);

  } catch (err) {
    console.error(`❌ 发生未知错误: ${err.message}`);
    console.error(err);
  }
}

main();