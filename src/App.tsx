// src/App.tsx
import React, {useRef} from "react";
import XcodeFlow from "./components/icons/Xcodeflow";
import {Button, Splitter} from 'antd';
import TableTree, {TableTreeRef} from "./components/TableTree";

const App: React.FC = () => {

    const treeDisplayRef = useRef<TableTreeRef>(null);

    const triggerFetch = () => {
        console.log('Triggering TreeDisplay fetch...');
        treeDisplayRef.current?.fetchTreeData();
    };


    return (
        <div>
            <div style={{padding: '0 0 0 20px'}}>
                <XcodeFlow/>
            </div>
            <div>
                <Splitter style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="15%" min="10%" max="100%">
                        <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel>
                                <TableTree ref={treeDisplayRef} autoExp={true}/>
                            </Splitter.Panel>
                            <Splitter.Panel>
                                <div>bpmn & dags files</div>
                                <Button onClick={triggerFetch}>Fetch Connection Tree</Button>
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <Splitter style={{height: 380, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel defaultSize="82%" min="20%" max="90%">
                            </Splitter.Panel>
                            <Splitter.Panel>
                            </Splitter.Panel>
                        </Splitter>
                        <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                            <Splitter.Panel>

                            </Splitter.Panel>
                            <Splitter.Panel>

                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                </Splitter>

            </div>

        </div>
    );
};

export default App;
