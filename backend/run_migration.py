"""
数据库迁移脚本：修改 questions 表的 survey_id 为可空
运行此脚本以应用数据库更改
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

async def run_migration():
    """执行数据库迁移"""
    # 从环境变量获取数据库连接信息
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("错误: 未找到 DATABASE_URL 环境变量")
        return

    # 解析数据库连接信息
    # postgresql://postgres:your_password@localhost:5432/education_db
    parts = database_url.replace('postgresql://', '').split('@')
    user_pass = parts[0].split(':')
    host_db = parts[1].split('/')
    host_port = host_db[0].split(':')

    user = user_pass[0]
    password = user_pass[1]
    host = host_port[0]
    port = int(host_port[1])
    database = host_db[1]

    print(f"连接到数据库: {host}:{port}/{database}")

    try:
        # 连接数据库
        conn = await asyncpg.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database=database
        )

        print("数据库连接成功")

        # 执行迁移
        print("开始执行迁移...")

        # 修改 survey_id 字段为可空
        await conn.execute("""
            ALTER TABLE questions
            ALTER COLUMN survey_id DROP NOT NULL;
        """)

        print("✓ survey_id 字段已修改为可空")

        # 添加注释
        await conn.execute("""
            COMMENT ON COLUMN questions.survey_id IS '问卷ID（可为空，用于题库管理）';
        """)

        print("✓ 已添加字段注释")

        # 关闭连接
        await conn.close()

        print("\n迁移完成！")
        print("现在可以创建不关联问卷的独立题目了。")

    except asyncpg.exceptions.PostgresError as e:
        print(f"数据库错误: {e}")
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    asyncio.run(run_migration())
