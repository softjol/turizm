import asyncio
import sys
from sqlalchemy import update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings
from app.models.user import User, Role

async def grant_role(phone_number: str, role_name: str):
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        role_enum = Role[role_name]
        stmt = update(User).where(User.whatsapp_phone_number == phone_number).values(role=role_enum)
        result = await session.execute(stmt)
        await session.commit()
        
        if result.rowcount > 0:
            print(f"Успешно: пользователю {phone_number} выдана роль {role_name}.")
        else:
            print(f"Ошибка: пользователь с номером {phone_number} не найден.")
            
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Использование: python grant_role.py <номер_телефона> <роль>")
        print("Пример: python grant_role.py +996700123456 reception")
        sys.exit(1)
        
    phone = sys.argv[1]
    role = sys.argv[2]
    
    if role not in ["admin", "reception", "user"]:
        print("Недопустимая роль. Используйте: admin, reception или user.")
        sys.exit(1)
        
    asyncio.run(grant_role(phone, role))
