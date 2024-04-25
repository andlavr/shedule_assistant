from uuid import uuid4

import bcrypt
from fastapi import APIRouter, Request, Depends, Form
from fastapi import HTTPException, Response
from fastapi.responses import RedirectResponse

from conf import USER_NAME, PERSONAL_PASSWORD, SESSION_DB
from utils.depends import get_auth_user

router = APIRouter(tags=['auth'])


@router.post("/login")
async def create_session(username: str = Form(...), password: str = Form(...)):
    if not username == USER_NAME:
        raise HTTPException(401, "Username not found")
    if not bcrypt.checkpw(password.encode(), PERSONAL_PASSWORD.encode()):
        raise HTTPException(401, "Password incorrect")

    random_session_id = str(uuid4())
    response = RedirectResponse("/", status_code=302)
    response.set_cookie(key="Authorization", value=random_session_id, max_age=60 * 10)
    SESSION_DB[random_session_id] = username
    return response


@router.post("/logout", dependencies=[Depends(get_auth_user)])
async def session_logout(response: Response, request: Request):
    response.delete_cookie(key="Authorization")
    value = request.cookies.get("Authorization")
    SESSION_DB.pop(value, None)
    return {"status": "logged out"}


@router.get("/whoami", dependencies=[Depends(get_auth_user)])
async def whoami(request: Request):
    value = request.cookies.get("Authorization")
    return {"status": SESSION_DB.get(value)}
