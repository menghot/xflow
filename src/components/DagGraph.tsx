import React, {useEffect, useState} from "react";
import ReactFlow, {Controls, Edge, Node, Position} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import api from "../services/api.ts";

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 150;
const nodeHeight = 50;

// Function to apply the Dagre layout
const applyDagreLayout = (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
    dagreGraph.setGraph({rankdir: "LR"}); // Left-to-Right layout

    // Add nodes to the Dagre graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight});
    });

    // Add edges to the Dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate the layout
    dagre.layout(dagreGraph);

    // Update node positions
    const layoutedNodes = nodes.map((node) => {
        const position = dagreGraph.node(node.id);
        return {
            ...node,
            position: {x: position.x - nodeWidth / 2, y: position.y - nodeHeight / 2},
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
        };
    });

    return {nodes: layoutedNodes, edges};
};

const DagGraph: React.FC<{ dagFilePath: string | undefined }> = ({dagFilePath}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDAG = async () => {
            try {
                const response = await api.get("api/dag/graph?path=" + dagFilePath);

                const data = response.data;

                // Transform API response into ReactFlow's nodes and edges
                const apiNodes = data.nodes.map((node: Node) => ({
                    ...node,
                    data: {label: node.id},
                    position: {x: 0, y: 0}, // Position will be adjusted by the layout
                }));

                const apiEdges = data.edges.map((edge: { source: Edge; target: Edge }) => ({
                    id: `${edge.source}-${edge.target}`,
                    source: edge.source,
                    target: edge.target,
                }));

                //console.log(apiNodes)
                //console.log(apiEdges)

                // Apply Dagre layout
                const {nodes: layoutedNodes, edges: layoutedEdges} = applyDagreLayout(apiNodes, apiEdges);
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                //console.log(layoutedNodes)
                //console.log(layoutedEdges)
                setError(null);
            } catch (err) {
                setError((err as Error).message);
            }
        };

        fetchDAG().then();

    }, [dagFilePath]);

    return (
        <div style={{height: "100%", width: "100%"}}>
            {error ? (
                <div style={{color: "red"}}>Error: {error}</div>
            ) : (
                <ReactFlow nodes={nodes} edges={edges}>
                    <Controls/>
                </ReactFlow>
            )}
        </div>
    );
};

export default DagGraph;
