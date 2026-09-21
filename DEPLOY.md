# 文案短句站 - 部署教程

> 纯前端文案短句站点项目，原生 HTML + CSS + JS，零后端依赖。

---

## 📁 项目结构

```
web7/
├── index.html              # 主页面（场景Tab+类型Tab+搜索+排序+随机生成器+收藏区+卡片网格+弹窗）
├── css/
│   └── style.css           # ~1000行样式（15种渐变背景、双主题变量、三断点响应式、卡片悬停）
├── js/
│   └── app.js              # 核心逻辑（搜索、筛选、排序、收藏、主题、复制、弹窗、随机生成）
├── data/
│   └── data.json           # 110+条文案数据（10场景×4类型混合）
├── scripts/
│   └── fetch-data.js       # Node原生https数据获取脚本（失败自动生成100+示例）
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 自动部署配置
├── package.json            # npm scripts: fetch / start / dev / build / preview
├── vite.config.js          # Vite 配置（base: './' 兼容子路径部署）
├── .nojekyll               # 禁用 GitHub Pages Jekyll 处理
├── .gitignore              # Git 忽略规则
└── DEPLOY.md               # 本部署文档
```

---

## ✨ 功能特性清单

| 功能类别 | 详细特性 |
|---------|---------|
| **首页筛选** | 10大场景标签 + 4种类型 + 搜索框 |
| **文案卡片** | 渐变背景 / 正文 / 字数 / 分类 / ❤点赞 / 📋复制 / 🔖收藏 |
| **详情弹窗** | 完整文案 / 作者 / 来源 / 分类 / 场景标签 / 复制 / 收藏 / 分享 |
| **侧边栏** | 今日推荐 + 随机文案生成器（按场景生成） |
| **排序方式** | 最新发布 / 最热点赞 / 字数从短到长 |
| **响应式** | 1024px / 768px / 480px 三断点完美适配 |
| **双主题** | 暗/亮主题切换按钮 + localStorage持久化 + 系统偏好自动检测 |
| **搜索** | 300ms 防抖 + 正文/作者/来源/标签多字段匹配 |
| **回到顶部** | 滚动400px后显示，平滑滚动 |
| **状态展示** | 加载中（Spinner）/ 空状态 / 错误状态 三态齐全 |
| **详情弹窗** | ESC键 / 遮罩点击 / ×按钮 三种关闭方式 |
| **收藏夹** | localStorage持久化 + 顶部🔖Tab一键查看 |
| **随机生成器** | 按场景随机挑选文案 + 点击查看详情 |
| **路径兼容** | resolveDataPath() 兼容 GitHub Pages 子路径部署 |

---

## 🚀 本地开发

### 方式一：使用 npm（推荐）

需要 Node.js 版本 ≥ 16

```bash
# 1. 进入项目目录
cd web7

# 2. 安装依赖
npm install

# 3. 获取/生成数据（首次运行必执行）
npm run fetch

# 4. 启动开发服务器（默认端口5173）
npm run dev
# 或
npm start

# 5. 生产构建
npm run build

# 6. 预览构建结果
npm run preview
```

启动后访问：http://localhost:5173

### 方式二：直接双击打开

无需任何工具，直接双击 `index.html` 即可在浏览器打开。

> ⚠️ 注意：直接打开时，部分浏览器会限制 `fetch` 读取本地 JSON 文件。如遇到加载失败：
> 1. 推荐使用方式一的 Vite 开发服务器
> 2. 或使用 VS Code "Live Server" 插件
> 3. 或使用任意本地 HTTP 服务器（如 `python -m http.server`）

---

## 🌐 GitHub Pages 自动部署（推荐）

### 步骤 1：创建 GitHub 仓库

1. 登录 GitHub，点击 **New Repository**
2. 仓库名任意（例如 `copywriting-station`），选择 Public
3. 不需要初始化 README / .gitignore / LICENSE

### 步骤 2：上传代码

```bash
# 初始化 Git 仓库
cd web7
git init
git checkout -b main

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化文案短句站项目"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送到 main 分支
git push -u origin main
```

### 步骤 3：启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**（重要！不是 Deploy from branch）
3. 保存配置

### 步骤 4：触发自动部署

推送代码到 `main` 分支会自动触发部署工作流：
- 工作流文件：`.github/workflows/deploy.yml`
- 三触发条件：`push` / `pull_request` / `workflow_dispatch`（手动触发）
- 三 Job：**build（构建）** → **deploy（部署）** → **notify（通知）**
- 官方 Actions 版本：checkout@v4 / setup-node@v4 / configure-pages@v5 / upload-pages-artifact@v3 / deploy-pages@v4

