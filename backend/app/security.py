from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .supabase_client import supabase

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

def get_current_admin(user = Depends(get_current_user)):
    """
    Checks if the authenticated user is an Admin.
    For now, we check if the email matches the hardcoded admin email.
    TODO: Move this to a DB column or Env Var later.
    """
    # REPLACE THIS WITH YOUR ACTUAL ADMIN EMAIL IN PRODUCTION
    import os
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com") 
    
    if user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    return user
