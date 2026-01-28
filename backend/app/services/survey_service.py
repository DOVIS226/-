from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.survey import Survey, Question, SurveyResponse
import uuid

class SurveyService:
    """问卷服务"""
    
    def create_survey(
        self, 
        db: Session,
        teacher_id: str, 
        title: str, 
        description: Optional[str],
        questions: List[Dict],
        status: str = 'draft'
    ) -> Dict[str, Any]:
        """
        创建问卷（真实数据库操作）
        """
        try:
            # 计算总分
            total_score = sum(float(q.get('score', 0)) for q in questions)
            
            # 创建问卷记录
            survey = Survey(
                id=uuid.uuid4(),
                title=title,
                description=description,
                teacher_id=uuid.UUID(teacher_id) if isinstance(teacher_id, str) else teacher_id,
                survey_type='questionnaire',
                generation_method='manual',
                status=status,
                total_score=int(total_score),
                pass_score=int(total_score * 0.6),  # 默认及格分为60%
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(survey)
            db.flush()  # 获取 survey.id
            
            # 创建题目记录
            question_objects = []
            for idx, q_data in enumerate(questions):
                question = Question(
                    id=uuid.uuid4(),
                    survey_id=survey.id,
                    question_type=q_data.get('questionType', q_data.get('question_type', 'choice')),
                    question_text=q_data.get('questionText', q_data.get('question_text', '')),
                    question_order=q_data.get('questionOrder', q_data.get('question_order', idx + 1)),
                    score=float(q_data.get('score', 0)),
                    difficulty=q_data.get('difficulty', 'medium'),
                    options=q_data.get('options'),  # JSONB 字段直接存储字典
                    correct_answer=q_data.get('correctAnswer'),  # JSONB 字段直接存储字典
                    answer_explanation=q_data.get('answerExplanation', q_data.get('answer_explanation')),
                    reference_files=q_data.get('referenceFiles', []),  # JSONB 字段直接存储列表
                    min_word_count=q_data.get('minWordCount', q_data.get('min_word_count')),
                    grading_criteria=q_data.get('gradingCriteria'),  # JSONB 字段直接存储字典
                    is_required=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(question)
                question_objects.append(question)
            
            db.commit()
            db.refresh(survey)
            
            # 返回结果
            return {
                'id': str(survey.id),
                'title': survey.title,
                'description': survey.description,
                'teacher_id': str(survey.teacher_id),
                'status': survey.status,
                'total_score': survey.total_score,
                'questions': [
                    {
                        'id': str(q.id),
                        'question_type': q.question_type,
                        'question_text': q.question_text,
                        'question_order': q.question_order,
                        'score': float(q.score),
                    }
                    for q in question_objects
                ],
                'created_at': survey.created_at.isoformat(),
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"创建问卷失败: {str(e)}")
    
    def publish_survey(self, db: Session, survey_id: str) -> Dict[str, Any]:
        """
        发布问卷（真实数据库操作）
        """
        try:
            survey = db.query(Survey).filter(Survey.id == uuid.UUID(survey_id)).first()
            if not survey:
                raise Exception(f"问卷 {survey_id} 不存在")
            
            survey.status = 'published'
            survey.published_at = datetime.utcnow()
            survey.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(survey)
            
            return {
                'id': str(survey.id),
                'status': survey.status,
                'published_at': survey.published_at.isoformat() if survey.published_at else None,
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"发布问卷失败: {str(e)}")
    
    def unpublish_survey(self, db: Session, survey_id: str) -> Dict[str, Any]:
        """
        取消发布问卷（真实数据库操作）
        """
        try:
            survey = db.query(Survey).filter(Survey.id == uuid.UUID(survey_id)).first()
            if not survey:
                raise Exception(f"问卷 {survey_id} 不存在")
            
            survey.status = 'draft'
            survey.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(survey)
            
            return {
                'id': str(survey.id),
                'status': survey.status,
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"取消发布失败: {str(e)}")
    
    def get_surveys(self, db: Session, teacher_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取问卷列表（真实数据库查询）
        """
        try:
            query = db.query(Survey)
            if teacher_id:
                query = query.filter(Survey.teacher_id == uuid.UUID(teacher_id))
            
            surveys = query.order_by(Survey.created_at.desc()).all()
            
            result = []
            for survey in surveys:
                # 统计题目数量
                question_count = db.query(func.count(Question.id)).filter(
                    Question.survey_id == survey.id
                ).scalar() or 0
                
                result.append({
                    'id': str(survey.id),
                    'title': survey.title,
                    'description': survey.description,
                    'status': survey.status,
                    'total_score': survey.total_score,
                    'question_count': question_count,
                    'created_at': survey.created_at.isoformat() if survey.created_at else None,
                    'published_at': survey.published_at.isoformat() if survey.published_at else None,
                })
            
            return result
        except Exception as e:
            raise Exception(f"获取问卷列表失败: {str(e)}")
    
    async def get_active_surveys(self) -> List[Survey]:
        """
        获取激活的问卷
        """
        # TODO: 实现数据库查询
        pass
    
    async def submit_survey(self, survey_id: str, student_id: str, answers: Dict[str, Any]) -> SurveyResponse:
        """
        提交问卷答案
        """
        # TODO: 实现数据库操作
        pass
    
    async def get_survey_statistics(self, survey_id: str) -> Dict[str, Any]:
        """
        获取问卷统计结果
        """
        # TODO: 实现统计逻辑
        pass

survey_service = SurveyService()
