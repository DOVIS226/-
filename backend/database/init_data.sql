-- 智能教学平台数据库初始化数据脚本
-- PostgreSQL
-- 此脚本在 init.sql 执行后运行，插入初始数据

-- =====================================================
-- 检查表是否存在（如果不存在则提示）
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION '表 users 不存在！请先执行 init.sql 创建表结构。';
    END IF;
END $$;

-- =====================================================
-- 1. 插入教师账号数据
-- =====================================================

-- 注意：密码使用 bcrypt 加密，以下密码均为 "teacher123"
-- 使用 Python 的 passlib 生成：get_password_hash("teacher123")
-- 实际密码哈希值：$2b$12$HVMELNHdtNyY5EH59Y.L3O9wzTsQl2ym9X3yO9ubB9a.eUXiXfP4m

-- 插入教师1账号
INSERT INTO users (id, username, email, password_hash, role, full_name, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'teacher1',
    'teacher1@example.com',
    '$2b$12$HVMELNHdtNyY5EH59Y.L3O9wzTsQl2ym9X3yO9ubB9a.eUXiXfP4m',  -- teacher123 的 bcrypt 哈希
    'teacher',
    '张老师',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO teachers (id, user_id, teacher_number, department, title, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440011'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'T001',
    '计算机科学系',
    '副教授',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (teacher_number) DO NOTHING;

-- 插入教师2账号
INSERT INTO users (id, username, email, password_hash, role, full_name, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'teacher2',
    'teacher2@example.com',
    '$2b$12$HVMELNHdtNyY5EH59Y.L3O9wzTsQl2ym9X3yO9ubB9a.eUXiXfP4m',  -- teacher123 的 bcrypt 哈希
    'teacher',
    '李老师',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO teachers (id, user_id, teacher_number, department, title, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'T002',
    '软件工程系',
    '讲师',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (teacher_number) DO NOTHING;

-- =====================================================
-- 2. 创建示例问卷和题目
-- =====================================================

-- 插入示例问卷
INSERT INTO surveys (
    id, title, description, teacher_id, survey_type, 
    generation_method, status, total_score, pass_score,
    created_at, updated_at
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    '示例问卷 - 数据结构基础',
    '这是一个包含选择题、填空题和问答题的示例问卷',
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'questionnaire',
    'manual',
    'published',
    30,
    18,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- 插入题目1：选择题
INSERT INTO questions (
    id, survey_id, question_type, question_text, question_order,
    score, difficulty, options, correct_answer, answer_explanation,
    is_required, created_at, updated_at
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440201'::uuid,
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    'choice',
    '以下哪个数据结构是先进先出（FIFO）的？',
    1,
    10.00,
    'easy',
    '[
        {"id": "A", "text": "栈"},
        {"id": "B", "text": "队列"},
        {"id": "C", "text": "树"},
        {"id": "D", "text": "图"}
    ]'::jsonb,
    '{"value": "B", "options": ["B"]}'::jsonb,
    '队列（Queue）是一种先进先出（FIFO）的数据结构，最先进入的元素会最先被取出。',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- 插入题目2：填空题
INSERT INTO questions (
    id, survey_id, question_type, question_text, question_order,
    score, difficulty, correct_answer, answer_explanation,
    is_required, created_at, updated_at
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440202'::uuid,
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    'fill',
    '二叉树的遍历方式有前序遍历、中序遍历和______遍历。',
    2,
    10.00,
    'medium',
    '{"value": "后序", "alternatives": ["后序", "后序遍历"]}'::jsonb,
    '二叉树有三种遍历方式：前序遍历（根-左-右）、中序遍历（左-根-右）和后序遍历（左-右-根）。',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- 插入题目3：问答题
INSERT INTO questions (
    id, survey_id, question_type, question_text, question_order,
    score, difficulty, answer_explanation,
    reference_files, min_word_count, grading_criteria,
    is_required, created_at, updated_at
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440203'::uuid,
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    'essay',
    '请简述栈和队列的区别，并各举一个实际应用场景。',
    3,
    10.00,
    'hard',
    '栈和队列是两种不同的线性数据结构。栈是后进先出（LIFO），队列是先进先出（FIFO）。',
    '[]'::jsonb,
    100,
    '{
        "keywords": ["栈", "队列", "LIFO", "FIFO", "区别", "应用"],
        "requirements": [
            "必须说明栈和队列的基本区别",
            "必须各举一个实际应用场景",
            "字数不少于100字"
        ],
        "scoring": {
            "基本区别说明": 4,
            "栈的应用场景": 3,
            "队列的应用场景": 3
        }
    }'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 完成
-- =====================================================
SELECT '数据初始化完成！' AS message;
SELECT '教师账号: teacher1/teacher123, teacher2/teacher123' AS login_info;
SELECT '示例问卷ID: 550e8400-e29b-41d4-a716-446655440100' AS survey_id;
