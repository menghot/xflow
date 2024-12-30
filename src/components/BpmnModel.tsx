import React, {useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import diagram1 from '../assets/diagram3.bpmn?raw';
import diagram2 from '../assets/diagram2.bpmn?raw';

//bpmn css files is mandatory
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import CodeMirror, {EditorView} from '@uiw/react-codemirror';
// import {python} from '@codemirror/lang-python';
import {sql} from '@codemirror/lang-sql';

import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule} from 'bpmn-js-properties-panel';
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import {ElementRegistry} from "bpmn-js/lib/features/auto-place/BpmnAutoPlaceUtil";
import {Moddle} from "bpmn-js/lib/model/Types";
import axios from "axios";

// import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
interface ResponseData {
    status: string;
    data: Record<string, any>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}

const BpmnEditorComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setNode] = React.useState("");
    //const currentNodeDocRef = useRef<HTMLDivElement>(null);

    const [response, setResponse] = useState<ResponseData | null>(null); // Response from the API
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button

    const [modeler, setModeler] = useState<BpmnModeler | null>(null);

    const saveXml = () => {
        modeler?.saveXML().then(({xml}) => {
            console.log('Saved BPMN XML:', xml)
        }).catch((err) => {
            console.error('Error saving BPMN XML:', err)
        });
    }

    const load1 = () => {
        //togglePalette(true);

        console.log("load diagram1")
        //modeler?.clear()
        modeler?.importXML(diagram1).then(() => {
            // Optionally fit the diagram to the viewport
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            modeler.get('canvas').zoom('fit-viewport');
        }).catch((err) => {
            console.error('Error loading BPMN diagram:', err);
        });
    }

    const load2 = () => {
        //togglePalette(false);
        console.log("load diagram2")
        //modeler?.clear()
        modeler?.importXML(diagram2).then(() => {
            // Optionally fit the diagram to the viewport
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            modeler.get('canvas').zoom('fit-viewport');
        }).catch((err) => {
            console.error('Error loading BPMN diagram:', err);
        });
    }

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


    const exportAsImage = async (type: string) => {
        try {
            if (modeler) {
                if (type === 'svg') {
                    const {svg} = await modeler.saveSVG();
                    download(svg, 'diagram.svg', 'image/svg+xml');
                } else if (type === 'png') {
                    const {svg} = await modeler.saveSVG();
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    const svgBlob = new Blob([svg], {type: 'image/svg+xml'});
                    const svgUrl = URL.createObjectURL(svgBlob);

                    const image = new Image();
                    image.onload = () => {
                        canvas.width = image.width;
                        canvas.height = image.height;

                        // Draw the SVG onto the canvas
                        context?.drawImage(image, 0, 0);

                        // Convert the canvas to a PNG blob
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'diagram.png';
                                link.click();
                                URL.revokeObjectURL(url);
                            }
                        }, 'image/png');

                        URL.revokeObjectURL(svgUrl);
                    };

                    image.src = svgUrl;
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

            const eventBus = modeler.get('eventBus');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            eventBus.on('element.click', ({element}) => {
                console.log('Clicked element:', element);
                const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
                console.log(elementRegistry)

                setNode(element.id)
                const docs = element.businessObject.documentation || [];
                // update to editor
                if (docs.length > 0) {
                    setValue(docs[0].text);
                } else {
                    setValue('')
                }
                //alert(`Element clicked:ID: ${element.id} Type: ${element.type}`);
            });

            // set BpmnModeler loaded
            containerRef.current.setAttribute("loaded", "loaded");
        }


        return () => {
            //FIXME
            //modeler?.destroy();
        };
    }, [modeler]); // Only initialize once on component mount


    ////////////////////// code editor begin
    const [value, setValue] = React.useState("");

    //Keep editor reference for further use
    const [editorView, setEditorView] = React.useState<EditorView | null>(null)

    const onChange = (v: string) => {
        setValue(v)

        // Update to properties panel
        if (modeler) {
            const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(selectedNode)

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

    ////////////////////// code editor end
    const renderTable = (data: Record<string, any>[], headers: string[]) => {
        return (
            <table className="users-table">
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

        let sql = value;
        if (editorView) {
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            if (selected !== '') {
                sql = selected
            }
        }

        try {
            const result = await axios.post<ResponseData>('./sql/query', {
                conn_id: 'postgres_default', // Connection ID
                sql: sql,  // SQL query
            });
            setResponse(result.data); // Update response with API result
        } catch (error) {
            console.error('Error executing SQL query:', error);
            setResponse({status: 'error', data: [], headers: []}); // Update response in case of error
        } finally {
            setLoading(false);
        }
    };

    return <div>

        <div style={{display: 'flex', height: '320px'}}>
            <div ref={containerRef} style={{width: '78%', border: '1px solid #ccc'}}></div>
            <div ref={propertiesRef} style={{width: '22%', border: '1px solid #ccc', borderLeft: 'none'}}></div>
        </div>

        <div>
            <button onClick={load1} style={{margin: '10px'}}> Load Diagram 1</button>
            <button onClick={load2} style={{margin: '10px'}}>Load Diagram 2</button>
            <button onClick={saveXml} style={{margin: '10px'}}>Save Diagram</button>
            <button onClick={() => exportAsImage('svg')} style={{margin: '10px'}}>Export SVG1 Diagram</button>
            <button onClick={() => exportAsImage('png')} style={{margin: '10px'}}>Export png2 Diagram</button>
            <button onClick={() => exportDiagram()} style={{margin: '10px'}}>Export Diagram</button>
            <button onClick={executeSqlQuery} disabled={loading} style={{margin: '10px'}}>Execute SQL</button>
        </div>

        <div style={{height: '200px'}}>
            <CodeMirror style={{textAlign: 'left'}} onCreateEditor={setEditorView} value={value} theme="light"
                        height="180px" onChange={onChange}
                        extensions={[sql()]}/>
        </div>

        <div>

            {loading && <p>Loading...</p>}

            {response && response.status === 'success' && (
                <div>
                    <h5>Query Results</h5>
                    {renderTable(response.data, response.headers)}
                </div>
            )}

            {response && response.status === 'error' && (
                <div>
                    <h2>Error</h2>
                    <p>There was an error executing the query.</p>
                </div>
            )}
        </div>

    </div>;
};


export default BpmnEditorComponent;
