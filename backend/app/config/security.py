from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError

from app.config.settings import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30


def create_access_token(data: dict, expired_time: timedelta = None):
    to_encode = data.copy()
    to_encode.setdefault("type", "access")
    expire = datetime.now(timezone.utc) + (expired_time if expired_time
                                           else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def create_refresh_token(user_id: int):
    return create_access_token({
        "sub": str(user_id),
        "type": "refresh"
    }, expired_time=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_secret(secret: str) -> str:
    return pwd_context.hash(secret)


def verify_secret(secret: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(secret, hashed)
    except Exception:
        return False