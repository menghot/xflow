// src/App.tsx
import React, {useRef} from "react";
import XcodeFlowIcon from "./components/icons/Xcodeflow";
import {Splitter} from 'antd';
import TableTree, {TableTreeRef} from "./components/TableTree";
import DagFileTree, {DagFileTreeRef} from "./components/DagFileTree";
import TT, {TTRef} from "./components/test_tabs.tsx";
// import Dag from "./components/Dag.tsx";

const App: React.FC = () => {
    // reference sub components
    const tableTreeRef = useRef<TableTreeRef>(null);
    const dagFileTreeRef = useRef<DagFileTreeRef>(null);
    const ttRef = useRef<TTRef>(null);

    console.log("x-codeflow")
    // const triggerFetch = () => {
    //     console.log('Triggering TreeDisplay fetch...');
    //     tableTreeRef.current?.fetchTreeData();
    //     mainTabsRef.current?.openConsole();
    // };

    const editFile = (path: string) => {
        ttRef.current?.openEditor(path, 'dag');
    }

    return (
        <div>
            <div style={{padding: '0 0 0 20px'}}>
                <XcodeFlowIcon/>
            </div>
            {/*<div style={{width:"100vh",height:"50vh"}}><Dag dagFilePath=""/></div>*/}
            <div>
                <Splitter style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="18%" min="10%" max="100%">
                        <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 0px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel>
                                <TableTree ref={tableTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <DagFileTree editor={editFile} ref={dagFileTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                Git Panel
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <TT ref={ttRef}/>
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
