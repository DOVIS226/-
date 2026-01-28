# 数据库初始化说明

## 步骤 1: 创建数据库

在 PostgreSQL 中创建数据库：

```sql
CREATE DATABASE education_db;
```

## 步骤 2: 执行表结构初始化脚本

在 PostgreSQL 客户端（如 Navicat、pgAdmin 或 psql）中执行：

```sql
-- 执行 init.sql 创建所有表结构
\i backend/database/init.sql
```

或者在命令行中：

```bash
psql -U postgres -d education_db -f backend/database/init.sql
```

## 步骤 3: 插入初始数据

执行数据初始化脚本：

```sql
-- 执行 init_data.sql 插入教师账号和示例题目
\i backend/database/init_data.sql
```

或者在命令行中：

```bash
psql -U postgres -d education_db -f backend/database/init_data.sql
```

## 步骤 4: 配置数据库连接

在 `backend` 目录下创建 `.env` 文件（或修改现有配置）：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=education_db
```

或者在 `backend/app/config/settings.py` 中直接修改默认值。

## 验证数据

### 检查教师账号

```sql
SELECT u.username, u.email, u.role, t.teacher_number, t.department
FROM users u
JOIN teachers t ON u.id = t.user_id;
```

### 检查示例题目

```sql
SELECT q.id, q.question_type, q.question_text, q.score, s.title as survey_title
FROM questions q
JOIN surveys s ON q.survey_id = s.id;
```

## 测试登录

使用以下账号登录：
- 用户名: `teacher1` 密码: `teacher123`
- 用户名: `teacher2` 密码: `teacher123`

## 注意事项

1. **密码哈希**: 所有密码都使用 bcrypt 加密存储，不能直接查看明文
2. **UUID**: 所有 ID 使用 UUID 格式
3. **JSONB 字段**: `options`、`correct_answer`、`grading_criteria` 等字段使用 JSONB 类型
4. **外键约束**: 确保先创建 surveys 表，再创建 questions 表
