import pyarrow.parquet as pq

# from xcodeflow.main.avro import read_avro


def load_parquet(path):
    # Load the Parquet file
    parquet_file = pq.ParquetFile(path)

    # Print File Metadata (Schema and Row Group Info)
    print("=== File Metadata ===")
    print(parquet_file.metadata)

    # Print Schema
    print("\n=== Schema ===")
    print(parquet_file.schema)

    # Iterate through row groups
    num_row_groups = parquet_file.num_row_groups
    print(f"\n=== Row Groups: {num_row_groups} ===")

    for i in range(num_row_groups):
        row_group_metadata = parquet_file.metadata.row_group(i)
        print(f"\nRow Group {i + 1}:")

        num_columns = row_group_metadata.num_columns
        for col_idx in range(num_columns):
            column_metadata = row_group_metadata.column(col_idx)

            print(f"\n  Column {col_idx + 1}: {column_metadata.path_in_schema}")
            print(f"    Encoded Size: {column_metadata.total_compressed_size} bytes")
            print(f"    Uncompressed Size: {column_metadata.total_uncompressed_size} bytes")
            print(f"    Values: {column_metadata.num_values}")

            # Print statistics (min, max, null_count, distinct_count)
            stats = column_metadata.statistics
            print(stats)

            if stats:
                print(f"    Min: {stats.min}")
                print(f"    Max: {stats.max}")
                print(f"    Null Count: {stats.null_count}")
                print(f"    Distinct Count: {stats.distinct_count}")

    # Print Row Group Page Information
    print("\n=== Page Info ===")
    for i in range(num_row_groups):
        row_group = parquet_file.metadata.row_group(i)
        for col_idx in range(row_group.num_columns):
            column = row_group.column(col_idx)
            print(f"\nRow Group {i + 1}, Column {col_idx + 1} ({column.path_in_schema}):")
            print(f"    Number of Pages: {column.num_values // 1000}")  # Approximation


def main():
    load_parquet('data.parquet')
    table = pq.read_table("data.parquet", columns=["c_customer_sk", "c_customer_id"])
    print(table.to_pandas())

if __name__ == "__main__":
    main()
