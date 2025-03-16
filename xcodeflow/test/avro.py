import fastavro
import sys

def read_avro(file_path):
    """Reads and prints records from an Iceberg Avro file."""
    try:
        with open(file_path, "rb") as f:
            reader = fastavro.reader(f)
            for record in reader:
                print(record)  # Print each row
    except Exception as e:
        print(f"Error reading Avro file: {e}")

def main():
    """Main function to accept file path from command line."""
    if len(sys.argv) != 2:
        print("Usage: python read_iceberg_avro.py <path_to_avro_file>")
        sys.exit(1)

    file_path = sys.argv[1]
    print(f"Reading Iceberg Avro file: {file_path}")
    read_avro(file_path)

if __name__ == "__main__":
    main()
