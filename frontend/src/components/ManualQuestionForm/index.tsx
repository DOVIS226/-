import { useState } from 'react'
import { QuestionFormData } from '../../types'

interface ManualQuestionFormProps {
  onSave: (question: QuestionFormData) => void
  onCancel: () => void
}

const ManualQuestionForm = ({ onSave, onCancel }: ManualQuestionFormProps) => {
  const [questionType, setQuestionType] = useState<'single_choice' | 'fill_blank' | 'essay'>('single_choice')
  const [questionText, setQuestionText] = useState('')
  const [score, setScore] = useState(10)
  
  // 选择题相关状态
  const [options, setOptions] = useState<Array<{ key: string; value: string; isCorrect: boolean }>>([
    { key: 'A', value: '', isCorrect: false },
    { key: 'B', value: '', isCorrect: false },
    { key: 'C', value: '', isCorrect: false },
    { key: 'D', value: '', isCorrect: false },
  ])
  
  // 填空题相关状态
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([''])
  
  // 问答题相关状态
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [minWordCount, setMinWordCount] = useState<number>(100)
  const [gradingCriteria, setGradingCriteria] = useState({
    totalScore: 10,
    scoreDistribution: [
      { item: '内容完整性', score: 4, description: '' },
      { item: '逻辑清晰度', score: 3, description: '' },
      { item: '语言表达', score: 3, description: '' },
    ],
    keywords: [] as string[],
    requirements: [] as string[],
  })
  const [newKeyword, setNewKeyword] = useState('')
  const [newRequirement, setNewRequirement] = useState('')
  
  const [answerExplanation, setAnswerExplanation] = useState('')

  const handleAddOption = () => {
    const nextKey = String.fromCharCode(65 + options.length) // A, B, C, D, E...
    setOptions([...options, { key: nextKey, value: '', isCorrect: false }])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, field: 'value' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options]
    if (field === 'isCorrect') {
      // 单选题只能有一个正确答案
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index ? value as boolean : false
      })
    } else {
      newOptions[index][field] = value as string
    }
    setOptions(newOptions)
  }

  const handleAddBlank = () => {
    setCorrectAnswers([...correctAnswers, ''])
  }

  const handleRemoveBlank = (index: number) => {
    if (correctAnswers.length > 1) {
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setReferenceFiles([...referenceFiles, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setReferenceFiles(referenceFiles.filter((_, i) => i !== index))
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setGradingCriteria({
        ...gradingCriteria,
        keywords: [...gradingCriteria.keywords, newKeyword.trim()],
      })
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setGradingCriteria({
      ...gradingCriteria,
      keywords: gradingCriteria.keywords.filter((_, i) => i !== index),
    })
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setGradingCriteria({
        ...gradingCriteria,
        requirements: [...gradingCriteria.requirements, newRequirement.trim()],
      })
      setNewRequirement('')
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setGradingCriteria({
      ...gradingCriteria,
      requirements: gradingCriteria.requirements.filter((_, i) => i !== index),
    })
  }

  const handleAddScoreItem = () => {
    setGradingCriteria({
      ...gradingCriteria,
      scoreDistribution: [
        ...gradingCriteria.scoreDistribution,
        { item: '', score: 0, description: '' },
      ],
    })
  }

  const handleScoreItemChange = (index: number, field: string, value: string | number) => {
    const newDistribution = [...gradingCriteria.scoreDistribution]
    newDistribution[index] = { ...newDistribution[index], [field]: value }
    setGradingCriteria({
      ...gradingCriteria,
      scoreDistribution: newDistribution,
    })
  }

  const handleRemoveScoreItem = (index: number) => {
    if (gradingCriteria.scoreDistribution.length > 1) {
      setGradingCriteria({
        ...gradingCriteria,
        scoreDistribution: gradingCriteria.scoreDistribution.filter((_, i) => i !== index),
      })
    }
  }

  const handleSubmit = () => {
    // 验证必填字段
    if (!questionText.trim()) {
      alert('请输入题目内容')
      return
    }

    if (questionType === 'single_choice') {
      if (options.length < 2) {
        alert('选择题至少需要2个选项')
        return
      }
      if (options.some(opt => !opt.value.trim())) {
        alert('请填写所有选项内容')
        return
      }
      if (!options.some(opt => opt.isCorrect)) {
        alert('请选择正确答案')
        return
      }
    }

    if (questionType === 'fill_blank') {
      if (correctAnswers.some(ans => !ans.trim())) {
        alert('请填写所有空格的答案')
        return
      }
    }

    if (questionType === 'essay') {
      if (gradingCriteria.scoreDistribution.some(item => !item.item.trim() || item.score <= 0)) {
        alert('请完善评分标准')
        return
      }
    }

    const questionData: QuestionFormData = {
      questionType,
      questionText: questionText.trim(),
      score,
      answerExplanation: answerExplanation.trim() || undefined,
    }

    if (questionType === 'single_choice') {
      questionData.options = options
    }

    if (questionType === 'fill_blank') {
      questionData.correctAnswers = correctAnswers
    }

    if (questionType === 'essay') {
      questionData.referenceFiles = referenceFiles.length > 0 ? referenceFiles : undefined
      questionData.minWordCount = minWordCount
      questionData.gradingCriteria = gradingCriteria
    }

    onSave(questionData)
  }

  return (
    <div className="space-y-6">
      {/* 题目类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          题目类型 <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setQuestionType('single_choice')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              questionType === 'single_choice'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            选择题
          </button>
          <button
            type="button"
            onClick={() => setQuestionType('fill_blank')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              questionType === 'fill_blank'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            填空题
          </button>
          <button
            type="button"
            onClick={() => setQuestionType('essay')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              questionType === 'essay'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            问答题
          </button>
        </div>
      </div>

      {/* 题目内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          题目内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="请输入题目内容..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] resize-none"
          rows={4}
        />
      </div>

      {/* 分值 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分值 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          min="1"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 选择题选项 */}
      {questionType === 'single_choice' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              选项 <span className="text-red-500">*</span>（至少2个，至少选择1个正确答案）
            </label>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + 添加选项
            </button>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="w-8 text-center font-medium text-gray-600">{option.key}</span>
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                  placeholder={`选项 ${option.key} 的内容`}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">正确答案</span>
                </label>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 填空题答案 */}
      {questionType === 'fill_blank' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              答案 <span className="text-red-500">*</span>（多个空格请添加多个答案）
            </label>
            <button
              type="button"
              onClick={handleAddBlank}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + 添加答案
            </button>
          </div>
          <div className="space-y-3">
            {correctAnswers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="w-12 text-sm text-gray-600">空格 {index + 1}:</span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    const newAnswers = [...correctAnswers]
                    newAnswers[index] = e.target.value
                    setCorrectAnswers(newAnswers)
                  }}
                  placeholder={`空格 ${index + 1} 的答案`}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {correctAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlank(index)}
                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 问答题专用设置 */}
      {questionType === 'essay' && (
        <>
          {/* 参考材料上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              参考材料（图片或文件）
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="reference-files"
              />
              <label htmlFor="reference-files" className="cursor-pointer">
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">📎</div>
                  <p className="text-gray-600 mb-1">点击上传或拖拽文件</p>
                  <p className="text-sm text-gray-400">支持图片、PDF、Word文档</p>
                </div>
              </label>
              {referenceFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {referenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 最小字数限制 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最小作答字数限制
            </label>
            <input
              type="number"
              value={minWordCount}
              onChange={(e) => setMinWordCount(Number(e.target.value))}
              min="0"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">学生作答时系统会提示最少字数要求</p>
          </div>

          {/* 评分标准 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                评分标准 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddScoreItem}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + 添加评分项
              </button>
            </div>
            <div className="space-y-3">
              {gradingCriteria.scoreDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => handleScoreItemChange(index, 'item', e.target.value)}
                    placeholder="评分项名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={item.score}
                    onChange={(e) => handleScoreItemChange(index, 'score', Number(e.target.value))}
                    min="0"
                    placeholder="分值"
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {gradingCriteria.scoreDistribution.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveScoreItem(index)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              总分：{gradingCriteria.scoreDistribution.reduce((sum, item) => sum + item.score, 0)} 分
            </p>
          </div>

          {/* 关键词要求 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词要求
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="输入关键词后按回车添加"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加
              </button>
            </div>
            {gradingCriteria.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gradingCriteria.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 其他要求 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              其他要求
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                placeholder="输入要求后按回车添加"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加
              </button>
            </div>
            {gradingCriteria.requirements.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {gradingCriteria.requirements.map((req, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* 答案解析 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          答案解析（可选）
        </label>
        <textarea
          value={answerExplanation}
          onChange={(e) => setAnswerExplanation(e.target.value)}
          placeholder="输入题目的答案解析..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            // 重置表单
            setQuestionType('single_choice')
            setQuestionText('')
            setScore(10)
            setOptions([
              { key: 'A', value: '', isCorrect: false },
              { key: 'B', value: '', isCorrect: false },
              { key: 'C', value: '', isCorrect: false },
              { key: 'D', value: '', isCorrect: false },
            ])
            setCorrectAnswers([''])
            setReferenceFiles([])
            setMinWordCount(100)
            setGradingCriteria({
              totalScore: 10,
              scoreDistribution: [
                { item: '内容完整性', score: 4, description: '' },
                { item: '逻辑清晰度', score: 3, description: '' },
                { item: '语言表达', score: 3, description: '' },
              ],
              keywords: [],
              requirements: [],
            })
            setAnswerExplanation('')
            onCancel()
          }}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          保存题目
        </button>
      </div>
    </div>
  )
}

export default ManualQuestionForm
