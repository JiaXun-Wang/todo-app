# 你画我猜 — 房间管理功能设计

## 概述

为 你画我猜 游戏添加服务端房间注册表、房间列表展示、申请加入审批流程、以及管理员房间管理功能。同时修复远程画画 move 事件参数缺失的 bug。

## 1. 数据模型

新增 `data/rooms.json`，通过 GitHub API 读写：

```json
[
  {
    "id": "room-abc123",
    "name": "快乐画室",
    "hostName": "小明",
    "hostPeerId": "peer-xyz",
    "status": "active",
    "players": [
      { "name": "小明", "peerId": "peer-xyz" },
      { "name": "小红", "peerId": "peer-aaa" }
    ],
    "joinRequests": [
      { "name": "小刚", "peerId": null, "requestedAt": "2026-05-13T10:01:00Z" }
    ],
    "createdAt": "2026-05-13T10:00:00Z",
    "lastHeartbeat": "2026-05-13T10:05:00Z"
  }
]
```

- `status`: `"active"` | `"closed"`
- `joinRequests`: 待审批的加入申请
- `lastHeartbeat`: 房主每 30s 更新；超过 90s 无心跳视为死房间，列表不展示
- 心跳由前端定时发送，后端只做存储

## 2. API — `/api/game/rooms.js`

所有接口需 JWT 认证。

| action | 方法 | 说明 |
|--------|------|------|
| (GET) | GET | 返回所有 status=active 且 lastHeartbeat 在 90s 内的房间 |
| `create` | POST | 房主创建房间时注册 |
| `request_join` | POST | 申请加入房间 |
| `approve_join` | POST | 房主同意加入（附带 peerId） |
| `reject_join` | POST | 房主拒绝加入 |
| `player_join` | POST | 玩家成功进入后更新 player 列表 |
| `player_leave` | POST | 玩家离开，从列表移除 |
| `heartbeat` | POST | 房主心跳 |
| `close` | POST | 房主关闭房间 |
| `admin_close` | POST | 管理员关闭房间（不传 roomId=关闭全部） |

## 3. 前端改动

### 3.1 Bug 修复

`game.js` `doDraw` / `doDrawTouch` 的 move 事件补充 `c`, `s`, `t` 参数。

### 3.2 游戏大厅 — 房间列表

在 "创建房间" / "加入房间" 区域下方新增：

```
┌─────────────────────────────┐
│ 🏠 活跃房间                  │
│ ┌─────────────────────────┐ │
│ │ 快乐画室  房主: 小明 👤2 │ │
│ │        [申请加入]        │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 随便画画  房主: 小红 👤3 │ │
│ │        [申请加入]        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

- 页面加载时自动拉取房间列表（`GET /api/game/rooms`）
- 每 10 秒自动刷新列表
- 点击"申请加入"→ 发送 `request_join` → 显示"已申请，等待房主同意..."
- 房主同意后，自动填入房间号并发起 PeerJS 连接

### 3.3 房主审批

- 房主客户端每 5 秒轮询房间信息（携带 roomId），检测新的 joinRequests
- 有新申请时弹出审批弹窗：申请人昵称 + 同意/拒绝按钮
- 同意：发送 `approve_join` + 房间 peerId，申请者收到后自动连接
- 拒绝：发送 `reject_join`，申请者看到"申请被拒绝"

### 3.4 管理员功能

在游戏 tab 内，管理员可见：

- "👑 房间管理" 按钮（header 区域）
- 面板内：
  - 所有房间列表（包括 active 和 closed）
  - 每个房间行有 "关闭" 按钮
  - 顶部 "一键关闭所有房间" 红色按钮（需确认）
- 关闭房间：`admin_close` + roomId
- 关闭全部：`admin_close` 不传 roomId

管理员关闭房间时，后端将该房间 status 改为 `"closed"`。房主心跳检测到 status 变化后广播 `game_over` + 断开所有连接。

### 3.5 死房间清理

- 列表展示时过滤掉 `lastHeartbeat > 90s` 的房间
- heartbeat 超时的房间仍保留在 `rooms.json` 中，管理员面板可见
- 定时心跳：`setInterval(heartbeat, 30000)` 在房主端运行

## 4. UI 结构

### 新增 HTML 元素

- `#roomListSection` — 房间列表区域（大厅内）
- `#roomListContainer` — 房间卡片容器
- `#joinRequestModal` — 房主审批弹窗
- `#adminGamePanel` — 管理员房间管理面板

### 新增 CSS

- `.room-card` — 房间卡片样式
- `.admin-room-row` — 管理面板房间行
- `.join-request-modal` — 审批弹窗

## 5. 错误处理

- 网络错误：API 调用失败时静默重试，不影响 P2P 连接
- 并发冲突：GitHub API 写入冲突时重试一次
- 死房间：心跳超时自动从活跃列表移除
- 管理员关闭房间：客户端收到 status=closed 后强制断开

## 6. 测试点

- [ ] 创建房间后出现在房间列表
- [ ] 房间列表自动刷新
- [ ] 申请加入 → 房主审批 → 成功进入
- [ ] 拒绝加入流程
- [ ] 管理员关闭单个房间
- [ ] 管理员一键关闭所有房间
- [ ] 房主离开后房间从列表消失（或标记死房间）
- [ ] 远程画画正常显示（bug 修复验证）
- [ ] 心跳机制正常
