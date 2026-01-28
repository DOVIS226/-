-- 迁移脚本：将 questions 表的 survey_id 字段改为可空
-- 这样可以支持独立的题库管理功能

-- 修改 survey_id 字段为可空
ALTER TABLE questions
ALTER COLUMN survey_id DROP NOT NULL;

-- 添加注释说明
COMMENT ON COLUMN questions.survey_id IS '问卷ID（可为空，用于题库管理）';
