FROM apache/airflow:2.10.5-python3.9

RUN mkdir -p /opt/airflow/plugins && pip install apache-airflow-providers-postgres \
    apache-airflow-providers-apache-hive \
    apache-airflow-providers-apache-spark \
    apache-airflow-providers-trino \
    trino pyspark==3.5.6 pyhive thrift flask_cors

COPY xcodeflow /opt/airflow/plugins/xcodeflow


