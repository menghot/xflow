import xml.etree.ElementTree as ET


def is_task_in_group(task_shape, group_shape):
    # Simple check: if task is within group bounds (you can improve this)
    if task_shape and group_shape:
        return (group_shape['x'] <= task_shape['x'] <= group_shape['x'] + group_shape['width'] and
                group_shape['y'] <= task_shape['y'] <= group_shape['y'] + group_shape['height'])
    return False


class BPMNToAirflowTransformer:
    def __init__(self, bpmn_file):
        self.bpmn_file = bpmn_file
        self.namespaces = {
            "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
            "dc": "http://www.omg.org/spec/DD/20100524/DC",
        }
        self.tasks = {}
        self.groups = {}
        self.sequence_flows = []
        self.tasks_no_groups = []

        self.root = ET.parse(self.bpmn_file).getroot()

    def extract_tasks(self):
        """
        Extracts tasks from the BPMN file and maps them to Airflow task names.
        """
        for task_type in ["task", "serviceTask", "receiveTask"]:
            for task in self.root.findall(f".//bpmn:{task_type}", self.namespaces):
                task_id = task.attrib["id"]
                task_name = task.attrib.get("name", "").replace(" ", "_").lower() or task_id.lower()
                self.tasks[task_id] = {"task_id": task_id, "task_name": task_name}

    def extract_groups(self):
        for group in self.root.findall(".//bpmn:group", self.namespaces):
            group_id = group.attrib["id"]
            self.groups[group_id] = {"group_id": group_id}

    def extract_sequence_flows(self):
        """
        Extracts sequence flows from the BPMN file.
        """
        for sequence_flow in self.root.findall(".//bpmn:sequenceFlow", self.namespaces):
            source = sequence_flow.attrib["sourceRef"]
            target = sequence_flow.attrib["targetRef"]
            self.sequence_flows.append((source, target))

    def extract_shapes(self):
        """
        Extracts task shapes and their bounds (x, y, width, height) for positioning tasks within groups.
        """
        for shape in self.root.findall(".//bpmndi:BPMNShape", self.namespaces):
            element_id = shape.attrib["bpmnElement"]
            bounds = shape.find("dc:Bounds", self.namespaces)

            if bounds is not None:
                x = float(bounds.attrib["x"])
                y = float(bounds.attrib["y"])
                width = float(bounds.attrib["width"])
                height = float(bounds.attrib["height"])
                shape = {"x": x, "y": y, "width": width, "height": height}

                # element exists in task
                if element_id in self.tasks:
                    self.tasks[element_id]["shape"] = shape

                # element exists in group
                if element_id in self.groups:
                    self.groups[element_id]["shape"] = shape

    def arrange_tasks_into_groups(self):
        """
        Arranges tasks into groups based on their spatial proximity to group shapes.
        Tasks that fall within a group shape's bounds are assigned to that group.
        """
        print("arrange_tasks_into_groups ----")
        tasks_has_groups = []
        for task_id in self.tasks:
            task_has_group = None
            for group_id in self.groups:
                if is_task_in_group(self.tasks[task_id]["shape"], self.groups[group_id]["shape"]):
                    task_has_group = True
                    print('task', task_id, 'in group:', group_id)
                    if "tasks" not in self.groups[group_id]:
                        self.groups[group_id]["tasks"] = [self.tasks[task_id]]
                    else:
                        self.groups[group_id]["tasks"].append(self.tasks[task_id])
            if task_has_group:
                tasks_has_groups.append(task_id)

        self.tasks_no_groups = {key: value for key, value in self.tasks.items() if key not in tasks_has_groups}

    def transform_to_dag(self, dag_id, output_file):
        """
        Transforms the BPMN workflow into an Airflow DAG Python script.

        :param dag_id: ID for the generated Airflow DAG.
        :param output_file: Path to save the generated Airflow DAG file.
        """

        self.extract_tasks()
        self.extract_groups()
        self.extract_shapes()
        self.extract_sequence_flows()
        print("---------before arrange-----------")

        print("tasks: ", self.tasks)
        print("groups: ", self.groups)
        print("sequence_flows: ", self.sequence_flows)
        self.arrange_tasks_into_groups()

        print("---------after arrange-----------")
        print("tasks: ", self.tasks)
        print("groups: ", self.groups)
        print("sequence_flows: ", self.sequence_flows)
        print("tasks_no_groups: ", self.tasks_no_groups)

        print("---------get non-group tasks-----------")

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
from airflow.decorators import task, task_group


def sample_task(task_name):
    print(f"Executing: {{task_name}}")


default_args = {{
    'start_date': datetime(2023, 1, 1),
    'retries': 1,
}}


with DAG(dag_id='{dag_id}', default_args=default_args, schedule_interval=None) as dag:
"""
        # Add Airflow tasks and task groups
        airflow_tasks = {}
        task_groups = {}

        # tasks no groups
        for task_id in self.tasks_no_groups:
            task_name = self.tasks[task_id]['task_name']
            dag_code += f"    {task_id} = PythonOperator(task_id='{task_id}', python_callable=sample_task, op_args=['{task_name}'])\n"

        # task in groups
        for group_id, group in self.groups.items():
            dag_code += f"    @task_group(group_id='{group_id}')\n"
            dag_code += f"    def {group_id}():\n"

            for task in group["tasks"]:
                task_id = task["task_id"]
                task_name = task["task_name"]
                dag_code += f"        {task_id} = PythonOperator(task_id='{task_id}', python_callable=sample_task, op_args=['{task_name}'])\n"

        for source, target in self.sequence_flows:
            if source in self.tasks and target in self.tasks:
                print(source, target)
                dag_code += f"    {source} >> {target}\n"

        return dag_code


if __name__ == '__main__':
    # Set the BPMN file path and output DAG file
    bpmn_file = "/Users/simon/workspaces/react-sql-editor/src/assets/diagram_simple.bpmn"
    dag_id = "example_dag"
    output_file = "/Users/simon/airflow/dags/example_dag.py"

    # Instantiate the transformer and transform the BPMN to DAG
    transformer = BPMNToAirflowTransformer(bpmn_file)
    transformer.transform_to_dag(dag_id, output_file)
