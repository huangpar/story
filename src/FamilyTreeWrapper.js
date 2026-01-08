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

    dagreGraph.setGraph({ rankdir: direction });

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
        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';

        // We leave it as is for now, dagre returns center point
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
        const initialEdges = [];
        filteredPeople.forEach((p) => {
            // Parent edges (Directed for now: Parent -> Child)
            if (p.fid) {
                // Check if father exists in filtered list to avoid dangling edges
                if (initialNodes.find(n => n.id === p.fid.toString())) {
                    initialEdges.push({
                        id: `e${p.fid}-${p.id}`,
                        source: p.fid.toString(),
                        target: p.id.toString(),
                        type: 'smoothstep',
                        animated: true,
                    });
                }
            }
            if (p.mid) {
                if (initialNodes.find(n => n.id === p.mid.toString())) {
                    initialEdges.push({
                        id: `e${p.mid}-${p.id}`,
                        source: p.mid.toString(),
                        target: p.id.toString(),
                        type: 'smoothstep',
                        animated: true,
                    });
                }
            }

            // Spouse Edges?
            // Dagre works best with hierarchical trees. Spouses on same rank can be tricky.
            // For now, let's treat spouses as just nodes on the same level (potentially) or disable spouse edges for layout
            // and just depend on common children to group them, OR add an invisible edge.
            // Let's add a dashed edge for spouses for visualization.
            if (p.sid) {
                // Avoid double edges (A->B and B->A), just do if id < sid
                if (p.id < p.sid && initialNodes.find(n => n.id === p.sid.toString())) {
                    initialEdges.push({
                        id: `e${p.id}-${p.sid}`,
                        source: p.id.toString(),
                        target: p.sid.toString(),
                        type: 'straight',
                        style: { stroke: '#333', strokeDasharray: '5,5' },
                        animated: false,
                    });
                }
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
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
