import datetime
import uuid

from pydantic import BaseModel, Field


class ExtendedProps(BaseModel):
    parentID: uuid.UUID
    description: str
    category: str
    priority: str
    interval: int = Field(ge=1)  # Интервал должен быть положительным числом
    freq: str
    until: datetime.datetime
    repeatable: bool


class Event(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)  # Добавлено поле id
    title: str
    backgroundColor: str
    start: datetime.datetime  # Исправлено на datetime.datetime
    end: datetime.datetime  # Исправлено на datetime.datetime
    extendedProps: ExtendedProps


if __name__ == '__main__':
    # Пример использования
    event_data = {
        "id": uuid.uuid4(),  # Добавлено поле id
        "title": "title",
        "backgroundColor": "#ff00FF",
        "start": datetime.datetime.strptime("2024-04-12", "%Y-%m-%d"),  # Исправлено на datetime.datetime
        "end": datetime.datetime.strptime("2024-04-14", "%Y-%m-%d"),  # Исправлено на datetime.datetime
        "extendedProps": {
            "parentID": uuid.uuid4(),  # Добавлено поле parentID
            "description": "description",
            "category": "category",
            "priority": "priority",
            "interval": 5,
            "freq": "daily",
            "until": datetime.datetime.strptime('2299-11-29', "%Y-%m-%d"),  # Исправлено на datetime.datetime
            "repeatable": True
        },
    }
if __name__ == '__main__':
    import json

    # Создание экземпляра модели Event
    event = Event(**event_data)

    event_json = event.model_dump_json()

    with open(str(event.id), "w") as f:
        f.write(event_json)

    with open(str(event.id), "r") as f:
        data = json.load(f)

    # print(type(event_json), event_json)
    #
    # data = json.loads(event_json)
    # print(type(data), data)

    event_from_dict = Event(**data)
    print(type(event_from_dict), event_from_dict)

    # e = json.dumps(event.model_dump_json())
    # Event.model_validate(from_json(e))
    # print(type(e))
    # d = json.loads(e)

    # ev = Event().
    # print(ev)

    # print(event.json(indent=4))
