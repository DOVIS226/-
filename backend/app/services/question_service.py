from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
import uuid
from datetime import datetime

from app.models.survey import Question
from app.schemas.question import (
    QuestionCreate,
    QuestionResponse,
    QuestionBatchResponse
)


class QuestionService:
    """题目管理服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_question(
        self,
        question_data: QuestionCreate,
        survey_id: Optional[str] = None
    ) -> QuestionResponse:
        """
        创建单个题目

        Args:
            question_data: 题目数据
            survey_id: 问卷ID（可选）

        Returns:
            创建的题目信息
        """
        # 转换选项格式：从列表转为字典
        options_dict = None
        if question_data.options:
            options_dict = {
                opt.key: opt.value for opt in question_data.options
            }

        # 获取题目顺序（如果关联问卷）
        question_order = 0
        if survey_id:
            # 查询该问卷已有题目数量
            result = await self.db.execute(
                select(Question).where(Question.survey_id == uuid.UUID(survey_id))
            )
            existing_questions = result.scalars().all()
            question_order = len(existing_questions) + 1

        # 创建题目对象
        question = Question(
            id=uuid.uuid4(),
            survey_id=uuid.UUID(survey_id) if survey_id else None,
            question_type=question_data.question_type.value,
            question_text=question_data.question_text,
            question_order=question_order,
            score=question_data.score,
            difficulty=question_data.difficulty.value,
            options=options_dict,
            correct_answer=question_data.correct_answer,
            answer_explanation=question_data.answer_explanation,
            tags=question_data.tags or [],
            knowledge_points=question_data.knowledge_points or [],
            is_required=question_data.is_required,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # 保存到数据库
        self.db.add(question)
        await self.db.flush()
        await self.db.refresh(question)

        # 转换为响应模型
        return QuestionResponse(
            id=str(question.id),
            survey_id=str(question.survey_id) if question.survey_id else None,
            question_type=question.question_type,
            question_text=question.question_text,
            question_order=question.question_order,
            score=float(question.score),
            difficulty=question.difficulty,
            options=question.options,
            correct_answer=question.correct_answer,
            answer_explanation=question.answer_explanation,
            tags=question.tags or [],
            knowledge_points=question.knowledge_points or [],
            is_required=question.is_required,
            created_at=question.created_at,
            updated_at=question.updated_at
        )

    async def create_questions_batch(
        self,
        survey_id: str,
        questions: List[QuestionCreate]
    ) -> QuestionBatchResponse:
        """
        批量创建题目

        Args:
            survey_id: 问卷ID
            questions: 题目列表

        Returns:
            批量创建结果
        """
        created_questions = []

        try:
            for question_data in questions:
                question = await self.create_question(question_data, survey_id)
                created_questions.append(question)

            await self.db.commit()

            return QuestionBatchResponse(
                success=True,
                message=f"成功创建 {len(created_questions)} 道题目",
                created_count=len(created_questions),
                questions=created_questions
            )

        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"批量创建题目失败: {str(e)}")

    async def get_questions_by_survey(
        self,
        survey_id: str
    ) -> List[QuestionResponse]:
        """
        获取问卷的所有题目

        Args:
            survey_id: 问卷ID

        Returns:
            题目列表
        """
        result = await self.db.execute(
            select(Question)
            .where(Question.survey_id == uuid.UUID(survey_id))
            .order_by(Question.question_order)
        )
        questions = result.scalars().all()

        return [
            QuestionResponse(
                id=str(q.id),
                survey_id=str(q.survey_id) if q.survey_id else None,
                question_type=q.question_type,
                question_text=q.question_text,
                question_order=q.question_order,
                score=float(q.score),
                difficulty=q.difficulty,
                options=q.options,
                correct_answer=q.correct_answer,
                answer_explanation=q.answer_explanation,
                tags=q.tags or [],
                knowledge_points=q.knowledge_points or [],
                is_required=q.is_required,
                created_at=q.created_at,
                updated_at=q.updated_at
            )
            for q in questions
        ]

    async def delete_question(self, question_id: str) -> bool:
        """
        删除题目

        Args:
            question_id: 题目ID

        Returns:
            是否删除成功
        """
        result = await self.db.execute(
            delete(Question).where(Question.id == uuid.UUID(question_id))
        )
        await self.db.commit()

        return result.rowcount > 0

