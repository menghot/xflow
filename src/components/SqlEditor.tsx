import {Splitter, Tabs, type TabsProps} from "antd";
import React, {forwardRef, useImperativeHandle} from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import api from "../services/api.ts";
import {HistoryOutlined, InfoCircleOutlined, TableOutlined} from "@ant-design/icons";
import {sql} from "@codemirror/lang-sql";


const tabItems: TabsProps['items'] = [
    {
        key: '1',
        label: <span><HistoryOutlined/> Query History</span>,
        children: "",
    }, {
        key: '2',
        label: <span><TableOutlined/> Results</span>,
        children: "",
    }, {
        key: '3',
        label: <span><InfoCircleOutlined/> Execution Logs</span>,
        children: "",
    },
];

interface SqlEditorProps {
    autoExp?: boolean,
    filePath?: string
}

export interface SqlEditorRef {
    openFile: (path: string) => void;
}


const SqlEditor = forwardRef<SqlEditorRef, SqlEditorProps>((sqlEditorProps, ref) => {
    const [codeMirrorEditorView, setCodeMirrorEditorView] = React.useState<EditorView | null>(null)
    const [sqlText, setSqlText] = React.useState<string | undefined>("")
    const onSQLChange = () => {
        console.debug(codeMirrorEditorView)
        console.debug(sqlEditorProps)
        console.debug(ref)
    }

    const openFile = async (path: string | undefined) => {
        try {
            //setLoading(true);
            console.log(path)
            if (path) {
                const response = await api.get<string>(`api/dag/get-file-content?path=${encodeURIComponent(path)}`, {
                    headers: {
                        'Content-Type': 'text/plain',
                    }
                });
                setSqlText(response.data)
            }

        } catch (err) {
            console.log(err)
        } finally {
            //setLoading(false);
        }
    };

    const onCreateEditor = (view: EditorView) => {
        setCodeMirrorEditorView(view)
        openFile(sqlEditorProps.filePath).then()
    }


    useImperativeHandle(ref, () => ({
        openFile,
    }));


    return <div>
        <div style={{padding: "0 0 6 0"}}>TODO: Implement tool bar include db connection & execution configuration</div>
        <Splitter layout="vertical" style={{height: "100vh"}}>
            <Splitter.Panel defaultSize="30%" min="10%" max="90%">
                <CodeMirror height="300px" onCreateEditor={onCreateEditor} value={sqlText} theme="light"
                            onChange={onSQLChange} extensions={[sql()]}/>
            </Splitter.Panel>
            <Splitter.Panel>
                <div style={{padding: "6px"}}>TODO: SQL execution button & Paging size limit</div>
                <div style={{padding: "6px"}}>TODO: Set Status</div>
                <div style={{padding: "6px"}}>
                    <Tabs size={"small"} items={tabItems}/>
                </div>
            </Splitter.Panel>
        </Splitter></div>
});
export default SqlEditor;