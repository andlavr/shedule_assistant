import json
import os
import shutil
import uuid

from dateutil.relativedelta import relativedelta
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette import status

from conf import ROOT_DIR
from schemas.event import Event


def get_all_events():
    if not os.path.exists(os.path.join(ROOT_DIR, 'events')):
        raise HTTPException(status_code=404, detail="Events no found")

    events = []
    for root, d_names, f_names in os.walk(os.path.join(ROOT_DIR, 'events')):
        for f in f_names:
            event_path = os.path.join(root, f)
            events.append(deserialize_event(event_path))

    return events


def add_event(event: Event):
    if not event.extendedProps.repeatable:
        serialize_event(event)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content={"success": "event created"})

    interval = event.extendedProps.interval
    interval_value = {event.extendedProps.freq: 1 * interval}

    while event.start < event.extendedProps.until:
        event = Event(**event.__dict__)
        event.id = uuid.uuid4()
        event.start += relativedelta(**interval_value)
        event.end += relativedelta(**interval_value)

        serialize_event(event)


def delete_events_by_parent(parent_id):
    if not os.path.exists(os.path.join(ROOT_DIR, 'events')):
        raise HTTPException(status_code=404, detail="Events no found")

    shutil.rmtree(os.path.join(ROOT_DIR, 'events', parent_id))

    return True


def delete_event_by_id(event_id):
    print(event_id)
    if not os.path.exists(os.path.join(ROOT_DIR, 'events')):
        raise HTTPException(status_code=404, detail="Events folder no found")

    for root, d_names, f_names in os.walk(os.path.join(ROOT_DIR, 'events')):
        for f in f_names:
            event_path = os.path.join(root, f)
            event = deserialize_event(event_path)
            if str(event.id) == event_id:
                os.remove(event_path)
                return True

    raise HTTPException(status_code=404, detail="Event no found")


def serialize_event(event: Event):
    file_path = os.path.join(ROOT_DIR, 'events', str(event.extendedProps.parentID), f'{str(event.id)}.json')

    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))

    event_json = event.model_dump_json()

    with open(file_path, "w") as f:
        f.write(event_json)


def deserialize_event(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)

    event_from_dict = Event(**data)
    return event_from_dict
