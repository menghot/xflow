// src/App.tsx
import React, {useRef} from "react";
import XcodeFlow from "./components/icons/Xcodeflow";
import {Splitter} from 'antd';
import TableTree, {TableTreeRef} from "./components/TableTree";
import DagFileTree , {DagFileTreeRef} from "./components/DagFileTree";
import MainTabs, {MainTabsRef} from "./components/MainTabs.tsx";
import TT from "./components/test_tabs.tsx";

const App: React.FC = () => {
    // reference sub components
    const tableTreeRef = useRef<TableTreeRef>(null);
    const dagFileTreeRef = useRef<DagFileTreeRef>(null);
    const mainTabsRef = useRef<MainTabsRef>(null);

    console.log("x-codeflow")
    // const triggerFetch = () => {
    //     console.log('Triggering TreeDisplay fetch...');
    //     tableTreeRef.current?.fetchTreeData();
    //     mainTabsRef.current?.openConsole();
    // };

    return (
        <div>
            <div style={{padding: '0 0 0 20px'}}>
                <XcodeFlow/>
            </div>
            <div>
                <Splitter style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="18%" min="10%" max="100%">
                        <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 0px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel>
                                <TableTree ref={tableTreeRef} />
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <DagFileTree ref={dagFileTreeRef}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                Git Panel
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <Splitter style={{height: 380, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel defaultSize="82%" min="20%" max="90%">
                                <TT/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <MainTabs ref={mainTabsRef} autoExp={true}/>
                            </Splitter.Panel>
                        </Splitter>
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
