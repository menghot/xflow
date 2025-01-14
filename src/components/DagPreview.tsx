import React, {forwardRef, useImperativeHandle} from "react";
import {xml} from "@codemirror/lang-xml";
import CodeMirror from "@uiw/react-codemirror";

export interface DagPreviewRef {
    updateBpmnXml: (bpmnXml: string) => void
}


interface DagPreviewProps {
    bpmnXml: string
    height?: string
}

const DagPreview = forwardRef<DagPreviewRef, DagPreviewProps>((dagPreviewProps, ref) => {

    const [bpmnXml, setBpmnXml] = React.useState<string>("")

    function updateBpmnXml(xml: string) {
        setBpmnXml(xml)
    }


    useImperativeHandle(ref, () => ({
        updateBpmnXml
    }));


    return <div>

        <CodeMirror height={dagPreviewProps.height}
                    value={bpmnXml}
                    theme="light"
                    extensions={[xml()]}/>
    </div>
})

export default DagPreview