import React, {forwardRef, useImperativeHandle, useState} from 'react';
import type {DragEndEvent} from '@dnd-kit/core';
import {closestCenter, DndContext, PointerSensor, useSensor} from '@dnd-kit/core';
import {arrayMove, horizontalListSortingStrategy, SortableContext, useSortable,} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import type {TabsProps} from 'antd';
import {Tabs} from 'antd';
import {DatabaseOutlined} from "@ant-design/icons";
import DagEditor from "./DagEditor.tsx";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;


interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-node-key': string;
}


const DraggableTabNode: React.FC<Readonly<DraggableTabPaneProps>> = ({...props}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({
        id: props['data-node-key'],
    });

    //console.info(className)

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


export interface TTRef {
    openEditor: (path: string, type: "dag" | "sql" | "bpmn") => void;
}

interface TTProps {
    autoExp?: boolean,
}


const TT = forwardRef<TTRef, TTProps>((ttProps, ref) => {

    console.log(ttProps)
    const [items, setItems] = useState<NonNullable<TabsProps['items']>>([
        {key: '1', style: {}, label: <span><DatabaseOutlined/> [New *] - console </span>, children: <DagEditor/>},
    ]);
    const [activeKey, setActiveKey] = useState('1');

    // const add = () => {
    //     const newKey = String((items || []).length + 1);
    //     setItems([
    //         ...(items || []),
    //         {
    //             label: `Tab ${newKey}`,
    //             key: newKey,
    //             children: `Content of editable tab ${newKey}`,
    //         },
    //     ]);
    //     setActiveKey(newKey);
    // };

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
        } else if (action === 'remove') {
            remove(targetKey);
        } else {
            //add();
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

    const openEditor = (path: string, type: "dag" | "sql" | "bpmn") => {
        console.log(path, type);
        setItems([
            ...(items || []),
            {
                key: path,
                label: <span><DatabaseOutlined/>{path}</span>,
                children: <DagEditor filePath={path}/>
            }

        ]);
        setActiveKey(path);
    }

    useImperativeHandle(ref, () => ({
        openEditor,
    }));

    return (
        <div>
            <Tabs
                type="editable-card" size={"small"}
                items={items}
                activeKey={activeKey}
                onEdit={onEdit}
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

export default TT;