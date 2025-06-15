from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime
import tzlocal
import os
import glob
import shutil
import h5pyd
import numpy as np
import time
import string
import random
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Путь к корню ваших HDF5-файлов и папок
FOLDER_PATH = "/usr/src/app/dataset/"  

HSDS_ENDPOINT = os.environ.get("HSDS_ENDPOINT", "http://hsds:5101")
HSDS_USERNAME = os.environ.get("HSDS_USERNAME", "")
HSDS_PASSWORD = os.environ.get("HSDS_PASSWORD", "")
HSDS_BUCKET = os.environ.get("HSDS_BUCKET", "wintori")

# --- Утилитарные функции ---

def convert_unix_timestamp(ts):
    """
    Преобразует метку времени UNIX в строку вида "YYYY-MM-DD HH:MM:SS"
    с учётом локальной таймзоны.
    """
    tz = tzlocal.get_localzone()
    dt = datetime.fromtimestamp(ts, tz)
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def get_directory_tree(path):
    """
    Рекурсивно обходит файловую систему, начиная с path,
    и возвращает список узлов-словарей:
    { name: <имя>, type: 'folder'|'file', children: [...] }
    """
    tree = []
    try:
        for entry in os.scandir(path):
            if entry.is_dir():
                tree.append({
                    "name": entry.name,
                    "type": "folder",
                    "children": get_directory_tree(os.path.join(path, entry.name))
                })
            elif entry.is_file():
                tree.append({
                    "name": entry.name,
                    "type": "file"
                })
    except Exception as e:
        # В реальном приложении здесь логируем ошибку
        pass
    return tree

def get_hdf5_structure(node):
    """
    Рекурсивно обходит HDF5-группу node (h5pyd.Group или h5pyd.File)
    и возвращает список узлов:
    { name: <имя>, type: 'group'|'dataset', shape, dtype, children }
    """
    items = []
    for key in node:
        obj = node[key]
        if isinstance(obj, h5pyd.Group):
            items.append({
                "name": key,
                "type": "group",
                "children": get_hdf5_structure(obj)
            })
        elif isinstance(obj, h5pyd.Dataset):
            items.append({
                "name": key,
                "type": "dataset",
                "shape": obj.shape,
                "dtype": str(obj.dtype)
            })
    return items

def open_hdf5_file(fname, mode='r'):
    path = f"/{HSDS_BUCKET}/{fname}"
    return h5pyd.File(path, mode=mode, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)

# --- API для работы с файловой системой ---

@app.route("/api/directory_tree", methods=["GET"])
def api_directory_tree():
    """
    Возвращает JSON-иерархию папок и файлов, начиная с FOLDER_PATH.
    Клиент использует это в качестве TreeView.
    """
    tree = get_directory_tree(FOLDER_PATH)
    return jsonify(status=True, data=tree, message="Directory tree retrieved")

@app.route("/api/create_folder", methods=["POST"])
def api_create_folder():
    """
    Создаёт новую папку.
    Ожидает JSON: { parent: <путь относительно FOLDER_PATH>, name: <имя папки> }
    """
    data = request.get_json()
    parent = data.get("parent", "")
    name = data.get("name")
    if not name:
        return jsonify(status=False, message="Missing folder name"), 400
    new_path = os.path.join(FOLDER_PATH, parent, name)
    try:
        os.makedirs(new_path, exist_ok=False)
        return jsonify(status=True, message="Folder created")
    except FileExistsError:
        return jsonify(status=False, message="Folder already exists"), 400
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/delete_file_or_folder", methods=["POST"])
def api_delete_file_or_folder():
    """
    Удаляет файл или папку полностью.
    JSON: { path: <путь относ. FOLDER_PATH> }
    """
    data = request.get_json()
    rel = data.get("path")
    if not rel:
        return jsonify(status=False, message="Missing path"), 400
    full = os.path.join(FOLDER_PATH, rel)
    try:
        if os.path.isdir(full):
            shutil.rmtree(full)
        else:
            os.remove(full)
        return jsonify(status=True, message="Deleted successfully")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/rename_file_or_folder", methods=["POST"])
