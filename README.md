# 艺术家子杰的个人网页和作品列表

使用 [Quartz v5](https://quartz.jzhao.xyz/) 构建的个人网站，包含作品、事件、研究、项目、出版物和经历等内容。

内置一个浏览器编辑器（`editor.html`），无需安装 Node.js 即可直接编辑内容和提交推送到 GitHub。

## 技术栈

### 网站部分

| 技术 | 用途 |
|------|------|
| Quartz v5 | 静态网站生成器 |
| Preact | JSX 渲染 |
| esbuild | 构建打包 |
| GitHub Pages | 部署托管 |

### 浏览器编辑器（editor.html）

| 技术 | 用途 |
|------|------|
| [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) | 浏览器直接读写本地文件（Chrome/Edge） |
| [isomorphic-git](https://isomorphic-git.org/) | 浏览器内执行 Git add/commit/push |
| [marked](https://marked.js.org/) | Markdown 实时预览渲染 |
| IndexedDB | 持久化目录句柄，刷新后自动恢复 |
| LocalStorage | 草稿自动保存、主题偏好、Token（可选） |

编辑器通过自定义 fs 适配器将 File System Access API 包装为 isomorphic-git 所需的 `fs.promises` 接口，实现纯浏览器内的完整 Git 工作流。

## 使用教程

### 1. 安装环境（首次）

```bash
git clone https://github.com/junelee220/junelee220.github.io.git
cd junelee220.github.io
npm install
npm run install-plugins   # 安装 Quartz 插件
```

> Node.js >= 22 必需（`.node-version` 指定 v22.16.0，`.npmrc` 启用 engine-strict）

### 2. 启动预览服务器

```bash
npm run docs
```

打开 http://localhost:8080 查看网站。

### 3. 使用编辑器编辑内容

双击 `editor.html` 用 Chrome 或 Edge 打开。

**首次打开：**
1. 点击「打开文件夹」
2. 选择项目根目录（包含 `content/` 和 `.git/` 的目录）
3. 授权读写权限
4. 左侧文件树显示 `content/` 下所有 Markdown 文件

**编辑文件：**
1. 左侧点击文件名打开
2. 「编辑」标签页：填写标题、日期、标签，下方 Markdown 编辑器支持实时预览
3. Markdown 工具栏：H1-H3、粗体、斜体、链接、图片、引用、列表、代码等一键插入
4. 拖拽图片到编辑器自动上传到对应目录并插入引用
5. `Ctrl/Cmd + S` 保存（直接写入磁盘）
6. 「展签」标签页：编辑中英文双语展览标签
7. 「预览」标签页：查看最终渲染效果

**新建文件：**
1. 左侧底部点击「+ 新建页面」
2. 选择文件夹、填写标题和日期
3. 文件名自动按 `年份+中文标题.md` 格式生成

**删除/重命名：**
- 文件上右键或点击 ⋯ 按钮 -> 重命名或删除

### 4. 提交推送到 GitHub

1. 点击顶栏「提交推送」按钮
2. 弹窗显示彩色变更列表（新增/修改/删除）
3. 填写提交信息
4. 填写 GitHub Token（Fine-grained，仅授权此仓库 Contents 读写）
   - 不填 Token：仅本地提交，自动复制 git 命令到剪贴板
   - 填 Token：浏览器内完成 add + commit + push
5. Token 默认不记住，勾选「记住 Token」可持久化（明文存于浏览器 localStorage）

### 5. 部署

推送到 `main` 分支后，GitHub Actions 自动：
1. 安装依赖和插件
2. 应用插件补丁
3. 构建网站
4. 部署到 GitHub Pages

## 内容结构

```
content/
├── index.md            # 首页
├── about/              # 关于
├── 01works/            # 作品（前缀控制排序）
├── 02events/           # 事件
├── 03researches/       # 研究
├── 04projects/         # 项目
├── 05publications/     # 出版物
└── 06experiences/      # 经历
```

文件命名使用 2 位年份前缀（如 `25顺流而下.md` = 2025 年），排序自动按年份降序。

## 常用命令

```bash
npm run docs             # 启动开发服务器 (localhost:8080)
npm run check            # 类型检查 + 格式检查
npm run format           # 自动格式化
npm run install-plugins  # 安装 Quartz 插件
```

## 浏览器支持

编辑器仅支持 Chrome 和 Edge（File System Access API 限制）。Safari 和 Firefox 会显示不支持提示。

网站本身在所有现代浏览器中正常显示。
