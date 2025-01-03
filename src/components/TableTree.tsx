import {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Tree, Spin, Alert} from 'antd';
import api from "../services/api"
import {ClusterOutlined, DatabaseOutlined, TableOutlined} from "@ant-design/icons";

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    type: 'connection' | 'schema' | 'table'; // Add type property
    children?: DataNode[];
}

// for external usage -------------
interface TableTreeProps {
    autoExp: boolean
}

export interface TableTreeRef {
    fetchTreeData: () => void;
}

// for external usage -------------

const TreeDisplay = forwardRef<TableTreeRef, TableTreeProps>((_, ref) => {

    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const response = await api.get<DataNode>('api/db/tree?connection_id=postgres_default');
            const nodes = mapTreeData([response.data])
            console.log(nodes)
            setTreeData(nodes); // Map data to include icons
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    // Map tree data to include icons
    const mapTreeData = (nodes: DataNode[]): DataNode[] =>
        nodes.map(node => ({
            ...node,
            icon: getNodeIcon(node.type),
            children: node.children ? mapTreeData(node.children) : undefined,
        }));

    // Define icons based on node type
    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'connection':
                return <ClusterOutlined/>;
            case 'schema':
                return <DatabaseOutlined/>;
            case 'table':
                return <TableOutlined color={"blue"}/>;
            default:
                return undefined;
        }
    };

    useEffect(() => {
        fetchTreeData().then(r => console.log(r));
    }, []);

    useImperativeHandle(ref, () => ({
        fetchTreeData,
    }));


    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon/>;
    }

    return <Spin spinning={loading} tip="Loading tree data..."><Tree showIcon treeData={treeData}/></Spin>;
});

export default TreeDisplay;
