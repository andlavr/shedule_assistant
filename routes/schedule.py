import dotenv
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from starlette import status

import utils.depends as depends
import utils.schedule as schedule
from schemas.event import Event

router = APIRouter(prefix='/events', tags=['events'])

dotenv.load_dotenv()


@router.get("/", dependencies=[Depends(depends.get_auth_user)])
def all() -> list[Event]:
    """
    Возвращает список всех эвентов
    :return: list
    """
    return schedule.get_all_events()


@router.post("/add", dependencies=[Depends(depends.get_auth_user)])
def add(event: Event):
    """
    Добавляет эвент в список
    :param event:
    :return: json
    """
    schedule.add_event(event)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content={"success": "events created"})


@router.delete("/delete_by_parent", status_code=200)
def delete_by_parent(event: Event):
    """
    Удаляет эвент по основному эвенту
    :param event:
    :return:None
    """
    schedule.delete_events_by_parent(str(event.extendedProps.parentID))


@router.delete("/delete_by_id", status_code=200)
def delete_by_id(event: Event):
    """
    Удаляет эвент по id
    :param event:
    :return: None
    """
    schedule.delete_event_by_id(str(event.id))


@router.put("/edit_by_id", status_code=200)
def edit_by_id(event: Event):
    """
    Изменяет выбранный эвент по id
    :param event:
    :return: None
    """
    schedule.delete_event_by_id(str(event.id))
    schedule.serialize_event(event)


@router.put("/edit_by_parent", status_code=200)
def edit_by_parent(event: Event):
    """
    Изменяет выбранный по родителю эвент
    :param event:
    :return: None
    """
    schedule.delete_events_by_parent(str(event.extendedProps.parentID))
    schedule.add_event(event)
