import pickle


def check_types(obj, datatype):
    if not isinstance(obj, datatype):
        raise TypeError(f'Ошибка! Ожидается: {datatype}, а получен: {type(obj)}.')


def load_categories(file_path):
    with open(file_path, "rb") as file:
        return pickle.load(file)


def save_categories(file_path, categories):
    with open(file_path, "wb") as file:
        pickle.dump(categories, file)
    return True
