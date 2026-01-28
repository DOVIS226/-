import React, { useState } from 'react'

interface QuestionOption {
  key: string
  value: string
}

interface QuestionEditorProps {
  onSave: (questionData: any) => void
  onCancel: () => void
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ onSave, onCancel }) => {
  const [questionType, setQuestionType] = useState<string>('single_choice')
  const [questionText, setQuestionText] = useState<string>('')
  const [score, setScore] = useState<number>(5)
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [options, setOptions] = useState<QuestionOption[]>([
    { key: 'A', value: '' },
    { key: 'B', value: '' },
  ])
  const [correctAnswer, setCorrectAnswer] = useState<string>('')
  const [answerExplanation, setAnswerExplanation] = useState<string>('')

  const handleAddOption = () => {
    const nextKey = String.fromCharCode(65 + options.length)
    setOptions([...options, { key: nextKey, value: '' }])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].value = value
    setOptions(newOptions)
  }

  const handleSubmit = () => {
    // 验证
    if (!questionText.trim()) {
      alert('请输入题目内容')
      return
    }

    if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      if (options.some(opt => !opt.value.trim())) {
        alert('请填写所有选项')
        return
      }
      if (!correctAnswer) {
        alert('请选择正确答案')
        return
      }
    }

    if (questionType === 'short_answer' && !correctAnswer) {
      alert('请输入正确答案')
      return
    }

    // 构建题目数据
    const questionData: any = {
      question_type: questionType,
      question_text: questionText,
      score: score,
      difficulty: difficulty,
      is_required: true,
    }

    // 添加选项（仅选择题）
    if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      questionData.options = options.map(opt => ({
        key: opt.key,
        value: opt.value,
      }))
    }

    // 添加正确答案
    if (questionType === 'multiple_choice') {
      questionData.correct_answer = correctAnswer.split(',').map(s => s.trim())
    } else {
      questionData.correct_answer = correctAnswer
    }

    // 添加答案解析
    if (answerExplanation.trim()) {
      questionData.answer_explanation = answerExplanation
    }

    onSave(questionData)
  }

  return (
    <div className="space-y-6">
      {/* 题目类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          题目类型
        </label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="single_choice">单选题</option>
          <option value="multiple_choice">多选题</option>
          <option value="short_answer">填空题</option>
        </select>
      </div>

      {/* 题目内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          题目内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="请输入题目内容"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 选项（仅选择题显示） */}
      {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选项 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded-lg font-medium">
                  {option.key}
                </span>
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`选项 ${option.key}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            + 添加选项
          </button>
        </div>
      )}

      {/* 正确答案 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          正确答案 <span className="text-red-500">*</span>
        </label>
        {questionType === 'single_choice' && (
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择正确答案</option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.key}. {option.value || '(未填写)'}
              </option>
            ))}
          </select>
        )}
        {questionType === 'multiple_choice' && (
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="多个答案用逗号分隔，如：A,B,D"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
        {questionType === 'short_answer' && (
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="请输入正确答案"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* 分值和难度 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分值
          </label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>

      {/* 答案解析 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          答案解析（可选）
        </label>
        <textarea
          value={answerExplanation}
          onChange={(e) => setAnswerExplanation(e.target.value)}
          placeholder="请输入答案解析"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存题目
        </button>
      </div>
    </div>
  )
}

export default QuestionEditor
