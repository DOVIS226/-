import { useState } from 'react'
import QuestionEditor from '../../../components/QuestionEditor'
import { questionApi } from '../../../services'

type CreateMode = 'manual' | 'ai' | 'knowledge' | null
type SurveyStatus = 'draft' | 'published'

interface Survey {
  id: string
  title: string
  description: string
  questionCount: number
  status: SurveyStatus
  createdAt: string
  publishedAt?: string
}

const TeacherSurvey = () => {
  const [createMode, setCreateMode] = useState<CreateMode>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQuestionEditor, setShowQuestionEditor] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<any[]>([])

  // 模拟问卷列表
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: '数据结构期中测验',
      description: '栈、队列、树的基础知识',
      questionCount: 20,
      status: 'published',
      createdAt: '2026-01-20',
      publishedAt: '2026-01-21'
    },
    {
      id: '2',
      title: '算法分析问卷',
      description: '时间复杂度与空间复杂度分析',
      questionCount: 15,
      status: 'draft',
      createdAt: '2026-01-25'
    },
  ])

  const creationModes = [
    {
      id: 'manual' as CreateMode,
      title: '手动上传',
      description: '手动添加题目或上传Word文档自动识别',
      icon: '📝',
      color: 'blue',
    },
    {
      id: 'ai' as CreateMode,
      title: 'AI生成',
      description: '给出描述，AI自动生成问卷',
      icon: '🤖',
      color: 'purple',
    },
    {
      id: 'knowledge' as CreateMode,
      title: '基于知识库',
      description: '描述需求，AI基于知识库生成问卷',
      icon: '📚',
      color: 'green',
    },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      alert(`文件已选择: ${file.name}`)
    }
  }

  // 打开题目编辑器
  const handleOpenQuestionEditor = () => {
    setShowQuestionEditor(true)
  }

  // 保存题目
  const handleSaveQuestion = async (questionData: any) => {
    try {
      // 调用后端 API 创建题目
      const result = await questionApi.createQuestion(questionData)

      // 添加到本地题目列表
      setQuestions([...questions, result])

      // 关闭编辑器
      setShowQuestionEditor(false)

      alert('题目添加成功！')
    } catch (error) {
      console.error('添加题目失败:', error)
      alert('添加题目失败，请重试')
    }
  }

  // 删除题目
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('确定要删除这道题目吗？')) {
      return
    }

    try {
      await questionApi.deleteQuestion(questionId)
      setQuestions(questions.filter(q => q.id !== questionId))
      alert('题目删除成功！')
    } catch (error) {
      console.error('删除题目失败:', error)
      alert('删除题目失败，请重试')
    }
  }

  const handleGenerate = () => {
    if (createMode === 'ai' || createMode === 'knowledge') {
      if (!aiDescription.trim()) {
        alert('请输入描述')
        return
      }
      alert(`正在使用${createMode === 'ai' ? 'AI' : 'AI+知识库'}生成问卷...\n描述: ${aiDescription}`)
    } else if (createMode === 'manual') {
      if (!uploadedFile && questions.length === 0) {
        alert('请上传文件或手动添加题目')
        return
      }
      alert(`已添加 ${questions.length} 道题目`)
    }
    setShowCreateModal(false)
    setCreateMode(null)
    setAiDescription('')
    setUploadedFile(null)
  }

  const handlePublish = (surveyId: string) => {
    setSurveys(surveys.map(s => 
      s.id === surveyId 
        ? { ...s, status: 'published', publishedAt: new Date().toISOString().split('T')[0] }
        : s
    ))
  }

  const handleUnpublish = (surveyId: string) => {
    setSurveys(surveys.map(s => 
      s.id === surveyId 
        ? { ...s, status: 'draft', publishedAt: undefined }
        : s
    ))
  }

  const handleDelete = (surveyId: string) => {
    if (confirm('确定要删除这个问卷吗？')) {
      setSurveys(surveys.filter(s => s.id !== surveyId))
    }
  }

  return (
    <div className="h-full bg-gray-50">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">问卷管理</h2>
            <p className="text-sm text-gray-500 mt-1">创建、编辑和发布问卷</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <span>🎯</span>
            <span>出题助手</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 出题方式选择卡片 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">创建新问卷</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creationModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => {
                    setCreateMode(mode.id)
                    setShowCreateModal(true)
                  }}
                  className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                    mode.color === 'blue'
                      ? 'border-blue-200 hover:border-blue-400'
                      : mode.color === 'purple'
                      ? 'border-purple-200 hover:border-purple-400'
                      : 'border-green-200 hover:border-green-400'
                  }`}
                >
                  <div className="text-4xl mb-3">{mode.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{mode.title}</h3>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 问卷列表 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">我的问卷</h3>
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-800">{survey.title}</h4>
                        {survey.status === 'published' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✅ 已发布
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            📝 草稿
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">📋</span>
                          {survey.questionCount} 道题目
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">📅</span>
                          创建于 {survey.createdAt}
                        </span>
                        {survey.publishedAt && (
                          <span className="flex items-center">
                            <span className="mr-1">🚀</span>
                            发布于 {survey.publishedAt}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {survey.status === 'draft' ? (
                        <button
                          onClick={() => handlePublish(survey.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          🚀 发布问卷
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpublish(survey.id)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                        >
                          📥 取消发布
                        </button>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                        ✏️ 编辑
                      </button>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                        📊 查看统计
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">💡 出题功能说明</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>手动上传:</strong> 支持手动添加题目或上传Word文档，系统自动识别题目格式</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>AI生成:</strong> 输入题目要求描述，AI智能生成相关试题</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>基于知识库:</strong> 结合课程知识库，生成符合教学大纲的高质量题目</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>发布管理:</strong> 创建的问卷为草稿状态，点击"发布"后学生才能看到</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 创建问卷模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  {createMode === 'manual' && '📝 手动创建问卷'}
                  {createMode === 'ai' && '🤖 AI生成问卷'}
                  {createMode === 'knowledge' && '📚 基于知识库生成'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateMode(null)
                    setAiDescription('')
                    setUploadedFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {createMode === 'manual' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      上传Word文档
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-gray-600 mb-1">点击上传或拖拽文件</p>
                        <p className="text-sm text-gray-400">支持 .doc, .docx 格式</p>
                        {uploadedFile && (
                          <p className="mt-2 text-blue-600 font-medium">{uploadedFile.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="text-center text-gray-400">或</div>
                  <button
                    onClick={handleOpenQuestionEditor}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    手动添加题目
                  </button>

                  {/* 已添加的题目列表 */}
                  {questions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        已添加题目 ({questions.length})
                      </h3>
                      <div className="space-y-2">
                        {questions.map((question, index) => (
                          <div
                            key={question.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {index + 1}. {question.question_text}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({question.question_type === 'single_choice' ? '单选' :
                                  question.question_type === 'multiple_choice' ? '多选' : '填空'})
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="ml-3 text-red-600 hover:text-red-700 text-sm"
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 题目编辑器弹窗 */}
                  {showQuestionEditor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                          <h3 className="text-xl font-bold text-gray-900">添加题目</h3>
                        </div>
                        <div className="p-6">
                          <QuestionEditor
                            onSave={handleSaveQuestion}
                            onCancel={() => setShowQuestionEditor(false)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {createMode === 'ai' ? 'AI生成描述' : '基于知识库生成描述'}
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder={
                      createMode === 'ai'
                        ? '例如：生成一份关于数据结构中栈和队列的测验，包含10道选择题和5道简答题...'
                        : '例如：根据知识库中的数据结构课程资料，生成一份涵盖第三章内容的测验...'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[200px] resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {createMode === 'knowledge' && '💡 AI将从您上传的课程资料中提取相关知识点'}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateMode(null)
                  setAiDescription('')
                  setUploadedFile(null)
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                {createMode === 'manual' ? '开始识别' : '生成问卷'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSurvey
