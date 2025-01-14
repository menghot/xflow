import React, {forwardRef, useImperativeHandle, useState} from 'react';
import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, PointerSensor, useSensor} from '@dnd-kit/core';
import {arrayMove, horizontalListSortingStrategy, SortableContext, useSortable,} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import type {TabsProps} from 'antd';
import {Tabs} from 'antd';
import {ConsoleSqlOutlined, DatabaseOutlined, PythonOutlined} from "@ant-design/icons";
import DagEditor from "./DagEditor.tsx";
import SqlEditor from "./SqlEditor.tsx";
import BpmnEditor from "./BpmnEditor.tsx";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-node-key': string;
}

const DraggableTabNode: React.FC<Readonly<DraggableTabPaneProps>> = ({...props}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({
        id: props['data-node-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
    };

    return React.cloneElement(props.children as React.ReactElement, {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
    });
};


export interface MainTabsRef {
    openEditor: (path: string, type: "dag" | "sql" | "bpmn") => void;
}

interface MainTabProps {
    autoExp?: boolean,
}


const MainTabs = forwardRef<MainTabsRef, MainTabProps>((ttProps, ref) => {

    console.log('ttProps, ', ttProps)
    const [items, setItems] = useState<NonNullable<TabsProps['items']>>([
        // {key: '1', style: {}, label: <span><DatabaseOutlined/> [New *] - console </span>, children: <DagEditor/>},
    ]);
    const [activeKey, setActiveKey] = useState<string>('');

    const remove = (targetKey: TargetKey) => {
        if (!items) return;
        const targetIndex = items.findIndex((item) => item.key === targetKey);
        const newItems = items.filter((item) => item.key !== targetKey);
        if (newItems.length && targetKey === activeKey) {
            const newActiveKey =
                newItems[targetIndex === newItems.length ? targetIndex - 1 : targetIndex].key;
            setActiveKey(newActiveKey);
        }
        setItems(newItems);
    };

    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            //add();
        }
        if (action === 'remove') {
            remove(targetKey);
        }
    };


    const sensor = useSensor(PointerSensor, {activationConstraint: {distance: 10}});
    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (active.id !== over?.id) {
            setItems((prev) => {
                const activeIndex = prev.findIndex((i) => i.key === active.id);
                const overIndex = prev.findIndex((i) => i.key === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const getEditor = (path: string, type: "dag" | "sql" | "bpmn") => {
        if (path.endsWith('.sql')) {
            return <SqlEditor height="32vh" filePath={path}/>
        } else if (path.endsWith('.bpmn')) {
            return <BpmnEditor filePath={path}/>
        } else if (type === 'dag') {
            return <DagEditor filePath={path}/>
        } else {
            return type
        }

    }

    const getTabLabel = (path: string, type: "dag" | "sql" | "bpmn") => {
        if (path.endsWith(".sql")) {
            return <span><ConsoleSqlOutlined/> {path.substring(path.lastIndexOf('/') + 1)}</span>
        } else if (type === "dag") {
            return <span><PythonOutlined/> {path.substring(path.lastIndexOf('/') + 1)}</span>
        } else {
            return <span><DatabaseOutlined/>{path.substring(path.lastIndexOf('/') + 1)}</span>
        }
    }


    const openEditor = (path: string, type: "dag" | "sql" | "bpmn") => {
        console.log(path, type);

        for (let i = 0; i < items.length; i++) {
            if (items[i].key === path) {
                setActiveKey(path);
                return
            }
        }

        setItems([
            ...(items || []),
            {
                key: path,
                label: getTabLabel(path, type),
                children: getEditor(path, type)
            }
        ]);
        setActiveKey(path);
    }

    useImperativeHandle(ref, () => ({
        openEditor,
    }));

    const onChange = (activeKey: string) => {
        setActiveKey(activeKey)
    }


    return (
        <div>
            <Tabs
                type="editable-card" size={"small"}
                items={items}
                onEdit={onEdit}
                hideAdd={true}
                onChange={onChange}
                activeKey={activeKey}
                renderTabBar={(tabBarProps, DefaultTabBar) => (
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
                        <SortableContext items={items.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
                            <DefaultTabBar {...tabBarProps}>
                                {(node) => (
                                    <DraggableTabNode
                                        {...(node as React.ReactElement<DraggableTabPaneProps>).props}
                                        key={node.key}>
                                        {node}
                                    </DraggableTabNode>
                                )}
                            </DefaultTabBar>
                        </SortableContext>
                    </DndContext>
                )}
            /></div>
    );
});

export default MainTabs;