def api_rename_file_or_folder():
    """
    Переименовывает файл или папку.
    JSON: { path: <старый путь>, new_name: <новое имя> }
    """
    data = request.get_json()
    old = data.get("path")
    new = data.get("new_name")
    if not old or not new:
        return jsonify(status=False, message="Missing parameters"), 400
    old_full = os.path.join(FOLDER_PATH, old)
    new_full = os.path.join(os.path.dirname(old_full), new)
    try:
        os.rename(old_full, new_full)
        return jsonify(status=True, message="Renamed successfully")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

# --- API для работы со структурой HDF5 ---

@app.route("/api/file_structure", methods=["POST"])
def api_file_structure():
    """
    Возвращает иерархию групп и датасетов в указанном HDF5-файле.
    JSON: { file_name: <имя файла> }
    """
    data = request.get_json()
    fn = data.get("file_name")
    if not fn:
        return jsonify(status=False, message="Missing file_name"), 400
    try:
        with open_hdf5_file(fn, 'r') as f:
            structure = get_hdf5_structure(f)
        return jsonify(status=True, data=structure, message="Structure retrieved")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/get_attributes", methods=["POST"])
def api_get_attributes():
    """
    Читает атрибуты у объекта (группы или датасета).
    JSON: { file_name, object_path }
    """
    data = request.get_json()
    fn = data.get("file_name")
    path = data.get("object_path", "")
    if not fn:
        return jsonify(status=False, message="Missing file_name"), 400
    try:
        with open_hdf5_file(fn, 'r') as f:
            obj = f[path] if path else f  # если путь пустой — корневой объект
            attrs = {k: obj.attrs[k].tolist() for k in obj.attrs}
        return jsonify(status=True, data=attrs, message="Attributes retrieved")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/update_attributes", methods=["POST"])
def api_update_attributes():
    """
    Обновляет или создаёт атрибуты у объекта.
    JSON: { file_name, object_path, attrs: { key: value, ... } }
    """
    data = request.get_json()
    fn = data.get("file_name")
    path = data.get("object_path", "")
    new_attrs = data.get("attrs", {})
    if not fn or not isinstance(new_attrs, dict):
        return jsonify(status=False, message="Invalid input"), 400
    try:
        with open_hdf5_file(fn, 'r+') as f:
            obj = f[path] if path else f
            for k, v in new_attrs.items():
                obj.attrs[k] = v
            result = {k: obj.attrs[k].tolist() for k in obj.attrs}
        return jsonify(status=True, data=result, message="Attributes updated")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/create_group", methods=["POST"])
def api_hdf5_create_group():
    """
    Создаёт новую группу внутри HDF5-файла.
    JSON: { file_name, parent_path, name }
    """
    data = request.get_json()
    fn = data.get("file_name")
    parent = data.get("parent_path", "")
    name = data.get("name")
    if not fn or not name:
        return jsonify(status=False, message="Invalid input"), 400
    try:
        with open_hdf5_file(fn, 'r+') as f:
            grp = f[parent] if parent else f
            grp.create_group(name)
        return jsonify(status=True, message="Group created")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/delete_hdf5_object", methods=["POST"])
def api_hdf5_delete_object():
    """
    Удаляет группу или датасет внутри HDF5.
    JSON: { file_name, object_path }
    """
    data = request.get_json()
    fn = data.get("file_name")
    path = data.get("object_path")
    if not fn or not path:
        return jsonify(status=False, message="Invalid input"), 400
    try:
        with open_hdf5_file(fn, 'r+') as f:
            del f[path]
        return jsonify(status=True, message="Object deleted")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/rename_hdf5_object", methods=["POST"])
