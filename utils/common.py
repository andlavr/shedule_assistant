import pickle


def check_types(obj, datatype):
    if not isinstance(obj, datatype):
        raise TypeError(f'Ошибка! Ожидается: {datatype}, а получен: {type(obj)}.')


def load_categories(file_path):
    """
    Загружает категории
    :param file_path:
    :return: list
    """
    with open(file_path, "rb") as file:
        data = pickle.load(file)
        return data


def save_categories(file_path, categories):
    with open(file_path, "wb") as file:
        pickle.dump(categories, file)
    return True
