import apiClient from './api'
import { SurveyCreateFormData } from '../types'

// 学生端 - 智能问答相关API
export const qaApi = {
  // 提交问题
  askQuestion: async (question: string) => {
    return apiClient.post('/student/qa/ask', { question })
  },
  
  // 获取历史记录
  getHistory: async () => {
    return apiClient.get('/student/qa/history')
  },
}

// 学生端 - 问卷相关API
export const studentSurveyApi = {
  // 获取问卷列表
  getSurveys: async () => {
    return apiClient.get('/student/surveys')
  },
  
  // 获取问卷详情
  getSurveyDetail: async (surveyId: string) => {
    return apiClient.get(`/student/surveys/${surveyId}`)
  },
  
  // 提交问卷
  submitSurvey: async (surveyId: string, answers: Record<string, any>) => {
    return apiClient.post(`/student/surveys/${surveyId}/submit`, { answers })
  },
}

// 教师端 - 看板相关API
export const dashboardApi = {
  // 获取统计数据
  getStats: async () => {
    return apiClient.get('/teacher/dashboard/stats')
  },
  
  // 获取最近问题
  getRecentQuestions: async () => {
    return apiClient.get('/teacher/dashboard/recent-questions')
  },
}

// 教师端 - 问卷管理API
export const teacherSurveyApi = {
  // 获取问卷列表
  getSurveys: async () => {
    return apiClient.get('/teacher/surveys')
  },
  
  // 创建问卷（包含题目）
  createSurvey: async (surveyData: SurveyCreateFormData) => {
    return apiClient.post('/teacher/surveys', surveyData)
  },
  
  // 发布问卷
  publishSurvey: async (surveyId: string) => {
    return apiClient.post(`/teacher/surveys/${surveyId}/publish`)
  },
  
  // 取消发布问卷
  unpublishSurvey: async (surveyId: string) => {
    return apiClient.post(`/teacher/surveys/${surveyId}/unpublish`)
  },
  
  // 获取问卷结果
  getSurveyResults: async (surveyId: string) => {
    return apiClient.get(`/teacher/surveys/${surveyId}/results`)
  },
  
  // 上传文件（用于问答题参考材料）
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/teacher/surveys/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// 教师端 - 题目管理API
export const questionApi = {
  // 创建单个题目（不关联问卷）
  createQuestion: async (questionData: any) => {
    return apiClient.post('/teacher/surveys/questions', questionData)
  },

  // 向问卷添加题目
  addQuestionToSurvey: async (surveyId: string, questionData: any) => {
    return apiClient.post(`/teacher/surveys/${surveyId}/questions`, questionData)
  },

  // 批量添加题目
  addQuestionsBatch: async (surveyId: string, questions: any[]) => {
    return apiClient.post(`/teacher/surveys/${surveyId}/questions/batch`, questions)
  },

  // 获取问卷题目列表
  getSurveyQuestions: async (surveyId: string) => {
    return apiClient.get(`/teacher/surveys/${surveyId}/questions`)
  },

  // 删除题目
  deleteQuestion: async (questionId: string) => {
    return apiClient.delete(`/teacher/surveys/questions/${questionId}`)
  },
}
