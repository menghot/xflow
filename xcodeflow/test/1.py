
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator


if __name__ == '__main__':
    a = SQLExecuteQueryOperator(conn_id='spark_sql', task_id='dwd_nomalize_dept', sql=f"""
    insert into dwd.customer select * from ods.customer where c_customer_sk < 200 and c_customer_sk > 100;""")

    a.execute({})