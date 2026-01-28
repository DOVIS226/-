# 手动添加题目功能 - 使用指南

## 📋 前置准备

### 1. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置数据库

#### 方式一：使用 PostgreSQL（推荐）

1. 确保 PostgreSQL 已安装并运行
2. 创建数据库：
```sql
CREATE DATABASE education_db;
```

3. 创建 `.env` 文件（在 `backend` 目录下）：
```env
# 数据库配置
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/education_db
ASYNC_DATABASE_URL=postgresql+asyncpg://your_user:your_password@localhost:5432/education_db

# 应用配置
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# CORS配置
CORS_ORIGINS=["http://localhost:3000"]
```

4. 初始化数据库表：
```bash
cd backend
psql -U your_user -d education_db -f database/init.sql
```

#### 方式二：快速测试（使用 SQLite - 需要修改配置）

如果只是快速测试，可以暂时使用 SQLite，但需要修改配置文件。

---

## 🚀 启动后端服务

### 方式一：直接运行
```bash
cd backend
python -m app.main
```

### 方式二：使用 uvicorn
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动成功后，你会看到：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

访问 http://localhost:8000/docs 查看 API 文档（Swagger UI）

---

## 🧪 测试 API

### 使用 Swagger UI（推荐）

1. 打开浏览器访问：http://localhost:8000/docs
2. 找到 "教师-问卷" 标签下的题目相关接口
3. 点击 "Try it out" 按钮
4. 填写请求参数并执行

### 使用 curl 命令

#### 1. 创建单选题
```bash
curl -X POST "http://localhost:8000/api/teacher/surveys/questions" \
  -H "Content-Type: application/json" \
  -d '{
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
    "answer_explanation": "Python 由 Guido van Rossum 于 1991 年首次发布。",
    "tags": ["编程语言", "历史"],
    "knowledge_points": ["Python基础"],
    "is_required": true
  }'
```

#### 2. 创建多选题
```bash
curl -X POST "http://localhost:8000/api/teacher/surveys/questions" \
  -H "Content-Type: application/json" \
  -d '{
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
    "correct_answer": ["A", "B", "D"],
    "is_required": true
  }'
```

#### 3. 创建填空题
```bash
curl -X POST "http://localhost:8000/api/teacher/surveys/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "question_type": "short_answer",
    "question_text": "Python 中用于定义函数的关键字是 ______。",
    "score": 3.0,
    "difficulty": "easy",
    "correct_answer": "def",
    "is_required": true
  }'
```

---

## 🎨 前端集成

### React 示例

