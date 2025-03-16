import {Button, Flex, notification, Select, Tabs, type TabsProps} from "antd";
import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import api from "../services/api.ts";
import {
    BugOutlined,
    CaretRightOutlined,
    CheckOutlined,
    HistoryOutlined,
    SaveOutlined,
    SmileOutlined,
    TableOutlined
} from "@ant-design/icons";
import {sql} from "@codemirror/lang-sql";
import {AxiosError} from "axios";
import SqlResult, {SqlResultRef} from "./SqlResult.tsx";


interface SqlEditorProps {
    filePath?: string //load file from file path
    height?: string
    embedded?: boolean
    text?: string  // init editor text
    onEditorChange?: (text: string) => void  //the call back to for notifier
}

export interface SqlEditorRef {
    openFile: (path: string) => void;
    setEditorText: (text: string) => void;
    setConnId: (conn_id: string) => void;
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
    const [connId, setConnId] = React.useState<string | undefined>("")
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button
    const [activeKey, setActiveKey] = useState<string>('');
    const [notifier, contextHolder] = notification.useNotification();
    const [btnText, setBtnText] = React.useState<string>("Execute ")

    const sqlResultRef = useRef<SqlResultRef>(null);
    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <span><TableOutlined/> Results</span>,
            children: <SqlResult ref={sqlResultRef}/>,
        }, {
            key: '2',
            label: <span><HistoryOutlined/> Query History</span>,
            children: "",
        }, {
            key: '3',
            label: <span><BugOutlined/> Execution Logs</span>,
            children: "",
        },
    ]

    const connections = [
        {
            value: 'trino-default',
            label: 'trino-default'
        },
        {
            value: 'postgres-default',
            label: 'postgres-default'
        },
    ]


    const openFile = async (path: string | undefined) => {
        try {
            setLoading(true);
            if (path) {
                const response = await api.get<string>(`api/file/get-file-content?path=${encodeURIComponent(path)}`, {
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
        openFile, setEditorText, setConnId
    }));

    const executeQuery = async () => {
        setActiveKey("1")
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
                conn_id: connId,
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

    const onTabsChange = (activeKey: string) => {
        setActiveKey(activeKey)
    }


    const onEditorChange = (value: string) => {
        setEditorText(value)
        // Trigger call back
        if (sqlEditorProps.onEditorChange) {
            sqlEditorProps.onEditorChange(value)
        }
    }


    const save = async () => {
        try {
            await api.post('/api/file/save?file_path=' + sqlEditorProps.filePath, editorText, {
                headers: {
                    'Content-Type': 'text/plain',
                }
            }).then(response => {
                console.log('Response:', response.data);
                notifier.open({
                    message: 'Save file success',
                    description: 'File path ' + sqlEditorProps.filePath,
                    icon: <SmileOutlined style={{color: '#108ee9'}}/>,
                });
            })

        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    };

    const getToolbar = () => {
        if (!sqlEditorProps.embedded) {
            return <Flex gap="small" justify={"right"} align={"flex-end"}>
                <Select size={"small"}
                        defaultValue="trino-default" placeholder={"connection"}
                        style={{width: "160px"}}
                        options={connections}/>
                <Button onClick={save}
                        size={"small"}
                        icon={<CheckOutlined/>}/>
                <Button onClick={save}
                        size={"small"}
                        icon={<SaveOutlined/>}/>
            </Flex>
        }
    }


    const onEditorMouseOver = () => {
        if (editorView) {
            // run selected sql if any
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            if (selected !== '') {
                setBtnText("Execute Selected Query ");
            } else {
                setBtnText("Execute Query ");
            }

        }
    }


    return <div>
        {contextHolder}
        {getToolbar()}
        <div className={"my-border"} >
            <CodeMirror height={sqlEditorProps.height}
                        onCreateEditor={onCreateEditor}
                        onMouseMove={onEditorMouseOver}
                        onClickCapture={onEditorMouseOver}
                        value={editorText} theme="light"
                        onChange={onEditorChange}
                        extensions={[sql()]}/>
        </div>
        <div style={{padding: "6px 6px 0 0"}}>
            <Button icon={<CaretRightOutlined/>}
                    type="primary"
                    onClick={executeQuery}
                    size="small"
                    disabled={loading}>{btnText}</Button>
            <span style={{padding: "20px"}}>LIMIT:
                <Select size={"small"}
                        defaultValue="100"
                        style={{width: 80}}
                        options={[
                            {value: '10', label: '10'},
                            {value: '100', label: '100'},
                            {value: '1000', label: '1000'},
                        ]}/>
            </span>
        </div>
        <div style={{marginTop: "10px"}}>
            <Tabs size={"small"}
                  onChange={onTabsChange}
                  activeKey={activeKey} items={tabItems}/>
        </div>
    </div>
});
export default SqlEditor;