# Cloudflare DNS 管理器

一个用于管理 Cloudflare DNS 记录的纯前端仪表板。
基于 React, Vite, TypeScript, 和 Tailwind CSS 构建。

## 功能特点

- **纯前端**: 无需后端服务器（生产环境仅需一个简单的 CORS 代理）。
- **安全**: API Token 存储在本地 Cookie 中（有效期 7 天），绝不会发送给任何第三方服务器（仅发送给 Cloudflare 或您自己的代理）。
- **DNS 管理**: 查看、创建、编辑和删除 DNS 记录。
- **搜索**: 快速筛选域名和 DNS 记录。

## 快速开始

### 1. 安装

```bash
npm install
```

### 2. 本地开发

Cloudflare API 不支持 CORS。在本地开发中，本项目使用 Vite 的代理来转发请求。

```bash
npm run dev
```

- 打开 `http://localhost:5173`
- 输入您的 **Cloudflare API Token** (权限需求: Zone:Read, DNS:Edit)。
- **“代理 URL”** 留空即可。

### 3. 生产环境部署

由于 Cloudflare API 不支持 CORS，您不能直接托管此静态网站并直连 Cloudflare。您需要一个轻量级的代理。

#### 步骤 A: 部署代理 (Cloudflare Worker)

1. 创建一个新的 Cloudflare Worker。
2. 将 `worker-proxy.js`（位于本项目根目录）的内容复制到您的 Worker 中。
3. 部署 Worker 并复制其 URL（例如 `https://my-dns-proxy.user.workers.dev`）。

#### 步骤 B: 部署前端

1. 构建项目:
   ```bash
   npm run build
   ```
2. 将 `dist/` 文件夹部署到 **Cloudflare Pages**, Vercel, Netlify, 或任何静态主机。

#### 步骤 C: 连接

1. 打开您部署的前端 URL。
2. 输入您的 API Token。
3. 在 **“代理 URL”** 字段中，输入步骤 A 中获取的 Worker URL（例如 `https://my-dns-proxy.user.workers.dev`）。
4. 连接！

## 安全提示

- 您的 API Token 存储在您浏览器的 Cookie 中。
- 如果使用代理 Worker，Token 会经过该 Worker。请确保您信任该 Worker（建议自行部署）。
