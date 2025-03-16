import pyarrow.parquet as pq

if __name__ == "__main__":
    # Load the Parquet file
    parquet_file = pq.ParquetFile("data.parquet")

    # Read only column1
    col1_table = parquet_file.read(columns=["c_customer_sk"])

    # Convert to Pandas
    col1_df = col1_table.to_pandas()

    # Get row indices where column1 > 100
    filtered_indices = col1_df[col1_df["c_customer_sk"] < 200].index

    # Read only column2
    col2_table = parquet_file.read(columns=["c_customer_id"])
    col2_df = col2_table.to_pandas()

    # Retrieve values from column2 using filtered indices
    filtered_col2 = col2_df.iloc[filtered_indices]

    # Combine column1 & column2 as row data
    result = col1_df.iloc[filtered_indices].assign(c_customer_id=filtered_col2["c_customer_id"])
    print(result)
