import type {TabsProps} from 'antd';
import {Tabs} from "antd";
// import TrinoLogoWBk from "./icons/TrinoLogoWBk.tsx";
// import {AppleOutlined} from "@ant-design/icons";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {sql} from "@codemirror/lang-sql";
import React, {forwardRef, useImperativeHandle} from "react";

interface MainTabsProps {
    autoExp?: boolean
}

export interface MainTabsRef {
    openConsole: () => void;
}

// =============================================
const MainTabs = forwardRef<MainTabsRef, MainTabsProps>((tabProps, ref) => {


    console.debug(tabProps);

    const [codeMirrorEditorView, setCodeMirrorEditorView] = React.useState<EditorView | null>(null)


    // ================== on editor SQL change

    // =================== on editor SQL change


    const onSQLChange = () => {
        console.debug(codeMirrorEditorView)
        console.debug("onSQLChange call")
    }

    // ==================== set default tabs
    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <p>dag</p>,
            children: <p>DAG</p>,
        },
        {
            key: '2',
            label: <p>sql</p>,
            children: <div style={{height: '20px'}}>
                <CodeMirror onCreateEditor={setCodeMirrorEditorView} value="" theme="light"
                            height="180px" onChange={onSQLChange} extensions={[sql()]}/>
            </div>,
        },
    ];


    // =======================
    const openConsole = () => {
        console.debug("===call fetchTreeData====")
    }


    // ======================= register ref methods
    useImperativeHandle(ref, () => ({
        openConsole,
    }));


    // ========================
    return <Tabs defaultActiveKey="1" items={tabItems}/>;
});

export default MainTabs;