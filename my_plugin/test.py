import sqlalchemy

if __name__ == '__main__':
    engine = sqlalchemy.create_engine("postgresql://airflow:airflow@127.0.0.1:5432/airflow")
    with engine.connect() as conn:
        print(conn.execute("SELECT 1").fetchall())
        conn.close()
