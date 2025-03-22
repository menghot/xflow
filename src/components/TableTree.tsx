import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Alert, Input, Select, Spin, Tree} from 'antd';
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
    autoExp?: boolean
}

export interface TableTreeRef {
    changeConnection: (v:string) => void;
}

// for external usage -------------

const TreeDisplay = forwardRef<TableTreeRef, TableTreeProps>((_, ref) => {

    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);
    const [connectionId, setConnectionId] = useState<string>("trino_default");

    const fetchTreeData = async (conn:string) => {
        try {
            setLoading(true);
            const response = await api.get<DataNode[]>('api/db/tree?connection_id=' + conn);
            const nodes = mapTreeData(response.data)
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

        fetchTreeData(connectionId).then();
    }, []);

    useImperativeHandle(ref, () => ({
        changeConnection,
    }));


    const changeConnection = (value: string) => {
        setConnectionId(value)
        fetchTreeData(value).then()
    };


    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon/>;
    }

    return <Spin spinning={loading} tip="Loading tree data...">
        <Select
            size={"small"}
            value={connectionId}
            style={{width: 160}}
            defaultValue={connectionId}
            onSelect={(e, v) => {
                console.log(e)
                changeConnection(v.value)
            }}
            loading={false}
            options={[
                {value: 'trino_default', label: 'trino_default'},
                {value: 'hive_server2',  label: 'spark_jdbc'},
                {value: 'postgres_default', label: 'postgres_default'}]}
        />
        <Input
            size={"small"}
            style={{marginBottom: 4, position: "sticky", top: "22px", zIndex: "99"}}
            placeholder="Search"
            allowClear
        />
        <Tree showIcon treeData={treeData}/>
    </Spin>;
});

export default TreeDisplay;
