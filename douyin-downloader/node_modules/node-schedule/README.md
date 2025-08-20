# @karinjs/node-schedule

> [!IMPORTANT]
> 本项目是 [node-schedule](https://github.com/node-schedule/node-schedule) 的 fork 版本，专为更小体积和 ESM 兼容性而重构。  
> 说人话就是重新打包了一遍，转成esm。

## 特性

- 📦 体积极小：打包后仅 312KB（原版 4.6MB，[数据来源](https://pkg-size.dev/node-schedule)）
- 🚀 完全 ESM 支持：使用 Vite 重新打包为 ESM 格式
- 📝 TypeScript 支持：通过 tsup 自动生成类型声明文件
- 🛠️ 兼容原版 API，迁移无痛
- 🔒 仅包含核心功能，去除冗余依赖

## 环境要求

- Node.js 版本需 >= 18

## 安装

你可以使用多种包管理器进行安装：

### 使用 npm

```bash
npm install @karinjs/node-schedule
```

### 使用 pnpm

```bash
pnpm add @karinjs/node-schedule
```

### 使用 yarn

```bash
yarn add @karinjs/node-schedule
```

### 无缝升级（替换原有 node-schedule）

在 `package.json` 中配置依赖别名，或直接通过包管理器命令安装：

```json
{
  "dependencies": {
    "node-schedule": "npm:@karinjs/node-schedule"
  }
}
```

- 使用 npm：

```bash
npm install node-schedule@npm:@karinjs/node-schedule
```

- 使用 pnpm：

```bash
pnpm add node-schedule@npm:@karinjs/node-schedule
```

- 使用 yarn：

```bash
yarn add node-schedule@npm:@karinjs/node-schedule
```

这样在项目中 `import 'node-schedule'` 会自动指向本包，无需更改业务代码。

## 使用示例

```js
import schedule from '@karinjs/node-schedule';

// 每分钟执行一次任务
const job = schedule.scheduleJob('* * * * *', function(){
  console.log('每分钟执行一次');
});

// 取消任务
// job.cancel();
```

## 适用场景

- 对包体积有极致要求的 Serverless、边缘计算、微服务等场景
- 需要 ESM 支持的现代 Node.js 项目

## 与原版区别

- 仅保留核心调度功能，去除部分不常用特性
- 体积大幅缩小，加载更快
- 采用 ESM 构建，适配现代 Node.js

## 许可证

本项目许可证与原版 [node-schedule](https://github.com/node-schedule/node-schedule) 保持一致，采用 MIT 许可证，内容无任何变化，紧随上游。

MIT License © 2015 Matt Patenaude 及贡献者
