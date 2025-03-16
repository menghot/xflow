import sqlalchemy
from airflow.hooks.base import BaseHook

from xcodeflow.conn_plugin import ConnectionAccessPlugin


def execute_sql(conn_id, sql):
    """
    Execute a SQL query using the given Airflow connection ID.
    """
    # Remove last ";" if exists
    if sql.endswith(';'):
        sql = sql[:-1]

    try:
        print("connections size: ", len(ConnectionAccessPlugin.list_connections()))

        # Get connection details from Airflow
        connection = BaseHook.get_connection(conn_id)
        print(connection, connection.conn_type)
        conn_url = f"{connection.conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"
        if connection.conn_type == 'postgres':
            conn_type = 'postgresql'
            conn_url = f"{conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"

        elif connection.conn_type == 'spark_jdbc' or connection.conn_type == 'spark_sql':
            conn_type = 'hive'
            conn_url = f"{conn_type}://{connection.host}:{connection.port}/{connection.schema}"

        elif connection.conn_type == 'trino':
            conn_type = 'trino'
            conn_url = f"{conn_type}://{connection.login}:@{connection.host}:{connection.port}/{connection.schema}?ssl=false"

        print(conn_url)

        # Create a SQLAlchemy engine
        engine = sqlalchemy.create_engine(conn_url)

        # Execute the SQL query
        with engine.connect() as conn:
            result = conn.execute(sql)
            print(result)
            # Extract column headers
            if result.cursor:
                headers = [col[0] for col in result.cursor.description]
                data = [dict(row) for row in result.fetchall()]
            else:
                headers = []
                data = []

        return {"status": "success", "headers": headers, "data": data}

    except Exception as e:
        print(e)
        return {"status": "error", "message": str(e)}
