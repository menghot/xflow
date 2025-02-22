import os
import traceback
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from xcodeflow.bpmn_to_dag_transformer import BPMNToAirflowTransformer

bpmn_blueprint = Blueprint(
    "bpmn",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/bpmn",
)

# Enable CORS
CORS(bpmn_blueprint)


# Define the API route
@bpmn_blueprint.route("/preview", methods=["POST"])
@csrf.exempt
def preview():
    """
    API endpoint to execute a SQL query.
    """
    try:
        # Get JSON data from the request
        bpmn_xml = request.data.decode('utf-8')
        print("bpmn_xml ===> ", bpmn_xml)
        transformer = BPMNToAirflowTransformer(None, bpmn_xml)

        dag_code = transformer.generate_airflow_dag()
        return jsonify({"status": "success", "data": dag_code}), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500


@bpmn_blueprint.route("/deploy", methods=["POST"])
@csrf.exempt
def deploy():
    try:
        # Get JSON data from the request
        bpmn_xml = request.data.decode('utf-8')
        transformer = BPMNToAirflowTransformer(None, bpmn_xml)
        dag_code = transformer.generate_airflow_dag()

        # Save DAG to $AIRFLOW_HOME/dags by default
        output_file = os.path.join(os.path.dirname(__file__), "../../../dags", transformer.process_id + ".py")

        with open(output_file, "w") as f:
            f.write(dag_code)
        print(f"DAG saved to {output_file}")
        return jsonify({"status": "success", "dag_file": os.path.abspath(output_file)}), 200

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500


@bpmn_blueprint.route("/save", methods=["POST"])
@csrf.exempt
def save():
    try:
        # Get JSON data from the request
        bpmn_xml = request.data.decode('utf-8')
        file_path = request.args.get('file_path')

        # Save DAG to $AIRFLOW_HOME/dags by default

        with open(file_path, "w") as f:
            f.write(bpmn_xml)
        print(f"DAG saved to {file_path}")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500
