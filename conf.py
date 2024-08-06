import os

import dotenv
from starlette.templating import Jinja2Templates

from utils.common import load_categories, save_categories

dotenv.load_dotenv()

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

SESSION_DB = {}

templates = Jinja2Templates(directory="templates")


USER_NAME = os.getenv("USER_NAME")
PERSONAL_PASSWORD = os.getenv("PERSONAL_PASSWORD")
print(USER_NAME)
print(PERSONAL_PASSWORD)

if not os.path.exists(os.path.join(ROOT_DIR, "categories.pickle")):
    categories = ["Праздники", "Здоровье", "Повседневное", "Другое"]
    save_categories(os.path.join(ROOT_DIR, "categories.pickle"), categories)
else:
    categories = load_categories(os.path.join(ROOT_DIR, "categories.pickle"))