### 步骤 5：访问站点

部署成功后访问：
```
https://你的用户名.github.io/仓库名/
```

> 本项目已内置路径兼容机制：
> - `index.html` 使用 `<base href="./">`
> - `vite.config.js` 设置 `base: './'`
> - `js/app.js` 的 `resolveDataPath()` 自动兼容子路径
> - 根目录 `.nojekyll` 文件禁用 Jekyll 处理

---

## 🛠️ 手动部署到任意静态服务器

构建产物位于 `dist/` 目录：

```bash
cd web7
npm install
npm run build
```

将 `dist/` 目录上传到任意静态托管平台即可：

| 平台 | 说明 |
|------|------|
| **Vercel** | 直接导入仓库，Build Command: `npm run build`，Output: `dist` |
| **Netlify** | 拖拽 `dist` 文件夹到页面即可 |
| **Cloudflare Pages** | 直接连接仓库，Build: `npm run build`，Output: `dist` |
| **Nginx** | 将 `dist` 目录放到 nginx html 目录下 |
| **FTP** | 上传 `dist` 内所有文件到服务器站点根目录 |

---

## 📝 数据文件格式说明

`data/data.json` 是一个对象数组，每个对象字段如下：

```json
{
  "id": 1,
  "content": "愿你成为自己喜欢的样子，不抱怨，不将就，有自由，有光芒。",
  "author": "佚名",
  "source": "网络收集",
  "scenes": ["朋友圈", "个性签名", "励志"],
  "type": "short",
  "wordCount": 26,
  "likes": 3421,
  "createdAt": "2026-07-15T08:30:00Z",
  "gradientIndex": 0,
  "isHot": true
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 唯一ID（必填） |
| `content` | string | 文案正文（必填） |
| `author` | string | 作者（可选，默认"佚名"） |
| `source` | string | 来源（可选，默认"网络收集"） |
| `scenes` | string[] | 使用场景数组，可选值见下方（必填） |
| `type` | string | 文案类型：`short`/`paragraph`/`title`/`copy`（必填） |
| `wordCount` | number | 字数（建议与内容实际字数一致） |
| `likes` | number | 点赞数 |
| `createdAt` | string | 创建时间，ISO 8601 格式 |
| `gradientIndex` | number | 渐变背景索引，取值 0~14（15种渐变） |
| `isHot` | boolean | 是否热门（显示🔥HOT标签） |

### 场景可选值（10种）

`朋友圈` `个性签名` `抖音/快手` `小红书` `微博` `作文素材` `节日祝福` `情感语录` `早安晚安` `励志`

### 类型可选值（4种）

| 值 | 显示 | 说明 |
|----|------|------|
| `short` | 短句 | 短句子，通常 <25字 |
| `paragraph` | 段落 | 长段落，通常 >25字 |
| `title` | 标题 | 通常加书名号《》 |
| `copy` | 文案 | 完整文案，可包含描述 |

---

## 🔄 使用数据获取脚本

`scripts/fetch-data.js` 功能：
1. 尝试从远程 URL 获取真实数据（2个备选地址）
2. 获取失败则**自动生成120条示例数据**（10场景 × 4类型混合）
3. 校验数据格式，过滤无效条目
4. 输出场景分布和类型分布统计

```bash
# 单独执行数据获取/生成
npm run fetch
```

如需接入自己的数据源，编辑 `scripts/fetch-data.js` 顶部的 `remoteUrls` 数组即可。

---

## 🎨 自定义样式指南

### 修改主题色

编辑 `css/style.css` 顶部的 CSS 变量：

```css
:root {
  --accent-primary: #6366f1;   /* 主色 */
  --accent-secondary: #8b5cf6; /* 次色 */
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

[data-theme="dark"] {
  --accent-primary: #818cf8;
  --accent-secondary: #a78bfa;
}
```

### 新增渐变背景

目前有 15 种渐变（`.gradient-0` ~ `.gradient-14`），新增：

```css
.gradient-15 { background: linear-gradient(135deg, #颜色1 0%, #颜色2 100%); }
[data-theme="dark"] .gradient-15 { background: linear-gradient(135deg, #暗色1 0%, #暗色2 100%); }
```

然后在生成数据时 `gradientIndex` 使用 15 即可。

### 新增场景/类型标签

1. 编辑 `js/app.js` 顶部的 `SCENES` / `TYPES` / `TYPE_LABELS` 常量
2. 同步更新 `data/data.json` 中的数据

---

## ❓ 常见问题 FAQ

### Q1: GitHub Pages 部署后白屏 / 404？

**排查清单：**
1. ✅ 确认仓库 Settings → Pages → Source 选择的是 **GitHub Actions**
2. ✅ 确认 Actions 标签页中的 workflow 运行成功（绿色 ✔️）
3. ✅ 确认仓库根目录存在 `.nojekyll` 文件
4. ✅ 打开浏览器 F12 Console，检查是否有报错
5. ✅ 访问地址格式正确：`https://用户名.github.io/仓库名/`（末尾不能少 /）
6. ⏱ 首次部署需要等 1~5 分钟生效，耐心等待

### Q2: 本地打开 index.html 数据加载失败？

这是浏览器的 CORS / file:// 协议限制，**不是项目问题**。

**解决方法（任选其一）：**
1. 推荐：`npm install && npm run dev` 使用 Vite 开发服务器
2. VS Code 安装 "Live Server" 插件，右键 index.html → Open with Live Server
3. Python 自带服务器：`python -m http.server 8080`，然后访问 http://localhost:8080
4. 全局安装 http-server：`npx http-server .`

### Q3: 如何增加更多文案数据？

直接编辑 `data/data.json`，按上文的数据格式添加对象即可。确保：
- `id` 全局唯一，不能重复
- `scenes` 数组内的值必须是 10 个标准场景名之一
- `type` 只能是 4 个标准值之一
- 保存后刷新浏览器即可

### Q4: 收藏夹数据存在哪里？会丢失吗？

收藏夹数据保存在浏览器的 **localStorage**，键名：
- `copywriting_favorites`：收藏的文案ID数组
- `copywriting_liked`：点赞过的文案ID数组
- `copywriting_theme`：主题偏好（dark/light）

**注意事项：**
- 清除浏览器数据 / 无痕模式 会丢失收藏
- 换浏览器 / 换设备 不会同步收藏
- localStorage 单个域名限制约 5MB，足够存数千条收藏

### Q5: 如何关闭暗/亮主题？

在 `index.html` 中删除 `.theme-toggle` 按钮即可，或在 `js/app.js` 中注释掉 `setupThemeToggle()` 调用。

### Q6: 随机生成器的范围？

随机生成器从**全部数据**中按场景筛选后随机挑选一条。如需限制数量或其他条件，编辑 `js/app.js` 的 `setupGenerator()` 函数。

### Q7: 弹窗无法关闭？

三种关闭方式：
1. 点击右上角 ✕ 按钮
2. 点击弹窗外面的半透明遮罩
3. 按键盘 **ESC** 键

如果都不行，按 **F5** 刷新页面。

### Q8: 如何修改站点标题和 Logo？

编辑 `index.html`：
- `<title>` 标签：浏览器标签页标题
- `<meta name="description">`：搜索引擎描述
- `<div class="logo">`：左上角 Logo 文字和图标
- Footer 区域：底部版权文字

### Q9: 构建时报错 node_modules 找不到？

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

Windows PowerShell：
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Q10: 如何接入后端实现云同步收藏？

前端调用接口的位置：
- 读取收藏：`loadFavorites()` 函数
- 保存收藏：`saveFavorites()` 函数
- 读取点赞：`loadLikedIds()` 函数
- 保存点赞：`saveLikedIds()` 函数

将 localStorage 读写替换为你后端的 API 调用即可（推荐 fetch + async/await）。

---

## 📦 技术栈说明

| 类别 | 技术 | 说明 |
|------|------|------|
| **核心** | 原生 HTML5 + CSS3 + ES6+ JavaScript | 零框架，零依赖 |
| **构建** | Vite 5.x | 开发服务器 + 生产构建 |
| **部署** | GitHub Actions + GitHub Pages | 免费自动部署 |
| **数据** | JSON 静态数据 | 可选 Node.js 脚本获取/生成 |
| **响应式** | CSS Grid + Flexbox + 媒体查询 | 1024/768/480 三断点 |
| **存储** | localStorage | 主题 + 收藏 + 点赞 |

---

## 🔗 相关链接

- [Vite 官方文档](https://cn.vitejs.dev/)
- [GitHub Pages 官方文档](https://docs.github.com/zh/pages)
- [GitHub Actions 官方文档](https://docs.github.com/zh/actions)

---

## 📄 License

MIT License，可自由使用、修改、分发。

---

**部署成功后别忘了给项目一个 Star ⭐ 哦！**
