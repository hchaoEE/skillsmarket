# Skills 市场

用户可上传与下载符合 Cursor 标准的 Skills（目录含 `SKILL.md`）。

- **后端**：Python FastAPI，SQLite，JWT 认证
- **前端**：React + Vite + TypeScript

## 运行

### 后端

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API 默认：http://127.0.0.1:8000

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认：http://localhost:5173，通过 Vite 代理将 `/api` 转发到后端。

### 环境变量（可选）

在 `backend` 下创建 `.env`，参考 `.env.example`：

- `SECRET_KEY`：JWT 密钥
- `DATABASE_URL`：数据库 URL（默认 SQLite）
- `UPLOAD_DIR`：Skill zip 存储目录
- `CORS_ORIGINS`：允许的前端源

## 使用

1. 注册/登录后可在「上传」页上传 zip（包内需含 `SKILL.md`，且 frontmatter 含 `name`、`description`）。
2. 首页浏览、搜索、分页；点击进入详情页下载 zip，解压到 `~/.cursor/skills/` 或 `.cursor/skills/` 使用。
