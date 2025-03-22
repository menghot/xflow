import React, {useRef} from "react";
import XcodeFlowIcon from "./components/icons/Xcodeflow";
import {Splitter} from 'antd';
import TableTree, {TableTreeRef} from "./components/TableTree";
import FileTree, {FileTreeRef} from "./components/FileTree";
import MainTabs, {MainTabsRef} from "./components/MainTabs";
import {DatabaseOutlined, GithubOutlined, UnorderedListOutlined} from "@ant-design/icons";

const App: React.FC = () => {
    // References to sub components
    const tableTreeRef = useRef<TableTreeRef>(null);
    const fileTreeRef = useRef<FileTreeRef>(null);
    const mainTabsRef = useRef<MainTabsRef>(null);

    const openFile = (path: string) => {
        mainTabsRef.current?.openEditor(path, 'dag');
    }

    const onEditorConnectionChanged = (conn: string) => {
        tableTreeRef.current?.changeConnection(conn)
    }

    return (
        <div>
            <div style={{padding: '0 0 0 20px'}}>
                <XcodeFlowIcon/>
            </div>
            <div>
                <Splitter style={{height: "calc(100vh - 80px)", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="20%" min="10%" max="100%">
                        <Splitter layout="vertical" style={{boxShadow: '0 0 0px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel defaultSize="45%">
                                <div
                                    style={{
                                        position: "sticky",
                                        top: "0",
                                        left: "0",
                                        zIndex: "999",
                                        backgroundColor: "#89e0e3"
                                    }}>
                                    <DatabaseOutlined/> Connections & tables
                                </div>
                                <TableTree  ref={tableTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel defaultSize="45%">
                                <div
                                    style={{
                                        position: "sticky",
                                        top: "0",
                                        left: "0",
                                        zIndex: "999",
                                        backgroundColor: "#89e0e3"
                                    }}>
                                    <UnorderedListOutlined/> File Explorer
                                </div>
                                <FileTree openFile={openFile} ref={fileTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <div
                                    style={{
                                        position: "sticky",
                                        top: "0",
                                        left: "0",
                                        zIndex: "999",
                                        backgroundColor: "#89e0e3"
                                    }}>
                                    <GithubOutlined/> Git Panel
                                </div>
                                <div> TO BE IMPLEMENT</div>
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div style={{padding: "8px"}}>
                            <MainTabs onEditorConnectionChange={onEditorConnectionChanged} ref={mainTabsRef}/>
                        </div>

                    </Splitter.Panel>
                </Splitter>

            </div>

        </div>
    );
};

export default App;
