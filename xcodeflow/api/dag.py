import os

from airflow.models import DagBag
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

dag_blueprint = Blueprint(
    "dag",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/dag",
)

CORS(dag_blueprint)

dag_folder = os.path.join(os.path.dirname(__file__), "../../../dags")
dag_folder = os.path.abspath(dag_folder)


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


@dag_blueprint.route("/file-tree", methods=["GET"])
@csrf.exempt
def get_file_tree():
    path = dag_folder

    if not path or not os.path.exists(path):
        return jsonify({"error": "Invalid or non-existent path"}), 400

    # Simplify and normalize the root path
    simplified_path = os.path.abspath(path)

    # Build the tree starting from the root
    root_node = {
        "title": os.path.basename(simplified_path) or simplified_path,  # Root folder/file name
        "key": simplified_path,
        "isLeaf": not os.path.isdir(simplified_path),
    }

    if os.path.isdir(simplified_path):
        root_node["children"] = build_file_tree(simplified_path)

    return jsonify([root_node])


@dag_blueprint.route("/get-file-content", methods=["GET"])
@csrf.exempt
def get_file_content():
    # Get the file path from the query parameters
    file_path = request.args.get('path')

    print(dag_folder, file_path)

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


@dag_blueprint.route('/<dag_id>', methods=['GET'])
@csrf.exempt
def dag_graph(dag_id):
    try:
        dag_structure = get_dag_structure(dag_id)
        return jsonify(dag_structure)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
