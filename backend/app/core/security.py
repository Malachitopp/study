from passlib.context import CryptContext 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated = "auto")

def hash_password(password: str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password:str, hash_password:str) -> bool:
    return pwd_context.verify(plain_password, hash_password)


from datetime import datetime, timedelta, timezone, UTC
from jose import jwt, JWTError
from app.config import settings 

def create_access_token(data:dict) -> str:
    to_encode = data.copy() 
    expire = datetime.now(timezone.utc) + timedelta(minutes = settings.access_token_expire_minutes)
    to_encode.update({"exp":expire}) 
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def decode_access_token(token: str)->dict|None:
    try:
        return jwt.decode(token,settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None 




