import {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Tree, Spin, Alert} from 'antd';
import api from "../services/api"
import {FileOutlined, FolderOutlined} from "@ant-design/icons";

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    type: 'connection' | 'schema' | 'table'; // Add type property
    children?: DataNode[];
}

// for external usage -------------
interface DagFileTreeProps {
    autoExp: boolean
}

export interface DagFileTreeRef {
    fetchTreeData: () => void;
}

// for external usage -------------

const TreeDisplay = forwardRef<DagFileTreeRef, DagFileTreeProps>((_, ref) => {
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);

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

    const titleRender = (node: DataNode) => (
        <span onDoubleClick={() => console.log(node)}>
             {node.isLeaf ? <FileOutlined style={{marginRight: 8}}/> : <FolderOutlined style={{marginRight: 8}}/>}
            {node.title}
    </span>
    );

    useEffect(() => {fetchTreeData().then()}, []);


    useImperativeHandle(ref, () => ({
        fetchTreeData,
    }));

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon/>;
    }

    return <Spin spinning={loading} tip="Loading tree data...">
        <Tree titleRender={titleRender} showIcon treeData={treeData}/>
    </Spin>;
});

export default TreeDisplay;
