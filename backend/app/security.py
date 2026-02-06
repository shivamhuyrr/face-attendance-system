from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .supabase_client import supabase
from . import crud, database, models

# Scheme for "Bearer <token>" header
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the JWT token sent in the Authorization header.
    Returns the user object from Supabase Auth if valid.
    """
    token = credentials.credentials
    
    try:
        # Supabase-py 'get_user' verifies the token against the project
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user_response.user
        
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_db_user(
    token_user = Depends(get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Fetches the local DB user associated with the Supabase token.
    """
    if not token_user.email:
        raise HTTPException(status_code=400, detail="Token missing email")
        
    user = crud.get_user_by_email(db, email=token_user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found in local DB")
    return user

def get_current_faculty(user: models.User = Depends(get_current_db_user)):
    if user.role not in [models.UserRole.FACULTY, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty access required"
        )
    return user

def get_current_admin(user: models.User = Depends(get_current_db_user)):
    # Fallback for hardcoded admin if needed (optional)
    # But ideally rely on DB role now
    if user.role != models.UserRole.ADMIN:
        # Check env var fallback just in case migration hasn't run on the admin user
        import os
        ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
        if user.email == ADMIN_EMAIL:
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