创建一个题目表单组件：

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const QuestionForm = ({ surveyId }) => {
  const [questionType, setQuestionType] = useState('single_choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { key: 'A', value: '' },
    { key: 'B', value: '' }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionData = {
      question_type: questionType,
      question_text: questionText,
      score: 5.0,
      difficulty: 'medium',
      is_required: true
    };

    // 如果是选择题，添加选项
    if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      questionData.options = options;
    }

    // 添加正确答案
    if (questionType === 'multiple_choice') {
      questionData.correct_answer = correctAnswer.split(',');
    } else {
      questionData.correct_answer = correctAnswer;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/teacher/surveys/${surveyId}/questions`,
        questionData
      );
      alert('题目创建成功！');
      console.log(response.data);
    } catch (error) {
      alert('创建失败：' + error.response?.data?.detail);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>题目类型：</label>
        <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
          <option value="single_choice">单选题</option>
          <option value="multiple_choice">多选题</option>
          <option value="short_answer">填空题</option>
        </select>
      </div>

      <div>
        <label>题目内容：</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </div>

      {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
        <div>
          <label>选项：</label>
          {options.map((opt, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder={`选项 ${opt.key}`}
                value={opt.value}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].value = e.target.value;
                  setOptions(newOptions);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={() => {
            const nextKey = String.fromCharCode(65 + options.length);
            setOptions([...options, { key: nextKey, value: '' }]);
          }}>
            添加选项
          </button>
        </div>
      )}

      <div>
        <label>正确答案：</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder={questionType === 'multiple_choice' ? '多个答案用逗号分隔，如：A,B,D' : ''}
        />
      </div>

      <button type="submit">创建题目</button>
    </form>
  );
};

export default QuestionForm;
```

### Vue 3 示例

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>题目类型：</label>
      <select v-model="questionType">
        <option value="single_choice">单选题</option>
        <option value="multiple_choice">多选题</option>
        <option value="short_answer">填空题</option>
      </select>
    </div>

    <div>
      <label>题目内容：</label>
      <textarea v-model="questionText" required></textarea>
    </div>

    <div v-if="questionType !== 'short_answer'">
      <label>选项：</label>
      <div v-for="(opt, index) in options" :key="index">
        <input
          type="text"
          :placeholder="`选项 ${opt.key}`"
          v-model="opt.value"
        />
      </div>
      <button type="button" @click="addOption">添加选项</button>
    </div>

    <div>
      <label>正确答案：</label>
      <input
        type="text"
        v-model="correctAnswer"
        :placeholder="questionType === 'multiple_choice' ? '多个答案用逗号分隔' : ''"
      />
    </div>

    <button type="submit">创建题目</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps(['surveyId']);

const questionType = ref('single_choice');
const questionText = ref('');
const options = ref([
  { key: 'A', value: '' },
  { key: 'B', value: '' }
]);
const correctAnswer = ref('');

const addOption = () => {
  const nextKey = String.fromCharCode(65 + options.value.length);
  options.value.push({ key: nextKey, value: '' });
};

const handleSubmit = async () => {
  const questionData = {
    question_type: questionType.value,
    question_text: questionText.value,
    score: 5.0,
    difficulty: 'medium',
    is_required: true
  };

  if (questionType.value !== 'short_answer') {
    questionData.options = options.value;
  }

  if (questionType.value === 'multiple_choice') {
    questionData.correct_answer = correctAnswer.value.split(',');
  } else {
    questionData.correct_answer = correctAnswer.value;
  }

  try {
    const response = await axios.post(
      `http://localhost:8000/api/teacher/surveys/${props.surveyId}/questions`,
      questionData
    );
    alert('题目创建成功！');
    console.log(response.data);
  } catch (error) {
    alert('创建失败：' + error.response?.data?.detail);
  }
};
</script>
```

---

## 📝 API 端点总结

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/teacher/surveys/questions` | 创建独立题目 |
| POST | `/api/teacher/surveys/{survey_id}/questions` | 向问卷添加题目 |
| POST | `/api/teacher/surveys/{survey_id}/questions/batch` | 批量添加题目 |
| GET | `/api/teacher/surveys/{survey_id}/questions` | 获取问卷题目列表 |
| DELETE | `/api/teacher/surveys/questions/{question_id}` | 删除题目 |

---

## ⚠️ 常见问题

### 1. 数据库连接失败
- 检查 PostgreSQL 是否运行
- 检查 `.env` 文件中的数据库配置是否正确
- 确认数据库用户有足够的权限

### 2. 导入错误
- 确保所有依赖已安装：`pip install -r requirements.txt`
- 检查 Python 版本（需要 3.8+）

### 3. CORS 错误
- 检查 `settings.py` 中的 `CORS_ORIGINS` 配置
- 确保前端地址在允许列表中

### 4. 题目创建失败
- 检查请求数据格式是否正确
- 选择题必须提供至少2个选项
- 单选题的 `correct_answer` 应该是字符串
- 多选题的 `correct_answer` 应该是数组

---

## 📚 更多文档

详细的 API 文档请查看：[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🎯 下一步

1. ✅ 后端 API 已完成
2. 🔲 前端表单界面开发
3. 🔲 题目预览功能
4. 🔲 题目编辑功能
5. 🔲 题目排序功能
