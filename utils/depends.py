from fastapi import HTTPException, Request

from conf import SESSION_DB


def get_auth_user(request: Request):
    """убедитесь, что у пользователя есть действительный сеанс"""

    session_id = request.cookies.get("Authorization")
    if not session_id or session_id not in SESSION_DB:
        raise HTTPException(status_code=401, detail="Not authorized")
    return True
