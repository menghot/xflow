import {Button, Select, Splitter, Tabs, type TabsProps} from "antd";
import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import api from "../services/api.ts";
import {CaretRightOutlined, HistoryOutlined, InfoCircleOutlined, TableOutlined} from "@ant-design/icons";
import {sql} from "@codemirror/lang-sql";
import {AxiosError} from "axios";
import SqlResult, {SqlResultRef} from "./SqlResult.tsx";


interface SqlEditorProps {
    autoExp?: boolean,
    filePath?: string
}

export interface SqlEditorRef {
    openFile: (path: string) => void;
}


interface QueryResponse {
    status: string;
    message: string;
    data: Record<string, never>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}

const SqlEditor = forwardRef<SqlEditorRef, SqlEditorProps>((sqlEditorProps, ref) => {
    const [editorView, setEditorView] = React.useState<EditorView | null>(null)
    const [editorText, setEditorText] = React.useState<string | undefined>("")
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button
    const [activeKey, setActiveKey] = useState<string>('');

    const sqlResultRef = useRef<SqlResultRef>(null);
    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <span><HistoryOutlined/> Query History</span>,
            children: "",
        }, {
            key: '2',
            label: <span><TableOutlined/> Results</span>,
            children: <SqlResult ref={sqlResultRef}/>,
        }, {
            key: '3',
            label: <span><InfoCircleOutlined/> Execution Logs</span>,
            children: "",
        },
    ];


    const onSQLChange = () => {
        console.debug(editorView)
        console.debug(sqlEditorProps)
        console.debug(ref)
    }

    const openFile = async (path: string | undefined) => {
        try {
            setLoading(true);
            if (path) {
                const response = await api.get<string>(`api/dag/get-file-content?path=${encodeURIComponent(path)}`, {
                    headers: {'Content-Type': 'text/plain'}
                });
                setEditorText(response.data)
            }

        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const onCreateEditor = (view: EditorView) => {
        setEditorView(view)
        openFile(sqlEditorProps.filePath).then()
    }


    useImperativeHandle(ref, () => ({
        openFile,
    }));

    const executeQuery = async () => {
        setActiveKey("2")
        setLoading(true);
        sqlResultRef?.current?.setLoadingStatus(true);
        let sql = editorText;
        if (editorView) {
            // run selected sql if any
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            if (selected !== '') {
                sql = selected
            }
        }

        try {
            const result = await api.post<QueryResponse>('/api/sql/query', {
                conn_id: 'postgres_default',
                sql: sql,
            });
            setLoading(false);
            sqlResultRef?.current?.setQueryResponse(result.data)

        } catch (err) {
            const error = err as AxiosError;
            console.error('Error executing SQL query:', error);
        } finally {
            setLoading(false);
            sqlResultRef?.current?.setLoadingStatus(false);
        }
    };

    const onChange = (activeKey: string) => {
        setActiveKey(activeKey)
    }


    return <div style={{padding: "6px"}}>
        <div>TODO: Implement tool bar include db connection & execution configuration</div>
        <Splitter layout="vertical" style={{height: "100vh"}}>
            <Splitter.Panel defaultSize="30%" min="10%" max="90%">
                <CodeMirror height="300px" onCreateEditor={onCreateEditor} value={editorText} theme="light"
                            onChange={onSQLChange} extensions={[sql()]}/>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="70%">
                <div style={{padding: "6px 6px 0 0"}}>
                    <Button icon={<CaretRightOutlined/>} type="primary" onClick={executeQuery} size="small"
                            disabled={loading}>Execute SQL</Button>
                    <span style={{padding: "20px"}}>Limit:
                        <Select size={"small"}
                                defaultValue="100"
                                style={{width: 80}}
                                options={[
                                    {value: '10', label: '10'},
                                    {value: '100', label: '100'},
                                    {value: '1000', label: '1000'},
                                ]}
                        />
                    </span>
                </div>
                <div>TODO: Set Status</div>
                <div>
                    <Tabs size={"small"}
                          onChange={onChange}
                          activeKey={activeKey} items={tabItems}/>
                </div>
            </Splitter.Panel>
        </Splitter></div>
});
export default SqlEditor;