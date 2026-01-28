from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
from datetime import datetime
from app.services.survey_service import survey_service
from app.database import get_db
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
class QuestionCreate(BaseModel):
    questionType: str
    questionText: str
    questionOrder: int
    score: float
    options: Optional[List[Dict[str, Any]]] = None
    correctAnswer: Optional[Any] = None
    answerExplanation: Optional[str] = None
    referenceFiles: Optional[List[str]] = None
    minWordCount: Optional[int] = None
    gradingCriteria: Optional[Dict[str, Any]] = None

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]
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

class SurveyResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    created_at: str

@router.get("", response_model=List[SurveyInfo])
async def get_surveys(db: Session = Depends(get_db)):
    """
    获取教师创建的所有问卷
    """
    try:
        # TODO: 从认证信息中获取teacher_id，这里暂时使用模拟值
        teacher_id = "550e8400-e29b-41d4-a716-446655440001"  # 实际应该从JWT token中获取
        
        surveys = survey_service.get_surveys(db, teacher_id=teacher_id)
        
        # 转换为响应格式
        result = []
        for survey in surveys:
            result.append(SurveyInfo(
                id=survey['id'],
                title=survey['title'],
                status=survey['status'],
                responses=0,  # TODO: 从数据库统计实际响应数
                total=0  # TODO: 从数据库统计总学生数
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取问卷列表失败: {str(e)}")

@router.post("", response_model=SurveyResponse)
async def create_survey(survey: SurveyCreate, db: Session = Depends(get_db)):
    """
    创建新问卷（包含题目）
    """
    try:
        # TODO: 从认证信息中获取teacher_id，这里暂时使用模拟值
        teacher_id = "550e8400-e29b-41d4-a716-446655440001"  # 实际应该从JWT token中获取
        
        # 转换题目数据格式
        questions_data = []
        for q in survey.questions:
            questions_data.append({
                'questionType': q.questionType,
                'questionText': q.questionText,
                'questionOrder': q.questionOrder,
                'score': q.score,
                'options': q.options,
                'correctAnswer': q.correctAnswer,
                'answerExplanation': q.answerExplanation,
                'referenceFiles': q.referenceFiles,
                'minWordCount': q.minWordCount,
                'gradingCriteria': q.gradingCriteria,
            })
        
        # 创建问卷（使用数据库）
        result = survey_service.create_survey(
            db=db,
            teacher_id=teacher_id,
            title=survey.title,
            description=survey.description,
            questions=questions_data,
            status='draft'
        )
        
        return SurveyResponse(
            id=result['id'],
            title=result['title'],
            description=result['description'],
            status=result['status'],
            created_at=result['created_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建问卷失败: {str(e)}")

@router.post("/{survey_id}/publish")
async def publish_survey(survey_id: str, db: Session = Depends(get_db)):
    """
    发布问卷
    """
    try:
        result = survey_service.publish_survey(db=db, survey_id=survey_id)
        return {
            "code": 200,
            "message": "问卷发布成功",
            "data": {
                "id": result['id'],
                "status": result['status'],
                "published_at": result.get('published_at')
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"发布问卷失败: {str(e)}")

@router.post("/{survey_id}/unpublish")
async def unpublish_survey(survey_id: str, db: Session = Depends(get_db)):
    """
    取消发布问卷
    """
    try:
        result = survey_service.unpublish_survey(db=db, survey_id=survey_id)
        return {
            "code": 200,
            "message": "取消发布成功",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"取消发布失败: {str(e)}")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    上传文件（用于问答题参考材料）
    """
    try:
        # 创建上传目录
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        file_ext = os.path.splitext(file.filename)[1]
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        # 保存文件
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 返回文件URL（实际应该返回完整的URL）
        file_url = f"/uploads/{filename}"
        
        return {
            "code": 200,
            "message": "文件上传成功",
            "data": {
                "url": file_url,
                "filename": file.filename,
                "size": len(content)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

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

