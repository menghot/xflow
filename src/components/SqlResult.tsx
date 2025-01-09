import {forwardRef, useImperativeHandle, useState} from "react";


interface SqlQueryResponse {
    status: string;
    message: string;
    data: Record<string, never>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}


export interface SqlResultRef {
    setLoadingStatus: (loading: boolean) => void
    setQueryResponse: (rsp: SqlQueryResponse) => void
}

interface SqlResultProps {
    autoExp?: boolean,
    filePath?: string
}

const SqlResult = forwardRef<SqlResultRef, SqlResultProps>((_, ref) => {

    //console.log(ref, sqlResultProps);
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button
    const [queryResponse, setSqlQueryResponse] = useState<SqlQueryResponse | null>(null);

    const renderTable = (data: Record<string, never>[], headers: string[]) => {
        return (
            <table className="query-tables">
                <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                            <td key={colIndex}>{row[header]}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    const setLoadingStatus = (loading: boolean) => {
        setLoading(loading)
    }

    const setQueryResponse = (rsp: SqlQueryResponse) => {
        setSqlQueryResponse(rsp);
    }


    useImperativeHandle(ref, () => ({
        setLoadingStatus, setQueryResponse
    }));


    return <div>
        {loading && <p>Loading...</p>}
        {queryResponse && queryResponse.status === 'success' && (
            <div>{renderTable(queryResponse.data, queryResponse.headers)}</div>
        )}
        {queryResponse && queryResponse.status === 'error' && (
            <div>
                <h2>Error</h2>
                <p>There was an error executing the query.</p>
            </div>
        )}
    </div>
});

export default SqlResult