def api_hdf5_rename_object():
    """
    Переименовывает группу или датасет внутри HDF5 через копирование+удаление.
    JSON: { file_name, old_path, new_name }
    """
    data = request.get_json()
    fn = data.get("file_name")
    old = data.get("old_path")
    new = data.get("new_name")
    if not fn or not old or not new:
        return jsonify(status=False, message="Invalid input"), 400
    try:
        with open_hdf5_file(fn, 'r+') as f:
            parent = os.path.dirname(old)
            target_parent = f[parent] if parent else f
            # копируем объект
            f.copy(old, parent, new)
            # удаляем старый
            del f[old]
        return jsonify(status=True, message="Renamed successfully")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/get_dataset", methods=["POST"])
def api_get_dataset():
    """
    Возвращает содержимое датасета и его атрибуты.
    JSON: { file_name, dataset_path }
    """
    data = request.get_json()
    fn = data.get("file_name")
    path = data.get("dataset_path")
    if not fn or not path:
        return jsonify(status=False, message="Invalid input"), 400
    try:
        with open_hdf5_file(fn, 'r') as f:
            ds = f[path]
            arr = ds[()]  # загружаем весь датасет
            attrs = {k: ds.attrs[k].tolist() for k in ds.attrs}
        # Преобразуем в списки для JSON
        payload = {
            "data": arr.tolist(),
            "shape": ds.shape,
            "dtype": str(ds.dtype),
            "attrs": attrs
        }
        return jsonify(status=True, data=payload, message="Dataset retrieved")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/update_dataset", methods=["POST"])
def api_update_dataset():
    """
    Обновляет содержимое существующего датасета.
    JSON: { file_name, dataset_path, data: [[...], ...] }
    Новые данные должны соответствовать размерности.
    """
    data = request.get_json()
    fn = data.get("file_name")
    path = data.get("dataset_path")
    new_data = data.get("data")
    if not fn or not path or new_data is None:
        return jsonify(status=False, message="Invalid input"), 400
    try:
        arr = np.array(new_data)
        with open_hdf5_file(fn, 'r+') as f:
            ds = f[path]
            if arr.shape != ds.shape:
                return jsonify(status=False, message="Shape mismatch"), 400
            ds[...] = arr  # перезаписываем весь датасет
        return jsonify(status=True, message="Dataset updated")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/generate_mock_hdf5", methods=["POST"])
