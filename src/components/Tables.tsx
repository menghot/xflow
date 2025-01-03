import React, {useState} from 'react';
import {Tree} from 'antd';

interface DataNode {
    title: string;
    key: string;
    isLeaf?: boolean;
    children?: DataNode[];
}

const Connections: React.FC = () => {
    const initTreeData: DataNode[] = [
        {title: 'Expand to load', key: '0'},
        {title: 'Expand to load', key: '1'},
        {title: 'Tree Node', key: '2', isLeaf: true},
    ];

    const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
        list.map((node) => {
            if (node.key === key) {
                return {
                    ...node,
                    children,
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });

    const [treeData, setTreeData] = useState(initTreeData);
    const onLoadData = (node: DataNode) =>
        new Promise<void>((resolve) => {
            if (node.children) {
                resolve();
                return;
            }
            setTimeout(() => {
                setTreeData((origin) =>
                    updateTreeData(origin, node.key, [
                        {title: 'Child Node', key: `${node.key}-0`},
                        {title: 'Child Node', key: `${node.key}-1`},
                    ]),
                );

                resolve();
            }, 1000);
        });

    return <Tree loadData={onLoadData} treeData={treeData}/>;
}

export default Connections;