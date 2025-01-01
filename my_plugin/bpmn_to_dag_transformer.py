import xml.etree.ElementTree as ET


class BPMNToAirflowTransformer:
    def __init__(self, bpmn_file, bpmn_content):
        self.bpmn_file = bpmn_file
        self.bpmn_content = bpmn_content
        self.namespaces = {
            "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
        }
        if self.bpmn_content is not None:
            self.root = ET.fromstring(bpmn_content)
        else:
            self.root = ET.parse(self.bpmn_file).getroot()

        self.tasks = {}
        self.sequence_flows = []
        self.extract_tasks()
        self.extract_sequence_flows()

    def extract_tasks(self):
        """
        Extracts tasks from the BPMN file and maps them to Airflow task names.
        """
        for task_type in ["task", "serviceTask", "receiveTask"]:
            for task in self.root.findall(f".//bpmn:{task_type}", self.namespaces):
                task_id = task.attrib["id"]
                task_name = task.attrib.get("name", "").replace(" ", "_").lower() or task_id.lower()
                self.tasks[task_id] = task_name

    def extract_sequence_flows(self):
        """
        Extracts sequence flows from the BPMN file.
        """
        for sequence_flow in self.root.findall(".//bpmn:sequenceFlow", self.namespaces):
            source = sequence_flow.attrib["sourceRef"]
            target = sequence_flow.attrib["targetRef"]
            self.sequence_flows.append((source, target))

    def transform_to_dag(self, dag_id, output_file):
        """
        Transforms the BPMN workflow into an Airflow DAG Python script.

        :param dag_id: ID for the generated Airflow DAG.
        :param output_file: Path to save the generated Airflow DAG file.
        """

        dag_code = self.generate_airflow_dag(dag_id)
        print(dag_code)
        with open(output_file, "w") as f:
            f.write(dag_code)
        print(f"DAG saved to {output_file}")

    def generate_airflow_dag(self, dag_id):
        """
        Generates the Airflow DAG Python code.

        :param dag_id: ID for the DAG.
        :return: Python code as a string.
        """
        dag_code = f"""from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime


def sample_task(task_name):
    print(f"Executing: {{task_name}}")


default_args = {{
    'start_date': datetime(2023, 1, 1),
    'retries': 1,
}}


with DAG(dag_id='{dag_id}', default_args=default_args, schedule_interval=None) as dag:
"""

        # Add Airflow tasks
        airflow_tasks = {}
        for task_id, task_name in self.tasks.items():
            task_var = f"task_{task_id.lower()}"
            airflow_tasks[task_id] = task_var
            dag_code += f"    {task_var} = PythonOperator(task_id='{task_name}', python_callable=sample_task, op_args=['{task_name}'])\n"

        # Add sequence flows
        for source, target in self.sequence_flows:
            if source in airflow_tasks and target in airflow_tasks:
                dag_code += f"    {airflow_tasks[source]} >> {airflow_tasks[target]}\n"

        return dag_code


if __name__ == '__main__':
    # Set the BPMN file path and output DAG file
    bpmn_file = "/Users/simon/workspaces/react-sql-editor/src/assets/diagram3.bpmn"
    dag_id = "example_dag"
    output_file = "/Users/simon/airflow/dags/example_dag.py"

    # Instantiate the transformer and transform the BPMN to DAG
    transformer = BPMNToAirflowTransformer(bpmn_file, None)
    transformer.transform_to_dag(dag_id, output_file)
