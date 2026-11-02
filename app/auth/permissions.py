
from fastapi import Depends
from app.dependencies.auth import get_current_user


def admin_required(current_user=Depends(get_current_user)):
    return current_user


def developer_required(current_user=Depends(get_current_user)):
    return current_user


def viewer_required(current_user=Depends(get_current_user)):
    return current_user
