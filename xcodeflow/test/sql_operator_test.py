from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator

sql = f"""
insert into dwd.customer 
    select * from ods.customer 
        where c_customer_sk < 200 and c_customer_sk > 100 
"""


def output(c):
    print(c)


if __name__ == '__main__':
    a = SQLExecuteQueryOperator(conn_id='hive_server2',
                                task_id='test_sql_execute_query_operator',
                                split_statements=True,
                                handler=output,
                                sql=sql)

    a.execute({})
