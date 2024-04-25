import os

import dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from conf import templates, categories
from routes import schedule, auth
from utils.depends import get_auth_user
from utils.schedule import get_all_events

dotenv.load_dotenv()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(schedule.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    if not os.path.exists('events'):
        os.mkdir('events')


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    try:
        get_auth_user(request)

        events = get_all_events()
        events.sort(key=lambda event: event.end)

        return templates.TemplateResponse(
            "index.html",
            {"request": request, "event_categories": categories, "events": events[:5]}
        )
    except HTTPException:
        return templates.TemplateResponse("login.html", {"request": request})


@app.get("/docs")
async def docs():
    return {"no": "docs"}


if __name__ == "__main__":
    import uvicorn

    env_host = os.getenv("HOST")

    uvicorn.run(app, host=env_host if env_host else "localhost", port=25001)
