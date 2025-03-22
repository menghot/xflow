import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-color-picker/colors/color-picker.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import custom from '../custom'

import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule} from 'bpmn-js-properties-panel';
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import {ElementRegistry} from "bpmn-js/lib/features/auto-place/BpmnAutoPlaceUtil";
// import {Moddle} from "bpmn-js/lib/model/Types";
import {Canvas} from "bpmn-js/lib/features/context-pad/ContextPadProvider";
import BpmnColorPickerModule from "bpmn-js-color-picker";

import {Button, Flex, notification,} from 'antd';
import api from "../services/api";
import {
    DeploymentUnitOutlined,
    DownloadOutlined,
    ExportOutlined,
    RedoOutlined,
    SaveOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import SqlEditor, {SqlEditorRef} from "./SqlEditor.tsx";
import CodeMirror from "@uiw/react-codemirror";
import {python} from "@codemirror/lang-python";

import dagModdleDescriptor from '../custom/parts/DagDescriptor.json';

export interface BpmnEditorRef {
    openFile: (path: string, modeler: BpmnModeler) => void;
}

interface BpmnEditorProps {
    autoExp?: boolean,
    filePath: string,
    onEditorConnectionChange?: (connectId: string) => void
}

const BpmnEditor = forwardRef<BpmnEditorRef, BpmnEditorProps>((bpmnProps, ref) => {

    const [notifier, contextHolder] = notification.useNotification();
    const sqlEditorRef = useRef<SqlEditorRef>(null);
    //const dagPreviewRef = useRef<DagPreviewRef>(null);

    // bpmn js
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const [currentNode, setCurrentNode] = React.useState("");

    const [loading, setLoading] = useState<boolean>(false); // Loading state for button
    const [displayMode, setDisplayMode] = useState<string>("preview"); // Loading state for button

    const [dag, setDag] = React.useState("");

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

    const deployDag = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }


    const exportAsImage = async (type: string) => {
        try {
            if (modeler) {
                console.log("svg .....")
                if (type === 'svg') {
                    const {svg} = await modeler.saveSVG();
                    download(svg, 'diagram.svg', 'image/svg+xml');
                }
            } else {
                console.log("not ready .....")
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
                additionalModules: [custom, BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, BpmnColorPickerModule],
                propertiesPanel: {
                    parent: propertiesRef.current,
                }, moddleExtensions: {
                    magic: dagModdleDescriptor
                }
            })

            setModeler(modeler);
            console.debug("open file ===========> ", bpmnProps.filePath)
            openFile(bpmnProps.filePath, modeler).then()

            const eventBus = modeler.get('eventBus')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            eventBus.on('element.click', ({element}) => {
                const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
                console.log(elementRegistry, currentNode)
                console.log("eventBus 1: element.click ", element.businessObject)
                setCurrentNode(element.id)
                sqlEditorRef?.current?.setEditorText(element.businessObject.sql)
                if (element.businessObject.connection) {
                    if (bpmnProps.onEditorConnectionChange) {
                        bpmnProps.onEditorConnectionChange(element.businessObject.connection);
                    }
                    sqlEditorRef?.current?.updateConnectId(element.businessObject.connection);
                }
            })

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
            const response = await api.get<string>(`api/file/get-file-content?path=${encodeURIComponent(path)}`, {
                headers: {'Content-Type': 'text/plain'}
            });

            if (modelerRef) {
                modelerRef.importXML(response.data).then(() => {
                    const canvas: Canvas = modelerRef.get('canvas')
                    //canvas.zoom('fit-viewport');
                    canvas.zoom(0.82, {x: 0.5, y: 0.5})
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

    const onEditorChange = (text: string) => {
        if (modeler) {
            const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(currentNode)
            if (element) {
                // update properties panel
                const modeling: Modeling = modeler.get('modeling');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                modeling.updateModdleProperties(element, element.businessObject, {
                    sql: text,
                });
            }
        }
    }


    const onEditorConnectionChange = (v: string) => {

        if (modeler) {
            const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(currentNode)
            if (element) {
                console.log(currentNode, v, "--------------onEditorConnectionChange------------", element)
                const modeling: Modeling = modeler.get('modeling');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                modeling.updateModdleProperties(element, element.businessObject, {
                    connection: v,
                });
            }
            if (bpmnProps.onEditorConnectionChange) {
                bpmnProps.onEditorConnectionChange(v)
            }
        }

    }

    useImperativeHandle(ref, () => ({
        openFile,
    }));

    const [isExpanded, setIsExpanded] = useState(false);

    const togglePanel = () => {
        setIsExpanded((prev) => !prev);
    };


    const changeDisplayMode = () => {

        if (modeler) {
            const canvas: Canvas = modeler?.get('canvas');
            console.log(canvas.zoom());
            //console.log( canvas.zoom('fit-viewport'));
            if (dag === "") {
                generateDag().then();
            }
        }
        if (displayMode === "preview") {
            setDisplayMode("sql");
        } else {
            setDisplayMode("preview");
        }
    }

    const generateDag = async () => {
        try {
            if (modeler) {
                const {xml} = await modeler.saveXML({format: true});
                api.post('/api/bpmn/preview', xml, {
                    headers: {
                        'Content-Type': 'application/xml' // Specify the Content-Type
                    }
                })
                    .then(response => {
                        setDag(response.data.data)
                    })
                    .catch(error => {
                        console.error('Error:', error.response ? error.response.data : error.message);
                    });
            }
        } catch (err) {
            console.error('Failed to export BPMN model', err);
        }
    }


    return <div>
        <div style={{position: "sticky", paddingLeft: "0px", paddingBottom: "4px", zIndex: 999}}>
            <Flex gap="small" justify={"left"} align={"flex-end"}>
                <Button icon={<DownloadOutlined/>} onClick={() => exportAsImage('svg')}
                        size="small">SVG</Button>
                <Button icon={<ExportOutlined/>} onClick={exportBpmn} size="small">Export</Button>
                <Button icon={<ExportOutlined/>} onClick={() => changeDisplayMode()} size="small">{displayMode}</Button>
                <Button type="primary" icon={<SaveOutlined/>} onClick={saveBpmn} size="small">Save
                </Button>
                <Button type="primary" icon={<DeploymentUnitOutlined/>} onClick={deployDag}
                        size="small" disabled={loading}>Deploy</Button>
            </Flex>
        </div>
        <div className={"my-border"}>
            <div style={{height: "35vh"}} ref={containerRef}/>
        </div>
        <div style={{marginTop: "6px", display: displayMode === "preview" ? "" : "none", marginBottom: "6px"}}>
            <SqlEditor onEditorConnectionChange={onEditorConnectionChange} height={"228px"} text={""} ref={sqlEditorRef}
                       embedded={true} onEditorChange={onEditorChange}/>
        </div>
        <div style={{marginTop: "6px", display: displayMode === "sql" ? "" : "none", marginBottom: "6px"}}>
            <Button style={{marginBottom: "6px"}} size={"small"} onClick={generateDag} icon={<RedoOutlined/>}>Generate
                DAG</Button>
            <div className={"my-border"}>
                <CodeMirror height="30vh"
                            value={dag}
                            theme="light"
                            extensions={[python()]}/>
            </div>
        </div>
        <div className={`side-panel ${isExpanded ? "expanded" : ""}`}>
            <button className="toggle-button" onClick={togglePanel}>
                {isExpanded ? "»" : "«"}
            </button>
            <div className="panel-content" ref={propertiesRef}/>
        </div>
        {contextHolder}
    </div>
});

export default BpmnEditor;
