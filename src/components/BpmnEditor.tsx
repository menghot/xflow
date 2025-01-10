import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
//bpmn css files is mandatory
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css';


import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule} from 'bpmn-js-properties-panel';
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import {ElementRegistry} from "bpmn-js/lib/features/auto-place/BpmnAutoPlaceUtil";
import {Moddle} from "bpmn-js/lib/model/Types";
import {Canvas} from "bpmn-js/lib/features/context-pad/ContextPadProvider";

import {Button, Flex, notification, Splitter} from 'antd';
import api from "../services/api";
import {
    DeploymentUnitOutlined,
    DownloadOutlined,
    ExportOutlined,
    SaveOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import SqlEditor, {SqlEditorRef} from "./SqlEditor.tsx";


export interface BpmnEditorRef {
    openFile: (path: string, modeler: BpmnModeler) => void;
}

interface BpmnEditorProps {
    autoExp?: boolean,
    filePath: string
}

const BpmnEditor = forwardRef<BpmnEditorRef, BpmnEditorProps>((bpmnProps, ref) => {

    const [notifier, contextHolder] = notification.useNotification();
    const sqlEditorRef = useRef<SqlEditorRef>(null);

    // bpmn js
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const [currentNode, setCurrentNode] = React.useState("");

    const [loading, setLoading] = useState<boolean>(false); // Loading state for button


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
            openFile(bpmnProps.filePath, modeler).then();

            const eventBus = modeler.get('eventBus');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            eventBus.on('element.click', ({element}) => {
                const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
                console.log(elementRegistry, currentNode)
                setCurrentNode(element.id)
                const docs = element.businessObject.documentation || [];
                if (docs.length > 0) {
                    sqlEditorRef?.current?.setEditorText(docs[0].text)
                } else {
                    sqlEditorRef?.current?.setEditorText('')
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
            const response = await api.get<string>(`api/file/get-file-content?path=${encodeURIComponent(path)}`, {
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

    const onEditorChange = (text: string) => {
        if (modeler) {
            const elementRegistry: ElementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(currentNode)

            if (element) {
                let docs = element.businessObject.documentation || [];
                if (docs.length === 0) {
                    const moddle: Moddle = modeler.get('moddle');
                    docs = [...docs, moddle.create('bpmn:Documentation', {text: text})]
                } else {
                    docs[0].text = text
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

    return <div>
        <div style={{position: "sticky", paddingLeft: "0px", paddingBottom: "4px", zIndex: 999}}>
            <Flex gap="small" justify={"left"} align={"flex-end"}>
                <Button icon={<DownloadOutlined/>} onClick={() => exportAsImage('svg')}
                        size="small">SVG</Button>
                <Button icon={<ExportOutlined/>} onClick={exportBpmn} size="small">Export</Button>
                <Button type="primary" icon={<SaveOutlined/>} onClick={saveBpmn} size="small">Save
                </Button>
                <Button type="primary" icon={<DeploymentUnitOutlined/>} onClick={deployDag}
                        size="small" disabled={loading}>Deploy</Button>
            </Flex>
        </div>
        <Splitter onResizeEnd={onCanvasResize}
                  style={{height: "420px", padding: "1px", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
            <Splitter.Panel defaultSize="80%" min="20%" max="90%">

                <div style={{height: "100%"}} ref={containerRef}>

                </div>
            </Splitter.Panel>
            <Splitter.Panel>
                <div ref={propertiesRef}></div>
            </Splitter.Panel>
        </Splitter>
        <SqlEditor text={""} ref={sqlEditorRef} embedded={true} onEditorChange={onEditorChange}/>
        {contextHolder}
    </div>
});

export default BpmnEditor;
