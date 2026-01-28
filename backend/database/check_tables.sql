-- 检查数据库表是否已创建
-- 用于验证 init.sql 是否成功执行

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'teachers', 'students', 'surveys', 'questions', 'survey_responses', 'answers') 
        THEN '✅ 必需表'
        ELSE 'ℹ️  其他表'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY 
    CASE 
        WHEN table_name IN ('users', 'teachers', 'students', 'surveys', 'questions', 'survey_responses', 'answers') 
        THEN 0 
        ELSE 1 
    END,
    table_name;

-- 检查必需的表是否存在
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY['users', 'teachers', 'students', 'surveys', 'questions', 'survey_responses', 'answers'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️  以下必需的表不存在: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE '请先执行 init.sql 创建表结构！';
    ELSE
        RAISE NOTICE '✅ 所有必需的表都已存在，可以执行 init_data.sql';
    END IF;
END $$;
