import {Splitter, Tabs, type TabsProps} from "antd";
import React, {forwardRef, useImperativeHandle} from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {python} from "@codemirror/lang-python";
import api from "../services/api.ts";


const tabItems: TabsProps['items'] = [
    {
        key: '1',
        label: "Query History",
        children: "",
    }, {
        key: '2',
        label: "Results",
        children: "",
    }, {
        key: '3',
        label: "Execution Logs",
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

    const init = (view: EditorView) => {
        setCodeMirrorEditorView(view)
        openFile(sqlEditorProps.filePath).then()
    }


    useImperativeHandle(ref, () => ({
        openFile,
    }));


    return <div>
        <div>tool bar include database connection</div>
        <Splitter layout="vertical" style={{height: "100vh"}}>
            <Splitter.Panel defaultSize="30%" min="10%" max="90%">
                <CodeMirror height="300px" onCreateEditor={init} value={sqlText} theme="light"
                            onChange={onSQLChange} extensions={[python()]}/>
            </Splitter.Panel>
            <Splitter.Panel>
                <div>status</div>
                <div>
                    <Tabs size={"small"} items={tabItems}/>
                </div>
            </Splitter.Panel>
        </Splitter></div>
});
export default SqlEditor;