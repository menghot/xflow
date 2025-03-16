from sqlalchemy import create_engine


def execute_sql():
    # Create a connection string using PyHive
    conn_str = "hive://localhost:10000/ods"  # Example connection string (adjust host/port)

    # Create SQLAlchemy engine with PyHive
    engine = create_engine(conn_str)

    # Create a connection from SQLAlchemy engine
    with engine.connect() as conn:
        print(conn)
        # Execute an SQL query
        result = conn.execute("create table ods.c5 using iceberg as SELECT * FROM ods.customer LIMIT 10")

        for row in result:
            print(row)


if __name__ == '__main__':

    # Create a connection string using PyHive
    execute_sql()

