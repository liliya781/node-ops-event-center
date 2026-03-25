# Node Ops Event Center / Node.js 运维事件中心

## CN 简介
课程/训练型 Node.js 全栈项目，展示 Express + SQLite + Vue + ECharts 的快速落地。

## 运行效果
<img width="1600" height="1200" alt="dashboard" src="https://github.com/user-attachments/assets/eaf5f091-0195-4c2c-99e9-1c7afbe7c15a" />

## EN Summary
A course-level Node.js full-stack prototype using Express, SQLite, Vue, and ECharts.

## CN 功能与数据
- 核心功能：事件新增、筛选、状态更新、删除
- 统计图表：3 张（级别分布、服务分布、每日趋势）
- 后端接口：7 个
- 默认样例数据：4 条（启动时自动初始化）
- 数据存储：本地 SQLite 文件 `ops-events.db`

## EN Features & Metrics
- Core features: create/filter/update-status/delete events
- Charts: 3 (level, service, daily trend)
- Backend APIs: 7
- Seed data: 4 rows auto-initialized at startup
- Storage: local SQLite file `ops-events.db`

## Tech Stack
- Backend: Node.js, Express, better-sqlite3
- Frontend: Vue 3, Axios, ECharts, Vite

## Quick Start
### Backend
```bash
cd backend
npm install
npm run dev
```
URL: `http://localhost:8090`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
URL: `http://localhost:5176`

## API List
- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id/status`
- `DELETE /api/events/:id`
- `GET /api/stats/level`
- `GET /api/stats/service`
- `GET /api/stats/day`

## Low-Risk Statement / 降风险说明
- 项目定位为课程训练作品，重点在流程打通和可视化展示。
- 未做生产环境性能优化与高可用设计。
