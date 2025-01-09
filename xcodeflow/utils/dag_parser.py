import importlib.util
import os
from airflow.models import DAG


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


# Example Usage
if __name__ == "__main__":
    # Path to your DAG Python file
    dag_file = "/Users/simon/workspaces/xcodeflow.git/dags/process_0.py"  # Replace with the path to your DAG file

    try:
        dag_structure = parse_dag_file(dag_file)
        print("DAG Structure:")
        print(dag_structure)
    except Exception as e:
        print(f"Error: {e}")
