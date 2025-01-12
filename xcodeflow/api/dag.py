import importlib
import os

from airflow import DAG
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


def parse_dag_file(dag_file_path):
    """
    Parse a Python DAG file and extract the DAG structure.

    Args:
        dag_file_path (str): Path to the DAG Python file.

    Returns:
        dict: DAG structure with nodes and edges.
    """
    if not os.path.exists(dag_file_path):
        raise FileNotFoundError(f"The file {dag_file_path} does not exist.")

    # Load the DAG file dynamically
    module_name = os.path.basename(dag_file_path).replace(".py", "")
    spec = importlib.util.spec_from_file_location(module_name, dag_file_path)
    dag_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dag_module)

    # Find the DAG object in the module
    dag_objects = [var for var in vars(dag_module).values() if isinstance(var, DAG)]
    if not dag_objects:
        raise ValueError(f"No DAG object found in the file {dag_file_path}.")

    dag = dag_objects[0]  # Assuming there is one DAG in the file

    # Extract nodes and edges
    nodes = [{"id": task.task_id} for task in dag.tasks]
    edges = [
        {"source": upstream, "target": task.task_id}
        for task in dag.tasks
        for upstream in task.upstream_task_ids
    ]

    return {"dag_id": dag.dag_id, "nodes": nodes, "edges": edges}


@dag_blueprint.route("/graph", methods=["GET"])
@csrf.exempt
def get_graph():
    # Get the file path from the query parameters
    file_path = request.args.get('path')

    print(dag_folder, file_path)

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "Invalid or non-existent path"}), 400

    # Check if it's a file (not a directory)
    if not os.path.isfile(file_path):
        return jsonify({'error': 'The provided path is not a file'}), 400

    graph = parse_dag_file(file_path)
    return jsonify(graph), 200
