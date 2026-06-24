from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config.settings import settings


engine = create_async_engine(
    url=settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)


async_session_local = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)