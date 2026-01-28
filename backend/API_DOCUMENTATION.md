# 手动添加题目 API 文档

## 概述

本文档介绍如何使用后端 API 手动添加题目到问卷系统。支持单选题、多选题和填空题。

## API 端点

### 1. 创建单个题目（不关联问卷）

**端点**: `POST /api/teacher/surveys/questions`

**描述**: 创建一个独立的题目，可以后续添加到问卷中。

**请求体示例 - 单选题**:
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
  "answer_explanation": "Python 由 Guido van Rossum 于 1991 年首次发布。",
  "tags": ["编程语言", "历史"],
  "knowledge_points": ["Python基础"],
  "is_required": true
}
```

**请求体示例 - 多选题**:
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
  "correct_answer": ["A", "B", "D"],
  "answer_explanation": "Python 是面向对象的解释型动态类型语言。",
  "tags": ["编程语言", "特性"],
  "knowledge_points": ["Python特性"],
  "is_required": true
}
```

**请求体示例 - 填空题**:
```json
{
  "question_type": "short_answer",
  "question_text": "Python 中用于定义函数的关键字是 ______。",
  "score": 3.0,
  "difficulty": "easy",
  "correct_answer": "def",
  "answer_explanation": "Python 使用 def 关键字定义函数。",
  "tags": ["语法", "函数"],
  "knowledge_points": ["函数定义"],
  "is_required": true
}
```

**响应示例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "survey_id": null,
  "question_type": "single_choice",
  "question_text": "Python 是哪一年发布的？",
  "question_order": 0,
  "score": 5.0,
  "difficulty": "medium",
  "options": {
    "A": "1989",
    "B": "1991",
    "C": "1995",
    "D": "2000"
  },
  "correct_answer": "B",
  "answer_explanation": "Python 由 Guido van Rossum 于 1991 年首次发布。",
  "tags": ["编程语言", "历史"],
  "knowledge_points": ["Python基础"],
  "is_required": true,
  "created_at": "2026-01-27T10:30:00Z",
  "updated_at": "2026-01-27T10:30:00Z"
}
```

---

### 2. 向问卷添加单个题目

**端点**: `POST /api/teacher/surveys/{survey_id}/questions`

**描述**: 向指定的问卷添加一个题目。

**路径参数**:
- `survey_id`: 问卷的 UUID

**请求体**: 与上面的格式相同

---

### 3. 批量添加题目到问卷

**端点**: `POST /api/teacher/surveys/{survey_id}/questions/batch`

**描述**: 一次性向问卷添加多个题目。

**请求体示例**:
```json
[
  {
    "question_type": "single_choice",
    "question_text": "题目1",
    "score": 5.0,
    "difficulty": "easy",
    "options": [
      {"key": "A", "value": "选项A"},
      {"key": "B", "value": "选项B"}
    ],
    "correct_answer": "A"
  },
  {
    "question_type": "short_answer",
    "question_text": "题目2",
    "score": 3.0,
    "difficulty": "medium",
    "correct_answer": "答案"
  }
]
```

**响应示例**:
```json
{
  "success": true,
  "message": "成功创建 2 道题目",
  "created_count": 2,
  "questions": [...]
}
```

---

### 4. 获取问卷的所有题目

**端点**: `GET /api/teacher/surveys/{survey_id}/questions`

**描述**: 获取指定问卷的所有题目列表。

**响应**: 题目数组

---

### 5. 删除题目

**端点**: `DELETE /api/teacher/surveys/questions/{question_id}`

**描述**: 删除指定的题目。

**响应示例**:
```json
{
  "success": true,
  "message": "题目删除成功"
}
```

---

## 题目类型说明

| 类型 | 值 | 说明 |
|------|-----|------|
| 单选题 | `single_choice` | 只能选择一个答案 |
| 多选题 | `multiple_choice` | 可以选择多个答案 |
| 判断题 | `true_false` | 对或错 |
| 填空题 | `short_answer` | 简短文本答案 |
| 问答题 | `essay` | 长文本答案 |

## 难度等级

- `easy`: 简单
- `medium`: 中等
- `hard`: 困难

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| question_type | string | 是 | 题目类型 |
| question_text | string | 是 | 题目内容（1-2000字符）|
| score | float | 否 | 分值（默认1.0）|
| difficulty | string | 否 | 难度（默认medium）|
| options | array | 条件 | 选项列表（选择题必填）|
| correct_answer | any | 否 | 正确答案 |
| answer_explanation | string | 否 | 答案解析（最多1000字符）|
| tags | array | 否 | 标签列表 |
| knowledge_points | array | 否 | 知识点列表 |
| is_required | boolean | 否 | 是否必答（默认true）|

## 前端集成示例

### 使用 Fetch API

```javascript
// 创建单选题
async function createSingleChoiceQuestion(surveyId) {
  const response = await fetch(`/api/teacher/surveys/${surveyId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_type: 'single_choice',
      question_text: '你的问题？',
      score: 5.0,
      difficulty: 'medium',
      options: [
        { key: 'A', value: '选项A' },
        { key: 'B', value: '选项B' },
        { key: 'C', value: '选项C' },
        { key: 'D', value: '选项D' }
      ],
      correct_answer: 'A',
      is_required: true
    })
  });

  const data = await response.json();
  console.log('创建成功:', data);
}

// 创建填空题
async function createShortAnswerQuestion(surveyId) {
  const response = await fetch(`/api/teacher/surveys/${surveyId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_type: 'short_answer',
      question_text: '请填写答案：______',
      score: 3.0,
      difficulty: 'easy',
      correct_answer: '正确答案',
      is_required: true
    })
  });

  const data = await response.json();
  console.log('创建成功:', data);
}

// 批量创建题目
async function createQuestionsInBatch(surveyId, questions) {
  const response = await fetch(`/api/teacher/surveys/${surveyId}/questions/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questions)
  });

  const data = await response.json();
  console.log('批量创建结果:', data);
}
```

### 使用 Axios

```javascript
import axios from 'axios';

// 创建题目
const createQuestion = async (surveyId, questionData) => {
  try {
    const response = await axios.post(
      `/api/teacher/surveys/${surveyId}/questions`,
      questionData
    );
    return response.data;
  } catch (error) {
    console.error('创建题目失败:', error.response.data);
    throw error;
  }
};

// 获取问卷题目列表
const getQuestions = async (surveyId) => {
  try {
    const response = await axios.get(
      `/api/teacher/surveys/${surveyId}/questions`
    );
    return response.data;
  } catch (error) {
    console.error('获取题目失败:', error);
    throw error;
  }
};
```

## 错误处理

API 可能返回以下错误：

- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

错误响应格式：
```json
{
  "detail": "错误描述信息"
}
```

## 注意事项

1. 选择题（单选、多选）必须提供至少2个选项
2. 单选题的 `correct_answer` 应该是字符串（选项key）
3. 多选题的 `correct_answer` 应该是字符串数组
4. 填空题的 `correct_answer` 可以是字符串或字符串数组（多个可接受答案）
5. 所有 UUID 参数必须是有效的 UUID 格式
6. 题目内容不能为空，最多2000字符
7. 答案解析最多1000字符
