import {Button, Flex, Splitter} from "antd";
import React, {forwardRef, useImperativeHandle} from "react";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {python} from "@codemirror/lang-python";
import api from "../services/api.ts";
import {CheckOutlined, SaveOutlined} from "@ant-design/icons";
import DagGraph from "./DagGraph.tsx";

interface SqlEditorProps {
    autoExp?: boolean,
    filePath?: string
}

export interface SqlEditorRef {
    openFile: (path: string) => void;
}


const DagEditor = forwardRef<SqlEditorRef, SqlEditorProps>((sqlEditorProps, ref) => {
    const [codeMirrorEditorView, setCodeMirrorEditorView] = React.useState<EditorView | null>(null)
    const [editorText, setEditorText] = React.useState<string | undefined>("")
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
                const response = await api.get<string>(`api/file/get-file-content?path=${encodeURIComponent(path)}`, {
                    headers: {
                        'Content-Type': 'text/plain',
                    }
                });
                setEditorText(response.data)
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

    const save = () => {

    }

    return <div style={{padding: "6px"}}>
        <Splitter layout="vertical" style={{height: "calc(100vh - 180px)"}}>
            <Splitter.Panel defaultSize="30%" min="10%" max="90%">
                <Flex gap="small" justify={"right"} align={"flex-end"}>
                    <Button onClick={save}
                            size={"small"}
                            icon={<CheckOutlined/>}/>
                    <Button onClick={save}
                            size={"small"}
                            icon={<SaveOutlined/>}/>
                </Flex>
                <CodeMirror height="300px" onCreateEditor={init} value={editorText} theme="light"
                            onChange={onSQLChange} extensions={[python()]}/>

            </Splitter.Panel>
            <Splitter.Panel defaultSize="70%">
                <div style={{padding: "1px", backgroundColor: "#89e0e3"}}></div>
                <div style={{position: "sticky", top: "30px", marginLeft: "30px"}}><span
                    color={"#223300"}>DAG Preview</span></div>
                <DagGraph dagFilePath={""}/>
            </Splitter.Panel>
        </Splitter></div>
});
export default DagEditor;