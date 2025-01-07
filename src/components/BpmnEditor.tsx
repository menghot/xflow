import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
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
import {AxiosError} from "axios";
import {Canvas} from "bpmn-js/lib/features/context-pad/ContextPadProvider";
import SqlResult, {SqlResultRef} from "./SqlResult.tsx";

import {Button, notification, Select, Splitter, Tabs, type TabsProps} from 'antd';
import api from "../services/api";
import {
    CaretRightOutlined,
    DeploymentUnitOutlined,
    DownloadOutlined,
    ExportOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    SmileOutlined,
    TableOutlined
} from "@ant-design/icons";

interface QueryResponse {
    status: string;
    message: string;
    data: Record<string, never>[]; // Array of data rows, each row is a key-value pair
    headers: string[]; // Column names (headers) from the SQL query result
}

export interface BpmnEditorRef {
    openFile: (path: string, modeler: BpmnModeler) => void;
}

interface BpmnEditorProps {
    autoExp?: boolean,
    filePath: string
}

const BpmnEditor = forwardRef<BpmnEditorRef, BpmnEditorProps>((bpmnProps, ref) => {

    const [notifier, contextHolder] = notification.useNotification();
    // bpmn js
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const [currentNode, setCurrentNode] = React.useState("");
    const [editorText, setEditorText] = React.useState("");

    // code mirror editor
    const [editorView, setEditorView] = React.useState<EditorView | null>(null)

    // query tables
    const [loading, setLoading] = useState<boolean>(false); // Loading state for button
    const sqlResultRef = useRef<SqlResultRef>(null);
    const [activeKey, setActiveKey] = useState<string>('');

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <span><HistoryOutlined/> Query History</span>,
            children: "",
        }, {
            key: '2',
            label: <span><TableOutlined/> Results</span>,
            children: <SqlResult ref={sqlResultRef}/>,
        }, {
            key: '3',
            label: <span><InfoCircleOutlined/> Execution Logs</span>,
            children: "",
        },
    ];

    const exportBpmn = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                if (xml) {
                    download(xml, 'diagram.bpmn', 'application/xml');
                }
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    };

    const saveBpmn = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                await api.post('/api/bpmn/save?file_path=' + bpmnProps.filePath, xml, {
                    headers: {
                        'Content-Type': 'application/xml' // Specify the Content-Type
                    }
                }).then(response => {
                    console.log('Response:', response.data);
                    notifier.open({
                        message: 'Save bpmn success',
                        description: 'File path ' + bpmnProps.filePath,
                        icon: <SmileOutlined style={{color: '#108ee9'}}/>,
                    });

                })
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    };


    // const previewAsDag = async () => {
    //     try {
    //         if (modeler) {
    //             const {xml} = await modeler.saveXML({format: true});
    //             api.post('/api/bpmn/preview', xml, {
    //                 headers: {
    //                     'Content-Type': 'application/xml' // Specify the Content-Type
    //                 }
    //             })
    //                 .then(response => {
    //                     console.log('Response:', response.data);
    //                 })
    //                 .catch(error => {
    //                     console.error('Error:', error.response ? error.response.data : error.message);
    //                 });
    //         }
    //     } catch (err) {
    //         console.error('Failed to export BPMN model', err);
    //     }
    // }

    const deployDag = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                api.post('/api/bpmn/deploy', xml, {
                    headers: {
                        'Content-Type': 'application/xml' // Specify the Content-Type
                    }
                })
                    .then(response => {
                        console.log('Response:', response.data);
                        //setApiStatus("success")
                        notifier.open({
                            message: 'Deploy dag success',
                            description: 'File path ' + response.data.dag_file,
                            icon: <SmileOutlined style={{color: '#108ee9'}}/>,
                        });

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

            console.log("open file ===========> ", bpmnProps.filePath)


            openFile(bpmnProps.filePath, modeler);

            const eventBus = modeler.get('eventBus');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            eventBus.on('element.click', ({element}) => {
                const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
                console.log(elementRegistry)
                setCurrentNode(element.id)
                const docs = element.businessObject.documentation || [];
                if (docs.length > 0) {
                    setEditorText(docs[0].text);
                } else {
                    setEditorText('')
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

    const openFile = async (path: string, modelerRef: BpmnModeler) => {
        try {
            setLoading(true);
            const response = await api.get<string>(`api/dag/get-file-content?path=${encodeURIComponent(path)}`, {
                headers: {'Content-Type': 'text/plain'}
            });

            if (modelerRef) {
                modelerRef.importXML(response.data).then(() => {
                    const canvas: Canvas = modelerRef.get('canvas')
                    canvas.zoom('fit-viewport');
                }).catch((err) => {
                    console.error('Error loading BPMN diagram:', err);
                });
            } else if (modeler) {
                modeler.importXML(response.data).then(() => {
                    const canvas: Canvas = modeler.get('canvas')
                    canvas.zoom('fit-viewport');
                }).catch((err) => {
                    console.error('Error loading BPMN diagram:', err);
                });
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    }

    useImperativeHandle(ref, () => ({
        openFile,
    }));


    const onCanvasResize = (sizes: number[]) => {
        console.log(sizes)
        if (modeler) {
            const canvas: Canvas = modeler.get('canvas')
            canvas.zoom('fit-viewport');
        }
    }

    const onSQLChange = (v: string) => {
        setEditorText(v)

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

    const onChange = (activeKey: string) => {
        setActiveKey(activeKey)
    }
    const executeQuery = async () => {
        setLoading(true);
        setActiveKey("2")
        let sql = editorText;
        if (editorView) {
            // run selected sql if any
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            if (selected !== '') {
                sql = selected
            }
        }

        try {
            const result = await api.post<QueryResponse>('/api/sql/query', {
                conn_id: 'postgres_default',
                sql: sql,
            });
            sqlResultRef?.current?.setQueryResponse(result.data)

        } catch (err) {
            const error = err as AxiosError;
            console.error('Error executing SQL query:', error);
        } finally {
            setLoading(false);
        }
    };

    return <div style={{padding: "6px"}}>
        {contextHolder}
        <div>
            <Button style={{margin: "4px"}} icon={<DownloadOutlined/>} onClick={() => exportAsImage('svg')}
                    size="small">Export SVG
                Diagram</Button>
            <Button style={{margin: "4px"}} icon={<ExportOutlined/>} onClick={exportBpmn} size="small">Export Pipeline
                Diagram</Button>
            <Button style={{margin: "4px"}} type="primary" icon={<SaveOutlined/>} onClick={saveBpmn} size="small">Save
                Diagram</Button>
            {/*<Button onClick={previewAsDag} size="small" disabled={loading}>Preview Dag</Button>*/}
            <Button style={{margin: "4px"}} type="primary" icon={<DeploymentUnitOutlined/>} onClick={deployDag}
                    size="small" disabled={loading}>Deploy To Airflow</Button>
        </div>
        <Splitter layout="vertical" style={{height: "100vh"}}>
            <Splitter.Panel defaultSize="30%" max="90%">

                <Splitter onResizeEnd={onCanvasResize}
                          style={{height: "620px", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
                    <Splitter.Panel defaultSize="82%" min="20%" max="90%">
                        <div ref={containerRef} style={{width: '100%', height: '100%'}}></div>
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div ref={propertiesRef}></div>
                    </Splitter.Panel>
                </Splitter>
            </Splitter.Panel>

            <Splitter.Panel defaultSize="20%">
                <CodeMirror height="300px" onCreateEditor={setEditorView} value={editorText} theme="light"
                            onChange={onSQLChange} extensions={[sql()]}/>
            </Splitter.Panel>

            <Splitter.Panel>
                <div style={{padding: "6px 6px 0 0"}}>
                    <Button icon={<CaretRightOutlined/>} type="primary" onClick={executeQuery} size="small"
                            disabled={loading}>Execute SQL</Button>
                    <span style={{padding: "20px"}}>Limit:
                        <Select size={"small"}
                                defaultValue="100"
                                style={{width: 80}}
                                options={[
                                    {value: '10', label: '10'},
                                    {value: '100', label: '100'},
                                    {value: '1000', label: '1000'},
                                ]}
                        />
                    </span>
                </div>
                <div>TODO: Set Status</div>
                <div>
                    <Tabs size={"small"} onChange={onChange} activeKey={activeKey} items={tabItems}/>
                </div>
            </Splitter.Panel>
        </Splitter></div>


});

export default BpmnEditor;
