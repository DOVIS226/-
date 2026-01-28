# 手动添加题目功能 - 测试指南

## 功能说明

现在你可以在问卷管理页面手动添加题目了！

## 使用步骤

### 1. 启动服务

**后端服务（已启动）：**
```bash
# 后端运行在 http://localhost:8000
# API 文档: http://localhost:8000/docs
```

**前端服务：**
```bash
cd frontend
npm run dev
# 前端运行在 http://localhost:3000
```

### 2. 操作流程

1. **打开问卷管理页面**
   - 访问教师端问卷管理页面

2. **创建新问卷**
   - 点击"创建问卷"按钮
   - 选择"手动上传"模式

3. **添加题目**
   - 点击"手动添加题目"按钮
   - 在弹出的编辑器中填写题目信息：
     - 选择题目类型（单选题/多选题/填空题）
     - 输入题目内容
     - 添加选项（选择题）
     - 设置正确答案
     - 设置分值和难度
     - 添加答案解析（可选）
   - 点击"保存题目"

4. **查看已添加的题目**
   - 保存后，题目会显示在"已添加题目"列表中
   - 可以删除不需要的题目

5. **完成创建**
   - 添加完所有题目后，点击"开始识别"完成问卷创建

## 支持的题目类型

### 1. 单选题
- 至少需要 2 个选项
- 正确答案从下拉列表中选择（如：A、B、C、D）

### 2. 多选题
- 至少需要 2 个选项
- 正确答案用逗号分隔（如：A,B,D）

### 3. 填空题
- 不需要选项
- 直接输入正确答案

## API 端点

前端会调用以下后端 API：

- **创建题目**: `POST /api/teacher/surveys/questions`
- **删除题目**: `DELETE /api/teacher/surveys/questions/{question_id}`

## 示例数据

### 单选题示例
```json
{
  "question_type": "single_choice",
  "question_text": "Python 是哪一年发布的？",
  "score": 5.0,
  "difficulty": "medium",
  "options": [
    {"key": "A", "value": "1989"},
    {"key": "B", "value": "1991"},
    {"key": "C", "value": "1995"},
    {"key": "D", "value": "2000"}
  ],
  "correct_answer": "B",
  "answer_explanation": "Python 由 Guido van Rossum 于 1991 年首次发布。"
}
```

### 多选题示例
```json
{
  "question_type": "multiple_choice",
  "question_text": "以下哪些是 Python 的特点？",
  "score": 10.0,
  "difficulty": "easy",
  "options": [
    {"key": "A", "value": "面向对象"},
    {"key": "B", "value": "解释型语言"},
    {"key": "C", "value": "编译型语言"},
    {"key": "D", "value": "动态类型"}
  ],
  "correct_answer": ["A", "B", "D"]
}
```

### 填空题示例
```json
{
  "question_type": "short_answer",
  "question_text": "Python 中用于定义函数的关键字是 ______。",
  "score": 3.0,
  "difficulty": "easy",
  "correct_answer": "def"
}
```

## 注意事项

1. **数据库配置**
   - 确保 PostgreSQL 数据库已启动
   - 检查 `backend/.env` 文件中的数据库配置

2. **CORS 配置**
   - 后端已配置允许 `http://localhost:3000` 访问
   - 如果前端端口不同，需要修改 `backend/app/main.py` 中的 CORS 配置

3. **题目验证**
   - 题目内容不能为空
   - 选择题必须至少有 2 个选项
   - 必须设置正确答案

## 故障排查

### 问题 1：点击按钮没有反应
- 检查浏览器控制台是否有错误
- 确认前端服务正在运行
- 检查后端服务是否正常（访问 http://localhost:8000/health）

### 问题 2：保存题目失败
- 检查后端服务日志
- 确认数据库连接正常
- 检查网络请求（浏览器开发者工具 -> Network）

### 问题 3：CORS 错误
- 检查后端 CORS 配置
- 确认前端地址在允许列表中

## 下一步开发

可以继续实现的功能：
- [ ] 题目编辑功能
- [ ] 题目排序功能
- [ ] 题目预览功能
- [ ] 批量导入题目
- [ ] 题目模板功能
- [ ] 题目分类管理

## 相关文档

- [后端 API 文档](../backend/API_DOCUMENTATION.md)
- [后端使用指南](../backend/USAGE_GUIDE.md)
