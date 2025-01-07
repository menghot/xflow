import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Dropdown, Input, MenuProps, Popconfirm, Spin, Tree} from 'antd';
import api from "../services/api"
import {
    ConsoleSqlOutlined,
    CopyOutlined,
    DeleteOutlined,
    FileAddOutlined,
    FileOutlined,
    FolderOutlined,
    PicRightOutlined,
    PythonOutlined,
    RetweetOutlined,
    SyncOutlined
} from "@ant-design/icons";

// const {Search} = Input;
import type {DataNode} from "antd/es/tree";


interface TreeDataNode extends DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    type: 'connection' | 'schema' | 'table'; // Add type property
    children?: TreeDataNode[];
}

interface FileTreeProps {
    autoExp?: boolean
    // The Callback for subcomponent call parent
    openFile: (path: string) => void;
}

export interface FileTreeRef {
    // For parent component call subcomponent
    fetchTreeData: () => void;
}

// for external usage -------------

const TreeDisplay = forwardRef<FileTreeRef, FileTreeProps>((fileTreeProps, ref) => {
    const [loading, setLoading] = useState<boolean>(true);

    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [filteredTreeData, setFilteredTreeData] = useState<TreeDataNode[]>([]); // Displayed tree data

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [rightClickedNode, setRightClickedNode] = useState<TreeDataNode | null>(null);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const response = await api.get<TreeDataNode[]>('api/file/file-tree');
            setTreeData(response.data);
            setFilteredTreeData(response.data);
        } catch (err) {
            console.error(err)
            // Show alert
        } finally {
            setLoading(false)
        }
    };

    const getNodeTitleIcon = (node: TreeDataNode) => {
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

    const handleDoubleClick = (node: TreeDataNode) => {
        setSelectedKeys([node.key]); // Set the node as selected
        fileTreeProps.openFile(node.key)
    };


    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (<span onClick={fetchTreeData}><SyncOutlined/> Refresh</span>),
        }, {
            key: '2',
            label: (<span><CopyOutlined/> Duplicate File</span>),
            disabled: !rightClickedNode?.isLeaf,
        }, {
            key: '3',
            label: (<span><FileAddOutlined/> New File</span>),
            disabled: rightClickedNode?.isLeaf,

        }, {
            key: '4',
            label: (<span><RetweetOutlined /> Rename</span>),
            disabled: !rightClickedNode?.isLeaf,
        } , {
            key: '5',
            label: (<span><FileAddOutlined/> New From</span>),
            disabled: rightClickedNode?.isLeaf,
            children: [
                {
                    key: '5-1',
                    label: 'BPMN Template',
                },
                {
                    key: '5-2',
                    label: 'DAG Template',
                },
            ],
        }, {
            key: '6',
            label: (
                <Popconfirm
                    placement="rightTop"
                    title=''
                    description=''
                    okText="Yes"
                    cancelText="No">
                    <span><DeleteOutlined/> Delete</span>
                </Popconfirm>
            ),
            disabled: !rightClickedNode?.isLeaf,
        }]

    const titleRender = (node: TreeDataNode) => {
        return <Dropdown menu={{items}} trigger={['contextMenu']}>
            <span onDoubleClick={() => handleDoubleClick(node)}>
            {getNodeTitleIcon(node)}{node.title}
        </span></Dropdown>
    }

    useEffect(() => {
        fetchTreeData().then()
    }, []);


    useImperativeHandle(ref, () => ({
        fetchTreeData,
    }));


    // Function to filter tree based on the search term
    const filterTree = (nodes: TreeDataNode[], term: string): string[] => {
        const keys: string[] = [];

        const filterNodes = (node: TreeDataNode): TreeDataNode | null => {
            if (!node.children) {
                if (node.title.toLowerCase().includes(term.toLowerCase())) {
                    keys.push(node.key);
                    return node;
                }
                return null;
            }

            const filteredChildren = node.children
                .map(filterNodes)
                .filter((child) => child !== null);

            if (filteredChildren.length > 0 || node.title.toLowerCase().includes(term.toLowerCase())) {
                keys.push(node.key);
                return {...node, children: filteredChildren as TreeDataNode[]};
            }
            return null;
        };

        const filteredTree = nodes.map(filterNodes).filter((node) => node !== null);
        setFilteredTreeData(filteredTree as TreeDataNode[]);
        return keys;
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const keys = filterTree(treeData, value);
        setExpandedKeys(keys); // Automatically expand matching nodes
        //console.log(" setExpandedKeys ----> ", keys)
    };

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    // =========================================================
    return <Spin spinning={loading} tip="Loading tree data...">
        <Input
            size={"small"}
            style={{marginBottom: 4}}
            placeholder="Search"
            allowClear
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
        />

        <Tree showIcon
              onClick={(_, node) =>
                  setSelectedKeys([node.key])}
              onRightClick={(a) => {
                  setRightClickedNode(a.node)
                  setSelectedKeys([a.node.key])
              }}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              filterTreeNode={(node) => {
                  return (searchTerm !== '' && node.title.toLowerCase().includes(searchTerm.toLowerCase()))
              }}
              autoExpandParent={autoExpandParent}
              titleRender={titleRender}
              treeData={filteredTreeData}
        />
    </Spin>
});

export default TreeDisplay;
