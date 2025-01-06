import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Alert, Spin, Tree} from 'antd';
import api from "../services/api"
import {ConsoleSqlOutlined, FileOutlined, FolderOutlined, PicRightOutlined, PythonOutlined} from "@ant-design/icons";

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    type: 'connection' | 'schema' | 'table'; // Add type property
    children?: DataNode[];
}

// for external usage -------------
interface DagFileTreeProps {
    autoExp?: boolean
    editor: (path: string) => void;
}

export interface DagFileTreeRef {
    fetchTreeData: () => void;
}

// for external usage -------------

const TreeDisplay = forwardRef<DagFileTreeRef, DagFileTreeProps>((dagFileTreeProps, ref) => {
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const response = await api.get<DataNode[]>('api/dag/file-tree');
            const nodes = response.data
            setTreeData(nodes);
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    };

    // Map tree data to include icons
    // const mapTreeData = (nodes: DataNode[]): DataNode[] =>
    //     nodes.map(node => ({
    //         ...node,
    //         icon: node.isLeaf ? <FileOutlined onClick={handleDoubleClick}/> : <FolderOutlined/>,
    //         children: node.children ? mapTreeData(node.children) : undefined,
    //     }));

    const getNodeTitleIcon = (node: DataNode) => {
        if (!node.isLeaf) {
            return <FolderOutlined style={{marginRight: 6}}/>
        } else if (node.title.endsWith(".sql")) {
            return <ConsoleSqlOutlined style={{marginRight: 6}}/>;
        } else if (node.title.endsWith(".py")) {
            return <PythonOutlined style={{marginRight: 6}}/>;
        } else if (node.title.endsWith(".bpmn")) {
            return <PicRightOutlined style={{marginRight: 6}}/>;
        }

        return <FileOutlined style={{marginRight: 6}}/>;
    }

    const handleDoubleClick = (node: DataNode) => {
        setSelectedKeys([node.key]); // Set the node as selected
        dagFileTreeProps.editor(node.key)
    };


    const titleRender = (node: DataNode) => {
        return <span onDoubleClick={() => handleDoubleClick(node)}>
            {getNodeTitleIcon(node)}{node.title}
        </span>
    }

    useEffect(() => {
        fetchTreeData().then()
    }, []);


    useImperativeHandle(ref, () => ({
        fetchTreeData,
    }));

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon/>;
    }

    return <Spin spinning={loading} tip="Loading tree data...">
        <Tree selectedKeys={selectedKeys} titleRender={titleRender} showIcon treeData={treeData}/>
    </Spin>;
});

export default TreeDisplay;
