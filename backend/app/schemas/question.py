from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    """题目类型枚举"""
    SINGLE_CHOICE = "single_choice"  # 单选题
    MULTIPLE_CHOICE = "multiple_choice"  # 多选题
    TRUE_FALSE = "true_false"  # 判断题
    SHORT_ANSWER = "short_answer"  # 填空题
    ESSAY = "essay"  # 问答题


class Difficulty(str, Enum):
    """难度等级枚举"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# ============ 题目相关 Schema ============

class QuestionOptionCreate(BaseModel):
    """选项创建模型（用于单选、多选题）"""
    key: str = Field(..., description="选项标识，如 A, B, C, D")
    value: str = Field(..., description="选项内容")


class QuestionCreate(BaseModel):
    """创建题目的请求模型"""
    question_type: QuestionType = Field(..., description="题目类型")
    question_text: str = Field(..., min_length=1, max_length=2000, description="题目内容")
    score: float = Field(default=1.0, ge=0, description="题目分值")
    difficulty: Difficulty = Field(default=Difficulty.MEDIUM, description="难度等级")

    # 选项（仅用于选择题）
    options: Optional[List[QuestionOptionCreate]] = Field(None, description="选项列表")

    # 正确答案
    correct_answer: Optional[Any] = Field(None, description="正确答案")

    # 答案解析
    answer_explanation: Optional[str] = Field(None, max_length=1000, description="答案解析")

    # 标签和知识点
    tags: Optional[List[str]] = Field(default_factory=list, description="标签列表")
    knowledge_points: Optional[List[str]] = Field(default_factory=list, description="知识点列表")

    # 是否必答
    is_required: bool = Field(default=True, description="是否必答")

    @validator('options')
    def validate_options(cls, v, values):
        """验证选项：选择题必须有选项"""
        question_type = values.get('question_type')
        if question_type in [QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE]:
            if not v or len(v) < 2:
                raise ValueError(f"{question_type.value} 必须至少有2个选项")
        return v

    @validator('correct_answer')
    def validate_correct_answer(cls, v, values):
        """验证正确答案格式"""
        question_type = values.get('question_type')

        if question_type == QuestionType.SINGLE_CHOICE:
            # 单选题：正确答案应该是单个选项的 key
            if not isinstance(v, str):
                raise ValueError("单选题的正确答案应该是字符串（选项key）")

        elif question_type == QuestionType.MULTIPLE_CHOICE:
            # 多选题：正确答案应该是选项 key 的列表
            if not isinstance(v, list) or not all(isinstance(item, str) for item in v):
                raise ValueError("多选题的正确答案应该是字符串列表（选项key列表）")

        elif question_type == QuestionType.TRUE_FALSE:
            # 判断题：正确答案应该是布尔值或 "true"/"false"
            if not isinstance(v, (bool, str)):
                raise ValueError("判断题的正确答案应该是布尔值或字符串")

        elif question_type == QuestionType.SHORT_ANSWER:
            # 填空题：正确答案应该是字符串或字符串列表（多个可接受答案）
            if not isinstance(v, (str, list)):
                raise ValueError("填空题的正确答案应该是字符串或字符串列表")

        return v


class QuestionResponse(BaseModel):
    """题目响应模型"""
    id: str
    survey_id: Optional[str] = None
    question_type: QuestionType
    question_text: str
    question_order: int
    score: float
    difficulty: Difficulty
    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[Any] = None
    answer_explanation: Optional[str] = None
    tags: List[str] = []
    knowledge_points: List[str] = []
    is_required: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuestionUpdate(BaseModel):
    """更新题目的请求模型"""
    question_text: Optional[str] = Field(None, min_length=1, max_length=2000)
    score: Optional[float] = Field(None, ge=0)
    difficulty: Optional[Difficulty] = None
    options: Optional[List[QuestionOptionCreate]] = None
    correct_answer: Optional[Any] = None
    answer_explanation: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = None
    knowledge_points: Optional[List[str]] = None
    is_required: Optional[bool] = None


class QuestionBatchCreate(BaseModel):
    """批量创建题目的请求模型"""
    survey_id: str = Field(..., description="问卷ID")
    questions: List[QuestionCreate] = Field(..., min_items=1, description="题目列表")


class QuestionBatchResponse(BaseModel):
    """批量创建题目的响应模型"""
    success: bool
    message: str
    created_count: int
    questions: List[QuestionResponse]
