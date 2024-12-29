import React, {useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import diagram1 from '../assets/diagram3.bpmn?raw';
import diagram2 from '../assets/diagram2.bpmn?raw';

//MUST import those css files
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

// import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
const BpmnEditorComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);

    const saveXml = () => {
        modeler?.saveXML().then(({xml}) => {
            console.log('Saved BPMN XML:', xml);
        }).catch((err) => {
            console.error('Error saving BPMN XML:', err);
        });
    }

    const load1 = () => {
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


    useEffect(() => {
        if (containerRef.current && containerRef.current.getAttribute("loaded") !== "loaded") {
            setModeler(new BpmnModeler({
                container: containerRef.current!,
            }));

            // set BpmnModeler loaded
            containerRef.current.setAttribute("loaded", "loaded");
        }

        return () => {
            //FIXME
            //modeler?.destroy();
        };
    }, [modeler]); // Only initialize once on component mount

    return <div>
        <div ref={containerRef} style={{width: '100%', height: '500px', border: '1px solid #ccc'}}/>
        <button onClick={load1} style={{margin: '10px'}}> Load Diagram 1</button>
        <button onClick={load2} style={{margin: '10px'}}>Load Diagram 2</button>
        <button onClick={saveXml} style={{margin: '10px'}}>Save Diagram</button>
        <button onClick={() => exportAsImage('svg')} style={{margin: '10px'}}>Export SVG1 Diagram</button>
        <button onClick={() => exportAsImage('png')} style={{margin: '10px'}}>Export png2 Diagram</button>
        <button onClick={() => exportDiagram()} style={{margin: '10px'}}>Export Diagram</button>



    </div>;
};


export default BpmnEditorComponent;
