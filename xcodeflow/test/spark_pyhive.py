import pandas as pd
from pyhive import hive

if __name__ == '__main__':
    # Connect to Spark Thrift Server using PyHive
    with hive.Connection(host='localhost', port=10000, username='your_username', database='default') as conn:
        # Create a cursor to execute SQL queries
        cursor = conn.cursor()

        # Execute an SQL query
        cursor.execute("SELECT * FROM ods.customer LIMIT 10")

        # Fetch results
        results = cursor.fetchall()

        # Convert to a pandas DataFrame for easier manipulation (optional)
        df = pd.DataFrame(results, columns=[desc[0] for desc in cursor.description])

        # Display the results
        print(df)
