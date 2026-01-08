import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 250;
    const nodeHeight = 100;

    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Handle case where node might not be in dagre (if we filtered it out?) 
        // But we added all nodes, so it should be fine.

        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function FamilyTreeWrapper({ people = [] }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (people.length === 0) return;

        // 1. Calculate Spouse Map (Bidirectional)
        const spouseMap = {};
        people.forEach(p => {
            if (!spouseMap[p.id]) spouseMap[p.id] = new Set();
            if (p.sid) {
                spouseMap[p.id].add(p.sid);
                if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
                spouseMap[p.sid].add(p.id);
            }
        });

        const referencedIds = new Set();
        people.forEach(p => {
            if (p.fid) referencedIds.add(p.fid);
            if (p.mid) referencedIds.add(p.mid);
            if (spouseMap[p.id] && spouseMap[p.id].size > 0) {
                spouseMap[p.id].forEach(sId => referencedIds.add(sId));
            }
        });

        const filteredPeople = people.filter(p => (p.fid || p.mid || (spouseMap[p.id] && spouseMap[p.id].size > 0)) || referencedIds.has(p.id));

        // Create Nodes
        const initialNodes = filteredPeople.map((p) => ({
            id: p.id.toString(),
            type: 'custom',
            data: { label: p.name, gender: p.gender },
            position: { x: 0, y: 0 }, // Initial position, will be computed by dagre
        }));

        // Create Edges
        const layoutEdges = []; // Edges used for Dagre layout (Parent -> Child only)
        const renderEdges = []; // All edges to render (including spouses)

        filteredPeople.forEach((p) => {
            // Parent edges (Directed for now: Parent -> Child)
            if (p.fid) {
                if (initialNodes.find(n => n.id === p.fid.toString())) {
                    const edge = {
                        id: `e${p.fid}-${p.id}`,
                        source: p.fid.toString(),
                        target: p.id.toString(),
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    };
                    layoutEdges.push(edge);
                    renderEdges.push(edge);
                }
            }
            if (p.mid) {
                if (initialNodes.find(n => n.id === p.mid.toString())) {
                    const edge = {
                        id: `e${p.mid}-${p.id}`,
                        source: p.mid.toString(),
                        target: p.id.toString(),
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    };
                    layoutEdges.push(edge);
                    renderEdges.push(edge);
                }
            }

            // Spouse Edges
            // Do NOT add to layoutEdges to prevent Dagre from forcing vertical hierarchy
            if (p.sid) {
                // Avoid double edges (A->B and B->A), just do if id < sid
                if (p.id < p.sid && initialNodes.find(n => n.id === p.sid.toString())) {
                    renderEdges.push({
                        id: `e${p.id}-${p.sid}`,
                        source: p.id.toString(),
                        target: p.sid.toString(),
                        type: 'straight', // Straight line for spouses
                        style: { stroke: '#ff0072', strokeWidth: 3, strokeDasharray: '5,5' },
                        animated: false,
                    });
                }
            }
        });

        // Compute layout using ONLY hierarchical edges
        const { nodes: layoutedNodes } = getLayoutedElements(
            initialNodes,
            layoutEdges
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);

    }, [people, setNodes, setEdges]); // Only re-run if people data changes

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)),
        [setEdges]
    );

    return (
        <div style={{ width: '100%', height: '800px', background: '#f0f0f0' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
}
