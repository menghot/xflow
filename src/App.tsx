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

    // const triggerFetch = () => {
    //     console.log('Triggering TreeDisplay fetch...');
    //     tableTreeRef.current?.fetchTreeData();
    //     mainTabsRef.current?.openConsole();
    // };

    const openFile = (path: string) => {
        mainTabsRef.current?.openEditor(path, 'dag');
    }

    return (
        <div>
            <div style={{padding: '0 0 0 20px'}}>
                <XcodeFlowIcon/>
            </div>
            {/*<div style={{width:"100vh",height:"50vh"}}><Dag dagFilePath=""/></div>*/}
            <div>
                <Splitter style={{height: "100dvh", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="18%" min="10%" max="100%">
                        <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 0px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel>
                                <div style={{backgroundColor: "#89e0e3"}}><DatabaseOutlined/> Connections & tables</div>
                                <TableTree ref={tableTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <div style={{backgroundColor: "#89e0e3"}}><UnorderedListOutlined/> File Explorer</div>
                                <FileTree openFile={openFile} ref={fileTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <div style={{backgroundColor: "#89e0e3"}}><GithubOutlined/> Git Panel</div>
                                <div> .</div>
                                <div> TO BE IMPLEMENT</div>
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <MainTabs ref={mainTabsRef}/>
                        {/*<Splitter style={{height: 380, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>*/}
                        {/*    <Splitter.Panel defaultSize="82%" min="20%" max="90%">*/}
                        {/*        <TT/>*/}
                        {/*    </Splitter.Panel>*/}
                        {/*    /!*<Splitter.Panel>*!/*/}
                        {/*    /!*    <MainTabs ref={mainTabsRef} autoExp={true}/>*!/*/}
                        {/*    /!*</Splitter.Panel>*!/*/}
                        {/*</Splitter>*/}
                        {/*<Splitter layout="vertical" style={{height: 800}}>*/}
                        {/*<Splitter.Panel>*/}
                        {/*</Splitter.Panel>*/}
                        {/*<Splitter.Panel>*/}

                        {/*</Splitter.Panel>*/}
                        {/*</Splitter>*/}
                    </Splitter.Panel>
                </Splitter>

            </div>

        </div>
    );
};

export default App;
