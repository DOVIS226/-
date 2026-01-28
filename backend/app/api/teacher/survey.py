from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.question import (
    QuestionCreate,
    QuestionResponse,
    QuestionBatchCreate,
    QuestionBatchResponse
)
from app.services.question_service import QuestionService

router = APIRouter()

# 模型定义
class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[Dict[str, Any]]

class SurveyInfo(BaseModel):
    id: str
    title: str
    status: str
    responses: int
    total: int

class SurveyResults(BaseModel):
    survey_id: str
    title: str
    total_responses: int
    results: Dict[str, Any]

@router.get("", response_model=List[SurveyInfo])
async def get_surveys():
    """
    获取教师创建的所有问卷
    """
    # TODO: 从数据库获取问卷列表
    return [
        SurveyInfo(
            id="1",
            title="课程反馈调查",
            status="active",
            responses=45,
            total=128
        ),
        SurveyInfo(
            id="2",
            title="期中测评",
            status="closed",
            responses=120,
            total=128
        )
    ]

@router.post("", response_model=SurveyInfo)
async def create_survey(survey: SurveyCreate):
    """
    创建新问卷
    """
    # TODO: 保存到数据库
    return SurveyInfo(
        id="new_001",
        title=survey.title,
        status="draft",
        responses=0,
        total=0
    )

@router.get("/{survey_id}/results", response_model=SurveyResults)
async def get_survey_results(survey_id: str):
    """
    获取问卷统计结果
    """
    # TODO: 从数据库统计结果
    return SurveyResults(
        survey_id=survey_id,
        title="课程反馈调查",
        total_responses=45,
        results={
            "q1": {
                "非常满意": 20,
                "满意": 15,
                "一般": 8,
                "不满意": 2
            }
        }
    )


# ============ 题目管理相关接口 ============

@router.post("/questions", response_model=QuestionResponse)
async def create_question(
    question: QuestionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    手动创建单个题目（不关联问卷）
    用于题库管理，后续可以添加到问卷中
    """
    question_service = QuestionService(db)
    try:
        created_question = await question_service.create_question(question)
        return created_question
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建题目失败: {str(e)}")


@router.post("/{survey_id}/questions", response_model=QuestionResponse)
async def add_question_to_survey(
    survey_id: str,
    question: QuestionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    向指定问卷添加题目
    """
    question_service = QuestionService(db)
    try:
        created_question = await question_service.create_question(
            question,
            survey_id=survey_id
        )
        return created_question
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加题目失败: {str(e)}")


@router.post("/{survey_id}/questions/batch", response_model=QuestionBatchResponse)
async def add_questions_batch(
    survey_id: str,
    questions: List[QuestionCreate],
    db: AsyncSession = Depends(get_db)
):
    """
    批量向问卷添加题目
    """
    question_service = QuestionService(db)
    try:
        result = await question_service.create_questions_batch(
            survey_id=survey_id,
            questions=questions
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量添加题目失败: {str(e)}")


@router.get("/{survey_id}/questions", response_model=List[QuestionResponse])
async def get_survey_questions(
    survey_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取问卷的所有题目
    """
    question_service = QuestionService(db)
    try:
        questions = await question_service.get_questions_by_survey(survey_id)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取题目列表失败: {str(e)}")


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    删除题目
    """
    question_service = QuestionService(db)
    try:
        success = await question_service.delete_question(question_id)
        if not success:
            raise HTTPException(status_code=404, detail="题目不存在")
        return {"success": True, "message": "题目删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除题目失败: {str(e)}")

