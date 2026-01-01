# Cloudflare DNS 管理器

一个基于 Next.js 构建的 Cloudflare DNS 管理工具。
利用 Next.js 的 API Routes 能力，安全地在后端转发请求，彻底解决了浏览器直接访问 Cloudflare API 时的 CORS 跨域问题。

## 功能特点

- **全栈架构**: 使用 Next.js (App Router) 构建，前端与后端 API 完美融合。
- **无 CORS 问题**: 所有 Cloudflare API 请求均由 Next.js 后端转发，浏览器仅与同源 API 交互。
- **安全**: API Token 存储在本地 Cookie 中（有效期 7 天），后端转发时自动读取，Token 不会暴露在 URL 中。
- **DNS 管理**: 支持域名搜索、DNS 记录的增删改查。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

- 打开浏览器访问 `http://localhost:3000`
- 输入您的 **Cloudflare API Token** (权限需求: Zone:Read, DNS:Edit)。
- 直接登录使用即可，无需配置代理。

### 3. 生产环境部署

您可以将本项目部署到任何支持 Node.js 或 Edge Runtime 的平台（如 Vercel, Netlify, Cloudflare Pages 等）。

#### 部署到 Vercel (推荐)

1. 将代码推送到 GitHub/GitLab。
2. 在 Vercel 中导入项目。
3. 框架预设选择 **Next.js**。
4. 点击部署。

#### 部署到 Docker / Node.js 服务器

1. 构建项目:
   ```bash
   npm run build
   ```
2. 启动服务:
   ```bash
   npm start
   ```

## 安全提示

- 您的 API Token 存储在浏览器的 Cookie 中。
- Next.js 后端 (API Route) 会读取 Cookie 中的 Token 并代为向 Cloudflare 发起请求。
- Token 仅在您的浏览器和部署的 Next.js 服务器之间传输，不会发送给第三方。
