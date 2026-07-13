from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user

def admin_required(current_user=Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def developer_required(current_user=Depends(get_current_user)):
    if current_user.role not in ["Admin", "Developer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Developer access required"
        )
    return current_user


def viewer_required(current_user=Depends(get_current_user)):
    return current_user