# My Space

个人工作台 — 待办事项管理 + 你画我猜游戏

## 版本历史

| 版本 | 日期 | 改动 |
|------|------|------|
| **v1.2** | 2026-05-13 | 修复词语泄露安全漏洞（仅画手和房主可见）、房主权威验证猜测（防作弊）、undo/填充远端同步修复、房主刷新后房间所有权恢复、中途加入游戏状态同步（画布/分数/轮次）、重连状态恢复、房主迁移画布保留、画笔权限房主验证、房间列表显示「我的房间」 |
| **v1.1** | 2026-05-13 | 游戏房间管理（房间列表、申请加入、房主审批、管理员关闭房间）、修复远程画画不可见 bug、项目重构为模块化目录、右下角版本号 |
| **v1.0** | 2026-05-10 | 初始版本：JWT 认证 + 用户管理、待办事项 CRUD（分类/标签/优先级/截止日期/重复/子任务/搜索筛选/批量操作）、你画我猜 P2P 游戏（PeerJS）、PWA 支持、深色模式/主题色、公告系统、云同步（GitHub API） |

## 目录结构

```
my-space/
├── public/                          ← 前端静态资源
│   ├── index.html                   ← 主页面（Todo + 你画我猜 双面板）
│   ├── manifest.json                ← PWA 清单
│   ├── sw.js                        ← Service Worker 缓存策略
│   └── css/
│       └── style.css                ← 全局样式（深色模式、主题色、布局）
│   └── js/
│       ├── core/                    ← 核心模块
│       │   ├── globals.js           ← 全局变量、API 封装、工具函数
│       │   ├── auth.js              ← 登录/注册/Token 验证
│       │   └── init.js              ← 应用启动、初始化
│       ├── todo/                    ← 待办事项模块
│       │   └── todo.js              ← 待办 CRUD、搜索、筛选、批量操作、分类管理
│       ├── game/                    ← 你画我猜模块
│       │   └── game.js              ← PeerJS 房间管理、画布绘制、游戏逻辑
│       ├── admin/                   ← 管理功能
│       │   └── admin.js             ← 用户审批、公告发布
│       ├── profile/                 ← 个人主页
│       │   └── profile.js           ← 头像、签名、统计
│       └── shared/                  ← 共用组件
│           ├── theme.js             ← 主题切换（深色/主题色/背景图）
│           ├── cloud-sync.js        ← 云端数据同步
│           ├── subtasks.js          ← 子任务功能
│           ├── announcements.js     ← 公告展示
│           └── change-password.js   ← 修改密码
├── api/                             ← 后端 API（Vercel Serverless Functions）
│   ├── _lib/storage.js              ← 数据存储层（GitHub API 读写 JSON）
│   ├── login.js                     ← 登录接口
│   ├── register.js                  ← 注册接口
│   ├── verify.js                    ← Token 验证
│   ├── sync.js                      ← 数据同步
│   ├── announce.js                  ← 公告管理
│   ├── change-password.js           ← 修改密码
│   ├── admin/                       ← 管理员 API
│   └── game/
│       └── rooms.js                 ← 房间注册表（创建/加入/审批/心跳/管理）
├── data/                            ← 数据存储（GitHub 同步）
│   ├── users.json                   ← 用户数据
│   └── rooms.json                   ← 房间数据
├── docs/                            ← 设计文档
├── vercel.json                      ← Vercel 部署配置
├── package.json                     ← 项目依赖
└── README.md                        ← 本文件
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + Vanilla JS（无框架） |
| P2P 通信 | PeerJS（WebRTC） |
| 后端 | Vercel Serverless Functions（Node.js） |
| 数据存储 | GitHub API（JSON 文件） |
| 认证 | JWT（HS256） |
| 部署 | Vercel |
| PWA | Service Worker + Web App Manifest |

## 本地开发

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行
vercel dev
```

访问 `http://localhost:3000` 即可。
