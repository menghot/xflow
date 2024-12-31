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

interface ResponseData {
    status: string;
    message: string;
    data: Record<string, never>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}

const BpmnEditorComponent: React.FC = () => {
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
                const result = await myApi.post<ResponseData>('/bpmn/preview', {
                    dag_id: 'simple_dag',
                    bpmn_xml: xml,
                });
                console.log(result)
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


    const onChange = (v: string) => {
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

    return <div>

        <div style={{display: 'flex', height: '380px'}}>
            <div ref={containerRef} style={{width: '78%', border: '1px solid #ccc'}}></div>
            <div ref={propertiesRef} style={{width: '22%', border: '1px solid #ccc', borderLeft: 'none'}}></div>
        </div>

        <div>
            <button onClick={() => exportAsImage('svg')} style={{margin: '10px'}}>Export SVG Diagram</button>
            <button onClick={() => exportDiagram()} style={{margin: '10px'}}>Export Diagram</button>
            <button onClick={executeSqlQuery} disabled={loading} style={{margin: '10px'}}>Execute SQL</button>
            <button onClick={previewBpmn2dag} disabled={loading} style={{margin: '10px'}}>Preview Dag</button>
            <button onClick={executeSqlQuery} disabled={loading} style={{margin: '10px'}}>Deploy To Airflow</button>
        </div>

        <div style={{height: '200px'}}>
            <CodeMirror onCreateEditor={setEditorView} value={sqlText} theme="light"
                        height="180px" onChange={onChange} extensions={[sql()]}/>
        </div>

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

    </div>;
};


export default BpmnEditorComponent;
