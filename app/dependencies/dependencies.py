from fastapi import Depends, HTTPException
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import decode_token
from app.database.session import async_session_local
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.repositories.user import UserRepository


security = HTTPBearer()


async def get_db():
    async with async_session_local() as session:
        yield session


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
                           db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload is None or payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type or signature")
        
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await UserRepository.get_by_id(user_id, db)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def require_role(*roles: str):
    async def dependency(current_user=Depends(get_current_user)):
        if current_user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Permission denied: insufficient permissions")
        return current_user
    return dependency