# AuthOnlineTXT

一个简单的在线密码生成和分发系统，具有自动刷新功能和基本身份验证保护，同时支持文件下载功能。

## 功能特点

1. **自动生成密码**：系统每20秒自动生成一个新的3位随机密码
2. **手动刷新**：用户可以通过点击"Refresh Now"按钮立即生成新密码
3. **多种访问方式**：
   - Web界面访问：`http://localhost:3009/`
   - API接口：`http://localhost:3009/api/password` (返回JSON格式)
   - 文本文件下载：`http://localhost:3009/auth/auth.txt`
4. **身份验证保护**：Web界面需要基本身份验证保护
5. **文件下载**：支持上传文件供用户下载
6. **自动下载**：提供密码文件的直接下载链接

## 技术栈

- **后端**：Node.js + Express
- **前端**：Vue 3 + Vite
- **样式**：CSS3

## 安装和运行

1. 克隆项目到本地
2. 安装依赖：
   ```bash
   npm install
   cd frontend && npm install
   ```
3. 构建前端：
   ```bash
   cd frontend && npm run build
   ```
4. 启动服务器：
   ```bash
   node server.js
   ```

## 使用说明

### 访问Web界面

访问 `http://localhost:3009/` 时，浏览器会提示输入用户名和密码：

- **用户名**：`admin`
- **密码**：`password123`

### 获取密码

1. **通过Web界面**：
   - 密码会自动每20秒更新一次
   - 点击"Refresh Now"按钮可立即生成新密码
   - 点击"Download auth.txt"链接可下载包含当前密码的文本文件

2. **通过API接口**：
   ```bash
   curl http://localhost:3009/api/password
   ```
   返回JSON格式：
   ```json
   {"password":"ABC"}
   ```

3. **下载密码文件**：
   ```bash
   curl http://localhost:3009/auth/auth.txt
   ```
   直接返回密码文本：
   ```
   ABC
   ```

## 配置

### 修改身份验证凭据

在 `server.js` 文件中找到以下代码并修改：

```javascript
// 设置您的用户名和密码
const validUsername = 'admin';
const validPassword = 'password123';
```

### 修改密码长度

在 `server.js` 文件中找到密码生成函数并修改长度值：

```javascript
function generatePassword() {
    const length = 3; // 修改此值以更改密码长度
    // ...
}
```

## 项目结构

```
AuthOnlineTXT/
├── server.js              # 主服务器文件
├── README.md              # 项目说明文档
├── package.json           # 后端依赖配置
├── package-lock.json
├── downloads/             # 用户可下载的文件目录
│   └── example.txt        # 示例下载文件
├── frontend/              # 前端Vue项目
│   ├── src/
│   │   ├── App.vue        # 主页面组件
│   │   └── main.js        # 应用入口文件
│   ├── dist/              # 构建后的文件
│   ├── package.json       # 前端依赖配置
│   └── vite.config.js     # Vite配置文件
└── node_modules/          # 依赖包
```

## API端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | Web界面（需要身份验证） |
| `/api/password` | GET | 获取当前密码（JSON格式） |
| `/auth/auth.txt` | GET | 下载密码文本文件 |
| `/api/downloads` | GET | 获取可下载文件列表（JSON格式） |
| `/downloads/*` | GET | 访问下载目录中的文件 |
| `/*` | GET | 其他路由重定向到主页面 |

## 安全说明

1. Web界面受基本身份验证保护
2. API端点和密码下载端点保持公开访问，以便应用程序可以获取密码
3. 建议在生产环境中使用HTTPS以保护传输中的数据

## 自定义

您可以根据需要修改以下内容：

1. **密码复杂度**：在 `generatePassword()` 函数中修改字符集
2. **自动刷新间隔**：修改 `setInterval()` 中的时间值（单位为毫秒）
3. **界面样式**：修改 `frontend/src/App.vue` 中的样式部分
4. **身份验证凭据**：如上所述修改用户名和密码
5. **添加下载文件**：将文件添加到 `downloads/` 目录中，它们将自动在Web界面中显示并可供下载

## 文件下载功能

本系统支持文件下载功能：

1. 将需要提供下载的文件放入 `downloads/` 目录
2. 文件将自动在Web界面的"Available Downloads"部分显示
3. 用户可以点击文件名直接下载

### 添加下载文件的步骤：

1. 将文件复制到项目目录下的 `downloads/` 文件夹中
2. 确保文件权限正确（可读）
3. 重启服务器（可选，文件会自动被检测到）

### 访问下载文件：

1. **通过Web界面**：访问主页面，滚动到"Available Downloads"部分
2. **直接访问**：使用 `http://localhost:3009/downloads/filename.ext` 直接下载文件
3. **API接口**：访问 `http://localhost:3009/api/downloads` 获取文件列表的JSON数据

注意：下载目录中的文件是公开可访问的，不需要身份验证。

## 故障排除

1. **端口冲突**：如果3009端口被占用，可以在 `server.js` 中修改PORT变量
2. **前端不更新**：确保在修改前端代码后运行 `npm run build` 命令
3. **无法获取密码**：检查服务器是否正常运行，并确认API端点是否可访问

## 许可证

本项目为开源软件，可根据需要自由使用和修改。