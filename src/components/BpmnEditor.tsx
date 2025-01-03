import React, {useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import diagram1 from '../assets/diagram3.bpmn?raw';

//bpmn css files is mandatory
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import CodeMirror, {EditorView} from '@uiw/react-codemirror';
import {sql} from '@codemirror/lang-sql';

import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule} from 'bpmn-js-properties-panel';
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import {ElementRegistry} from "bpmn-js/lib/features/auto-place/BpmnAutoPlaceUtil";
import {Moddle} from "bpmn-js/lib/model/Types";
import myApi from "../services/api"
import {AxiosError} from "axios";
import {Canvas} from "bpmn-js/lib/features/context-pad/ContextPadProvider";

import {Button, Splitter, Tabs} from 'antd';
import {SettingFilled, ThunderboltFilled, AppleOutlined} from '@ant-design/icons';
import type {TabsProps} from 'antd';
import TrinoLogoWBk from "./icons/TrinoLogoWBk.tsx";

interface ResponseData {
    status: string;
    message: string;
    data: Record<string, never>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}

const BpmnEditor: React.FC = () => {
    // bpmn js
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const [currentNode, setCurrentNode] = React.useState("");
    const [sqlText, setSqlText] = React.useState("");

    // code mirror editor
    const [editorView, setEditorView] = React.useState<EditorView | null>(null)

    // query tables
    const [queryResponse, setQueryResponse] = useState<ResponseData | null>(null); // Response from the API
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button


    const exportDiagram = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                if (xml) {
                    download(xml, 'diagram.bpmn', 'application/xml');
                } else {
                    console.error('Failed to export BPMN model');
                }
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    };

    const previewBpmn2dag = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                myApi.post('/api/bpmn/preview', xml, {
                    headers: {
                        'Content-Type': 'application/xml' // Specify the Content-Type
                    }
                })
                    .then(response => {
                        console.log('Response:', response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error.response ? error.response.data : error.message);
                    });
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    }

    const deploy = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                myApi.post('/api/bpmn/deploy', xml, {
                    headers: {
                        'Content-Type': 'application/xml' // Specify the Content-Type
                    }
                })
                    .then(response => {
                        console.log('Response:', response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error.response ? error.response.data : error.message);
                    });
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    }


    const exportAsImage = async (type: string) => {
        try {
            if (modeler) {
                if (type === 'svg') {
                    const {svg} = await modeler.saveSVG();
                    download(svg, 'diagram.svg', 'image/svg+xml');
                }
            }
        } catch (err) {
            console.error(`Failed to export diagram as ${type}`, err);
        }
    };

    const download = (data: string, filename: string, mimeType: string) => {
        const blob = new Blob([data], {type: mimeType});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    };


    // const togglePalette = (visible:boolean) => {
    //     const palette = document.querySelector('.djs-palette');
    //     if (palette) {
    //         palette.style.display = visible ? 'block' : 'none';
    //     }
    // };

    useEffect(() => {
        if (containerRef.current && containerRef.current.getAttribute("loaded") !== "loaded") {
            const modeler = new BpmnModeler({
                container: containerRef.current!,
                additionalModules: [BpmnPropertiesPanelModule, BpmnPropertiesProviderModule],
                propertiesPanel: {
                    parent: propertiesRef.current,
                },
            })
            setModeler(modeler);

            // import a default diagram
            modeler.importXML(diagram1).then(() => {
                const canvas: Canvas = modeler.get('canvas')
                canvas.zoom('fit-viewport');
            }).catch((err) => {
                console.error('Error loading BPMN diagram:', err);
            });

            const eventBus = modeler.get('eventBus');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            eventBus.on('element.click', ({element}) => {
                const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
                console.log(elementRegistry)
                setCurrentNode(element.id)
                const docs = element.businessObject.documentation || [];
                if (docs.length > 0) {
                    setSqlText(docs[0].text);
                } else {
                    setSqlText('')
                }
            });

            // set BpmnModeler loaded
            containerRef.current.setAttribute("loaded", "loaded");
        }

        return () => {
            //FIXME
            //modeler?.destroy();
        };
    }, []);

    const onCanvasResize = (sizes: number[]) => {
        console.log(sizes)
        if (modeler) {
            const canvas: Canvas = modeler.get('canvas')
            canvas.zoom('fit-viewport');
        }
    }

    const onSQLChange = (v: string) => {
        setSqlText(v)

        // Sync to properties panel
        if (modeler) {
            const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(currentNode)

            if (element) {
                let docs = element.businessObject.documentation || [];
                if (docs.length === 0) {
                    const moddle: Moddle = modeler.get('moddle');
                    docs = [...docs, moddle.create('bpmn:Documentation', {text: v})]
                } else {
                    docs[0].text = v
                }

                // update properties panel
                const modeling: Modeling = modeler.get('modeling');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                modeling.updateModdleProperties(element, element.businessObject, {
                    documentation: docs,
                });
            }
        }
    };

    const renderTable = (data: Record<string, never>[], headers: string[]) => {
        return (
            <table className="query-tables">
                <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                            <td key={colIndex}>{row[header]}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    const executeSqlQuery = async () => {
        setLoading(true);

        let sql = sqlText;
        if (editorView) {
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            if (selected !== '') {
                sql = selected
            }
        }

        try {
            const result = await myApi.post<ResponseData>('/api/sql/query', {
                conn_id: 'postgres_default',
                sql: sql,
            });
            setQueryResponse(result.data); // Update response with API result
        } catch (err) {
            const error = err as AxiosError;
            console.error('Error executing SQL query:', error);
            setQueryResponse({status: 'error', message: error.message, data: [], headers: []}); // Update response in case of error
        } finally {
            setLoading(false);
        }
    };

    const onTabChange = (key: string) => {
        console.log(key);
    };

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <p><TrinoLogoWBk size={14} color={'black'}/>dag</p>,
            children: <p>DAG</p>,
        },
        {
            key: '2',
            label: <p><AppleOutlined/>sql</p>,
            children: <div style={{height: '200px'}}>
                <CodeMirror onCreateEditor={setEditorView} value={sqlText} theme="light"
                            height="180px" onChange={onSQLChange} extensions={[sql()]}/>
            </div>,
        },
    ];

    return <div>

        <Splitter style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
            <Splitter.Panel defaultSize="15%" min="10%" max="100%">
                <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div>bpmn & dags files</div>
                    </Splitter.Panel>
                </Splitter>
            </Splitter.Panel>
            <Splitter.Panel>
                <Splitter onResizeEnd={onCanvasResize} style={{height: 380, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="82%" min="20%" max="90%">
                        <div ref={containerRef} style={{width: '100%', height: '100%'}}></div>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div ref={propertiesRef}></div>
                    </Splitter.Panel>
                </Splitter>
                <Splitter layout="vertical" style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel>
                        <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange}/>
                        <div>
                            <Button onClick={() => exportAsImage('svg')} size="small" style={{}}>Export SVG
                                Diagram</Button>
                            <Button onClick={() => exportDiagram()} size="small" style={{}}>Export Diagram</Button>
                            <Button onClick={executeSqlQuery} size="small" disabled={loading}
                                    style={{}}><ThunderboltFilled/>Execute
                                SQL</Button>
                            <Button onClick={previewBpmn2dag} size="small" disabled={loading} style={{}}>Preview
                                Dag</Button>
                            <Button onClick={deploy} size="small" disabled={loading} style={{}}>Deploy To
                                Airflow</Button>
                            <Button onClick={deploy} size="small" disabled={loading}><SettingFilled/>Deploy To
                                Airflow</Button>
                        </div>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div>
                            {loading && <p>Loading...</p>}
                            {queryResponse && queryResponse.status === 'success' && (
                                <div>
                                    <h5>Query Results</h5>
                                    {renderTable(queryResponse.data, queryResponse.headers)}
                                </div>
                            )}
                            {queryResponse && queryResponse.status === 'error' && (
                                <div>
                                    <h2>Error</h2>
                                    <p>There was an error executing the query.</p>
                                </div>
                            )}
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </Splitter.Panel>
        </Splitter>
    </div>;
};


export default BpmnEditor;
