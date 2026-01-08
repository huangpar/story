import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    ConnectionLineType,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    // nodesep determines horizontal gap, ranksep determines vertical gap
    dagreGraph.setGraph({ rankdir: direction, nodesep: 150, ranksep: 100 });

    nodes.forEach((node) => {
        // Set fixed size for layouting
        const width = node.data?.isUnion ? 4 : nodeWidth;
        const height = node.data?.isUnion ? 4 : nodeHeight;
        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const width = node.data?.isUnion ? 4 : nodeWidth;
        const height = node.data?.isUnion ? 4 : nodeHeight;

        if (nodeWithPosition) {
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';

            node.position = {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            };
        }

        return node;
    });

    return { nodes, edges };
};

export default function FamilyTreeWrapper({ people = [] }) {
    const { nodes, edges } = useMemo(() => {
        // 1. Identify people to include
        const referencedIds = new Set();
        people.forEach(p => {
            if (p.fid) referencedIds.add(String(p.fid));
            if (p.mid) referencedIds.add(String(p.mid));
            if (p.sid) referencedIds.add(String(p.sid));
        });

        const filteredPeople = people.filter(p =>
            p.fid || p.mid || p.sid || referencedIds.has(String(p.id))
        );

        // 2. Map to nodes
        const initialNodes = filteredPeople.map((p) => {
            let bgColor = '#fff';
            if (p.gender?.toLowerCase() === 'male') bgColor = '#eff6ff';
            if (p.gender?.toLowerCase() === 'female') bgColor = '#fff1f2';

            return {
                id: String(p.id),
                data: { label: p.name },
                style: {
                    background: bgColor,
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '10px',
                    width: nodeWidth,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#1e40af'
                },
            };
        });

        // 3. Create edges and union nodes for parent-child relationships
        const initialEdges = [];
        const unionNodes = [];
        const parentPairs = new Map();
        const spousePairs = new Set();

        // Group children by parent pairs (Union Nodes)
        filteredPeople.forEach(p => {
            const childId = String(p.id);
            if (p.fid && p.mid) {
                const pairKey = [String(p.fid), String(p.mid)].sort().join('-');
                if (!parentPairs.has(pairKey)) {
                    parentPairs.set(pairKey, []);
                }
                parentPairs.get(pairKey).push(childId);
            } else {
                // Single parent cases
                if (p.fid) {
                    initialEdges.push({
                        id: `e-${p.fid}-${childId}`,
                        source: String(p.fid),
                        target: childId,
                        type: ConnectionLineType.SmoothStep,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                if (p.mid) {
                    initialEdges.push({
                        id: `e-${p.mid}-${childId}`,
                        source: String(p.mid),
                        target: childId,
                        type: ConnectionLineType.SmoothStep,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
            }

            // Spouse edge - only add if they don't already have children together (Union Node)
            if (p.sid) {
                const spouseId = String(p.sid);
                const pair = [childId, spouseId].sort().join('-');
                if (!spousePairs.has(pair) && !parentPairs.has(pair)) {
                    initialEdges.push({
                        id: `e-spouse-${pair}`,
                        source: childId,
                        target: spouseId,
                        label: 'spouse',
                        labelStyle: { fontSize: '8px', fill: '#64748b' },
                        style: { strokeDasharray: '5,5', stroke: '#94a3b8' },
                        type: ConnectionLineType.Straight,
                    });
                    spousePairs.add(pair);
                }
            }
        });

        // Process paired parents to create union nodes
        parentPairs.forEach((children, pairKey) => {
            const [p1, p2] = pairKey.split('-');
            const unionId = `union-${pairKey}`;

            // Add tiny union node
            unionNodes.push({
                id: unionId,
                data: { label: '', isUnion: true },
                style: { width: 4, height: 4, background: '#94a3b8', borderRadius: '50%', border: 'none' },
            });

            // Edges from parents to union (no arrows)
            initialEdges.push({
                id: `e-${p1}-${unionId}`,
                source: p1,
                target: unionId,
                type: ConnectionLineType.SmoothStep,
            });
            initialEdges.push({
                id: `e-${p2}-${unionId}`,
                source: p2,
                target: unionId,
                type: ConnectionLineType.SmoothStep,
            });

            // Edges from union to children (with arrows)
            children.forEach(childId => {
                initialEdges.push({
                    id: `e-${unionId}-${childId}`,
                    source: unionId,
                    target: childId,
                    type: ConnectionLineType.SmoothStep,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            });
        });

        return getLayoutedElements([...initialNodes, ...unionNodes], initialEdges);
    }, [people]);

    if (!nodes.length) {
        return <div className="p-10 text-center text-muted">No family data to display</div>;
    }

    return (
        <div style={{ width: '100%', height: '800px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                nodesConnectable={false}
                nodesDraggable={true}
                elementsSelectable={true}
            >
                <Background color="#cbd5e1" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
