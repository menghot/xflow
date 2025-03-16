import os

from airflow.models import DagBag
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from xcodeflow import AIRFLOW_HOME

file_blueprint = Blueprint(
    "file",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/file",
)

CORS(file_blueprint)

DAG_FOLDER = os.path.join(AIRFLOW_HOME, "dags")
BPMN_HOME = os.path.join(AIRFLOW_HOME, "bpmn")


def build_file_tree(base_path):
    file_tree_nodes = []
    try:
        for item in os.listdir(base_path):
            # Skip the "__pycache__" folder
            if item == "__pycache__":
                continue
            item_path = os.path.join(base_path, item)
            simplified_path = os.path.abspath(item_path)  # Resolve the full canonical path
            node = {
                "title": item,
                "key": simplified_path,  # Use simplified path as the key
                "isLeaf": not os.path.isdir(item_path),
            }
            if os.path.isdir(item_path):
                node["children"] = build_file_tree(item_path)
            file_tree_nodes.append(node)
    except PermissionError:
        pass  # Ignore directories/files without permission
    return file_tree_nodes


@file_blueprint.route("/file-trees", methods=["GET"])
@csrf.exempt
def get_file_trees():
    nodes = []
    for path in [DAG_FOLDER, BPMN_HOME]:
        root_node = {
            "title": os.path.basename(path) or path,  # Root folder/file name
            "key": path,
            "isLeaf": not os.path.isdir(path),
        }
        if os.path.isdir(path):
            root_node["children"] = build_file_tree(path)
        nodes.append(root_node)
    return nodes


@file_blueprint.route("/get-file-content", methods=["GET"])
@csrf.exempt
def get_file_content():
    # Get the file path from the query parameters
    file_path = request.args.get('path')

    print(DAG_FOLDER, file_path)

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "Invalid or non-existent path"}), 400

    # Check if it's a file (not a directory)
    if not os.path.isfile(file_path):
        return jsonify({'error': 'The provided path is not a file'}), 400

    try:
        # Read the file content
        with open(file_path, 'r') as file:
            content = file.read()

        return content

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_dag_structure(dag_id):
    dag_bag = DagBag()
    dag = dag_bag.get_dag(dag_id)
    nodes = [{"id": task.task_id} for task in dag.tasks]
    edges = [{"source": upstream, "target": task.task_id}
             for task in dag.tasks
             for upstream in task.upstream_task_ids]
    return {"nodes": nodes, "edges": edges}


@file_blueprint.route('/<dag_id>', methods=['GET'])
@csrf.exempt
def dag_graph(dag_id):
    try:
        dag_structure = get_dag_structure(dag_id)
        return jsonify(dag_structure)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@file_blueprint.route("/file-tree", methods=["GET"])
@csrf.exempt
def build_file_tree_with_sort():
    """
    Build a file tree from multiple paths, sorting nodes by title (alphabetical order).
    Folders are listed before files.
    """

    def simplify_path(full_path):
        return os.path.abspath(full_path)

    def build_tree(current_path):
        # Ignore "__pycache__" and hidden files/folders
        entries = [
            entry for entry in os.listdir(current_path)
            if entry != "__pycache__" and not entry.startswith('.')
        ]

        # Sort entries: Folders first, then files, both alphabetically
        entries.sort(key=lambda e: (not os.path.isdir(os.path.join(current_path, e)), e.lower()))

        children = []
        for entry in entries:
            entry_path = os.path.join(current_path, entry)
            is_folder = os.path.isdir(entry_path)
            children.append({
                "title": entry,
                "key": simplify_path(entry_path),
                "isLeaf": not is_folder,
                "children": build_tree(entry_path) if is_folder else None
            })
        return children

    # Build a tree for each path
    trees = []
    for path in [DAG_FOLDER, BPMN_HOME]:
        if os.path.exists(path):
            root = {
                "title": os.path.basename(path) or path,
                "key": simplify_path(path),
                "isLeaf": False,
                "children": build_tree(path)
            }
            trees.append(root)

    return trees


@file_blueprint.route("/save", methods=["POST"])
@csrf.exempt
def save():
    try:
        # Get JSON data from the request
        content = request.data.decode('utf-8')
        file_path = request.args.get('file_path')

        print(file_path, content)

        with open(file_path, "w") as f:
            f.write(content)
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500