def api_generate_mock_hdf5():
    data = request.get_json(silent=True) or {}
    fname = data.get("file_name") or f"mock_{int(time.time())}.hdf5"
    path = f"/{HSDS_BUCKET}/{fname}"
    try:
        # Если файл уже есть – удалим
        try:
            f = h5pyd.File(path, "r+", endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
            f.close()
            h5pyd._hl.files.delete_file(path, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        except Exception:
            pass
        with h5pyd.File(path, "w", endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET) as f:
            grp = f.create_group("Experiment1")
            n = 100_000
            grp.create_dataset("temperature", data=np.random.normal(loc=20.0, scale=5.0, size=n))
            grp.create_dataset("pressure", data=np.random.normal(loc=1013.0, scale=10.0, size=n))
            spec = grp.create_group("spectra")
            for i in range(5):
                name = f"spectrum_{i+1}"
                spec.create_dataset(name, data=np.random.rand(1000,3))
            table = f.create_dataset("Summary", data=np.random.rand(10000,5))
            grp.attrs["created"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            table.attrs["columns"] = np.array(["A","B","C","D","E"], dtype='S')
        return jsonify(status=True, file_name=fname, message="Mock HDF5 generated in S3")
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

# --- Примеры существующих эндпоинтов для вашей ориентации ---

@app.route("/api/test")
def test_sanity():
    return jsonify(status=True, data=None, message="Success")

@app.route('/api/get_file_names')
def get_file_names():
    """
    Возвращает список файлов *.hdf5 в корне FOLDER_PATH.
    """
    files = glob.glob(os.path.join(FOLDER_PATH, '*.hdf5'))
    names = [os.path.basename(p) for p in files]
    return jsonify(status=True, data=names, message="Files retrieved")

# --- Новый эндпоинт: получить данные по глюкозе ---
@app.route("/api/get_glucose_data", methods=["POST"])
def api_get_glucose_data():
    data = request.get_json()
    fn = data.get("file_name")
    if not fn:
        return jsonify(status=False, data=None, message="Failed: file_name required"), 400
    try:
        with open_hdf5_file(fn, 'r') as f:
            glucose = f["/internal/glucose"][:]
            time_data = f["/internal/time"][:]
            result = {"glucose": glucose.tolist(), "time": time_data.tolist()}
        return jsonify(status=True, data=result, message="Glucose data loaded")
    except Exception as e:
        return jsonify(status=False, data=None, message=f"Failed: {str(e)}"), 400

# --- Новый эндпоинт: получить measurement по индексу ---
@app.route("/api/get_measurement_data", methods=["POST"])
def api_get_measurement_data():
    data = request.get_json()
    fn = data.get("file_name")
    idx = data.get("index")
    if not fn or idx is None:
        return jsonify(status=False, data=None, message="Failed: file_name and index required"), 400
    try:
        with open_hdf5_file(fn, 'r') as f:
            measurement = f["/internal/measurement"][idx]
            result = {"measurement": measurement.tolist()}
        return jsonify(status=True, data=result, message="Measurement data loaded")
    except Exception as e:
        return jsonify(status=False, data=None, message=f"Failed: {str(e)}"), 400

@app.route("/api/upload_hdf5", methods=["POST"])
def upload_hdf5():
    """
    Загружает HDF5-файл в S3 через HSDS. Ожидает multipart/form-data с файлом.
    """
    if 'file' not in request.files:
        return jsonify(status=False, message="No file part"), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(status=False, message="No selected file"), 400
    fname = file.filename
    # Сохраняем временно локально
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        file.save(tmp.name)
        tmp.flush()
        # Копируем содержимое в S3 через h5pyd
        with h5pyd.File(f"/{HSDS_BUCKET}/{fname}", "w", endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET) as f_s3, \
             h5pyd.File(tmp.name, "r") as f_local:
            def copy_group(src, dst):
                for key in src:
                    obj = src[key]
                    if isinstance(obj, h5pyd.Group):
                        grp = dst.create_group(key)
                        copy_group(obj, grp)
                    elif isinstance(obj, h5pyd.Dataset):
                        dst.create_dataset(key, data=obj[()])
                        # копируем атрибуты
                        for attr in obj.attrs:
                            dst[key].attrs[attr] = obj.attrs[attr]
            copy_group(f_local, f_s3)
            for attr in f_local.attrs:
                f_s3.attrs[attr] = f_local.attrs[attr]
    os.unlink(tmp.name)
    return jsonify(status=True, message="File uploaded to S3", file_name=fname)

@app.route("/api/download_hdf5", methods=["GET"])
def download_hdf5():
    """
    Скачивает HDF5-файл из S3 через HSDS. Параметр: file_name (query string)
    """
    fname = request.args.get("file_name")
    if not fname:
        return jsonify(status=False, message="Missing file_name"), 400
    # Сохраняем временно локально
    with tempfile.NamedTemporaryFile(delete=False, suffix=".hdf5") as tmp:
        with h5pyd.File(f"/{HSDS_BUCKET}/{fname}", "r", endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET) as f_s3, \
             h5pyd.File(tmp.name, "w") as f_local:
            def copy_group(src, dst):
                for key in src:
                    obj = src[key]
                    if isinstance(obj, h5pyd.Group):
                        grp = dst.create_group(key)
                        copy_group(obj, grp)
                    elif isinstance(obj, h5pyd.Dataset):
                        dst.create_dataset(key, data=obj[()])
                        for attr in obj.attrs:
                            dst[key].attrs[attr] = obj.attrs[attr]
            copy_group(f_s3, f_local)
            for attr in f_s3.attrs:
                f_local.attrs[attr] = f_s3.attrs[attr]
        tmp.flush()
        return send_file(tmp.name, as_attachment=True, download_name=fname, mimetype="application/octet-stream")

@app.route("/api/delete_hdf5", methods=["POST"])
def delete_hdf5():
    """
    Удаляет HDF5-файл из S3 через HSDS. Ожидает JSON: { file_name }
    """
    data = request.get_json()
    fname = data.get("file_name")
    if not fname:
        return jsonify(status=False, message="Missing file_name"), 400
    path = f"/{HSDS_BUCKET}/{fname}"
    try:
        h5pyd._hl.files.delete_file(path, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        return jsonify(status=True, message="File deleted from S3", file_name=fname)
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/list_s3_files", methods=["GET"])
def list_s3_files():
    """
    Возвращает список всех HDF5-файлов в S3 bucket через HSDS.
    """
    try:
        # Получаем список файлов в корне bucket
        files = h5pyd._hl.files.get_file_list(f"/{HSDS_BUCKET}", endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        # Оставляем только .hdf5
        hdf5_files = [f[1:] if f.startswith("/") else f for f in files if f.endswith(".hdf5")]
        return jsonify(status=True, data=hdf5_files, message="S3 files listed")
    except Exception as e:
        return jsonify(status=False, data=[], message=str(e)), 500

# --- CRUD для папок в S3 через HSDS ---

@app.route("/api/s3_create_folder", methods=["POST"])
def s3_create_folder():
    """
    Создаёт папку (группу) в S3 через HSDS. JSON: { folder_path: "subfolder1/subfolder2" }
    """
    data = request.get_json()
    folder_path = data.get("folder_path")
    if not folder_path:
        return jsonify(status=False, message="Missing folder_path"), 400
    path = f"/{HSDS_BUCKET}/{folder_path.strip('/')}"
    try:
        h5pyd._hl.files.make_folder(path, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        return jsonify(status=True, message="Folder created", folder_path=folder_path)
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/s3_delete_folder", methods=["POST"])
def s3_delete_folder():
    """
    Удаляет папку (группу) в S3 через HSDS. JSON: { folder_path: "subfolder1/subfolder2" }
    """
    data = request.get_json()
    folder_path = data.get("folder_path")
    if not folder_path:
        return jsonify(status=False, message="Missing folder_path"), 400
    path = f"/{HSDS_BUCKET}/{folder_path.strip('/')}"
    try:
        h5pyd._hl.files.delete_folder(path, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        return jsonify(status=True, message="Folder deleted", folder_path=folder_path)
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/s3_rename_folder", methods=["POST"])
def s3_rename_folder():
    """
    Переименовывает папку (группу) в S3 через HSDS. JSON: { old_path, new_name }
    """
    data = request.get_json()
    old_path = data.get("old_path")
    new_name = data.get("new_name")
    if not old_path or not new_name:
        return jsonify(status=False, message="Missing old_path or new_name"), 400
    src = f"/{HSDS_BUCKET}/{old_path.strip('/')}"
    dst = f"/{HSDS_BUCKET}/{('/'.join(old_path.strip('/').split('/')[:-1]) + '/' if '/' in old_path else '')}{new_name}"
    try:
        h5pyd._hl.files.move(src, dst, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        return jsonify(status=True, message="Folder renamed", old_path=old_path, new_path=dst)
    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

@app.route("/api/s3_list_folder", methods=["POST"])
def s3_list_folder():
    """
    Возвращает содержимое папки в S3 через HSDS. JSON: { folder_path: "subfolder1/subfolder2" }
    """
    data = request.get_json() or {}
    folder_path = data.get("folder_path", "")
    path = f"/{HSDS_BUCKET}/{folder_path.strip('/')}" if folder_path else f"/{HSDS_BUCKET}"
    try:
        items = h5pyd._hl.files.get_file_list(path, endpoint=HSDS_ENDPOINT, username=HSDS_USERNAME, password=HSDS_PASSWORD, bucket=HSDS_BUCKET)
        # Разделяем на папки и файлы
        folders = [i[1:] if i.startswith("/") else i for i in items if i.endswith("/")]
        files = [i[1:] if i.startswith("/") else i for i in items if not i.endswith("/")]
        return jsonify(status=True, folders=folders, files=files, message="Folder contents listed")
    except Exception as e:
        return jsonify(status=False, folders=[], files=[], message=str(e)), 500

# Запуск сервера
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)