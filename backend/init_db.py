"""
数据库初始化脚本
创建所有数据表
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.config.settings import settings
from app.database import Base

# 导入所有模型以确保它们被注册到Base
from app.models import user, survey, qa

async def init_database():
    """初始化数据库，创建所有表"""
    print("Starting database initialization...")

    # 创建异步引擎
    engine = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        echo=True,
        future=True
    )

    try:
        # 创建所有表
        async with engine.begin() as conn:
            # 创建所有表
            await conn.run_sync(Base.metadata.create_all)

        print("Database initialization successful!")

    except Exception as e:
        print(f"Database initialization failed: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())
