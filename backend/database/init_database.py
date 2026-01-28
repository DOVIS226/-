#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建数据库表结构和插入初始数据
"""
import sys
from pathlib import Path
import psycopg2
from psycopg2 import sql

# 添加项目路径
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.settings import settings
from app.utils.auth import get_password_hash

def init_database():
    """初始化数据库"""
    try:
        # 连接数据库
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME
        )
        conn.autocommit = False
        cur = conn.cursor()
        
        print("✅ 数据库连接成功")
        
        # 1. 执行表结构初始化
        print("\n📋 执行表结构初始化...")
        init_sql_path = backend_dir / "database" / "init.sql"
        if init_sql_path.exists():
            with open(init_sql_path, 'r', encoding='utf-8') as f:
                init_sql = f.read()
            cur.execute(init_sql)
            conn.commit()
            print("✅ 表结构创建完成")
        else:
            print(f"❌ 未找到 init.sql 文件: {init_sql_path}")
            return False
        
        # 2. 插入初始数据
        print("\n📝 插入初始数据...")
        
        # 生成密码哈希
        password_hash = get_password_hash("teacher123")
        
        # 插入教师1
        cur.execute("""
            INSERT INTO users (id, username, email, password_hash, role, full_name, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (username) DO NOTHING
            RETURNING id;
        """, (
            '550e8400-e29b-41d4-a716-446655440001',
            'teacher1',
            'teacher1@example.com',
            password_hash,
            'teacher',
            '张老师',
            True
        ))
        result = cur.fetchone()
        if result:
            teacher1_user_id = result[0]
            print(f"✅ 教师1账号创建成功: {teacher1_user_id}")
        else:
            cur.execute("SELECT id FROM users WHERE username = 'teacher1'")
            teacher1_user_id = cur.fetchone()[0]
            print(f"ℹ️  教师1账号已存在: {teacher1_user_id}")
        
        cur.execute("""
            INSERT INTO teachers (id, user_id, teacher_number, department, title, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (teacher_number) DO NOTHING;
        """, (
            '550e8400-e29b-41d4-a716-446655440011',
            teacher1_user_id,
            'T001',
            '计算机科学系',
            '副教授'
        ))
        
        # 插入教师2
        cur.execute("""
            INSERT INTO users (id, username, email, password_hash, role, full_name, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (username) DO NOTHING
            RETURNING id;
        """, (
            '550e8400-e29b-41d4-a716-446655440002',
            'teacher2',
            'teacher2@example.com',
            password_hash,
            'teacher',
            '李老师',
            True
        ))
        result = cur.fetchone()
        if result:
            teacher2_user_id = result[0]
            print(f"✅ 教师2账号创建成功: {teacher2_user_id}")
        else:
            cur.execute("SELECT id FROM users WHERE username = 'teacher2'")
            teacher2_user_id = cur.fetchone()[0]
            print(f"ℹ️  教师2账号已存在: {teacher2_user_id}")
        
        cur.execute("""
            INSERT INTO teachers (id, user_id, teacher_number, department, title, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (teacher_number) DO NOTHING;
        """, (
            '550e8400-e29b-41d4-a716-446655440012',
            teacher2_user_id,
            'T002',
            '软件工程系',
            '讲师'
        ))
        
        conn.commit()
        print("✅ 教师账号数据插入完成")
        
        # 3. 执行数据初始化脚本
        print("\n📚 执行数据初始化脚本...")
        init_data_sql_path = backend_dir / "database" / "init_data.sql"
        if init_data_sql_path.exists():
            with open(init_data_sql_path, 'r', encoding='utf-8') as f:
                init_data_sql = f.read()
            # 替换密码哈希
            init_data_sql = init_data_sql.replace(
                '$2b$12$HVMELNHdtNyY5EH59Y.L3O9wzTsQl2ym9X3yO9ubB9a.eUXiXfP4m',
                password_hash
            )
            cur.execute(init_data_sql)
            conn.commit()
            print("✅ 示例数据插入完成")
        else:
            print(f"⚠️  未找到 init_data.sql 文件: {init_data_sql_path}")
        
        # 验证数据
        print("\n🔍 验证数据...")
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher'")
        teacher_count = cur.fetchone()[0]
        print(f"   教师数量: {teacher_count}")
        
        cur.execute("SELECT COUNT(*) FROM questions")
        question_count = cur.fetchone()[0]
        print(f"   题目数量: {question_count}")
        
        cur.execute("SELECT COUNT(*) FROM surveys")
        survey_count = cur.fetchone()[0]
        print(f"   问卷数量: {survey_count}")
        
        cur.close()
        conn.close()
        
        print("\n✅ 数据库初始化完成！")
        print("\n📝 测试账号:")
        print("   用户名: teacher1  密码: teacher123")
        print("   用户名: teacher2  密码: teacher123")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 数据库初始化失败: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("数据库初始化脚本")
    print("=" * 50)
    success = init_database()
    sys.exit(0 if success else 1)
