# 添加题目失败问题 - 快速修复指南

## 问题原因

"添加题目失败，请重试" 错误的根本原因是：

1. **后端服务未运行** - 前端无法连接到后端 API (http://localhost:8000)
2. **数据库约束问题** - questions 表的 survey_id 字段不允许为空

## 解决步骤

### 第一步：修复数据库约束（已完成）

我已经修改了以下文件：
- ✅ `backend/app/models/survey.py` - 将 survey_id 改为可空
- ✅ `backend/database/init.sql` - 更新了表结构定义
- ✅ 创建了迁移脚本 `backend/database/migration_001_make_survey_id_nullable.sql`

### 第二步：执行数据库迁移

如果你的数据库已经创建，需要执行迁移：

**方法 1: 使用 psql（推荐）**
```bash
cd backend
psql -U postgres -d education_db -f database/migration_001_make_survey_id_nullable.sql
```

**方法 2: 手动执行 SQL**
连接到 PostgreSQL 数据库，执行：
```sql
ALTER TABLE questions ALTER COLUMN survey_id DROP NOT NULL;
```

**方法 3: 如果数据库还没创建**
```bash
cd backend
psql -U postgres -d education_db -f database/init.sql
```

### 第三步：安装 Python 依赖

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 第四步：启动后端服务

```bash
cd backend

# 方法 1: 使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 方法 2: 直接运行
python app/main.py

# 方法 3: 使用 py 启动器（Windows）
py app/main.py
```

### 第五步：验证后端服务

打开浏览器访问：
- http://localhost:8000 - 应该看到 API 信息
- http://localhost:8000/docs - 应该看到 API 文档
- http://localhost:8000/health - 应该返回 {"status": "ok"}

### 第六步：测试添加题目

1. 确保后端服务正在运行（端口 8000）
2. 确保前端服务正在运行（端口 3000）
3. 在前端页面尝试添加题目

## 常见问题

### Q: 后端启动失败，提示数据库连接错误
A: 检查 `backend/.env` 文件中的数据库配置：
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/education_db
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/education_db
```
将 `your_password` 替换为你的 PostgreSQL 密码。

### Q: 提示缺少 Python 模块
A: 确保已安装所有依赖：
```bash
pip install -r requirements.txt
```

### Q: 数据库不存在
A: 创建数据库：
```bash
psql -U postgres
CREATE DATABASE education_db;
\q
```
然后执行初始化脚本：
```bash
psql -U postgres -d education_db -f database/init.sql
```

### Q: 端口 8000 已被占用
A: 修改 `backend/.env` 文件中的 PORT 配置，或者停止占用端口的进程。

## 快速检查清单

- [ ] PostgreSQL 数据库已安装并运行
- [ ] 数据库 `education_db` 已创建
- [ ] 数据库表已初始化（执行了 init.sql）
- [ ] 数据库迁移已执行（survey_id 可为空）
- [ ] Python 依赖已安装
- [ ] 后端服务已启动（http://localhost:8000）
- [ ] 前端服务已启动（http://localhost:3000）
- [ ] 浏览器控制台没有网络错误

## 验证修复

成功后，你应该能够：
1. 在教师问卷管理页面点击"手动添加题目"
2. 填写题目信息
3. 点击"保存题目"
4. 看到"题目添加成功！"的提示
5. 题目出现在已添加题目列表中
