from airflow.models import DagBag
from airflow.operators.python import PythonOperator
from airflow.utils.dates import days_ago
from pyspark.sql import SparkSession


def spark_job():
    spark = SparkSession.builder \
        .appName("ExampleJob") \
        .getOrCreate()
    df = spark.read.csv("/Users/simon/tools/postgresql.git/contrib/file_fdw/data/list1.csv", header=True)
    df.show()


if __name__ == '__main__':
    dagbag = DagBag(dag_folder='/Users/simon/workspaces/dags', include_examples=False)
    dag = dagbag.get_dag(dag_id='pyspark_example')
    task = PythonOperator(
        task_id='dummy_task',
        python_callable=spark_job,
        dag=dag
    )

    context = {
        'task_instance': task,
        'execution_date': days_ago(1)
    }
    result = task.execute(context)
    print(result)
