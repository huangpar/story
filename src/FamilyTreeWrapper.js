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
    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // Only pass parent-child edges to dagre for rank calculation.
    // This allows spouses to stay on the same level (rank) because they share children.
    edges.forEach((edge) => {
        if (!edge.id.includes('spouse')) {
            dagreGraph.setEdge(edge.source, edge.target);
        }
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // If the node wasn't in the dagre graph (e.g. spouse with no parents/children)
        // we might need to handle it. But filteredPeople logic ensures they are connected.
        if (nodeWithPosition) {
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';

            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
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
            if (p.gender?.toLowerCase() === 'male') bgColor = '#eff6ff'; // Blue-ish
            if (p.gender?.toLowerCase() === 'female') bgColor = '#fff1f2'; // Red-ish/Pink

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

        // 3. Create edges
        const initialEdges = [];
        const spousePairs = new Set();

        filteredPeople.forEach((p) => {
            const personId = String(p.id);

            // Parent edges
            if (p.fid) {
                initialEdges.push({
                    id: `e-${p.fid}-${personId}`,
                    source: String(p.fid),
                    target: personId,
                    type: ConnectionLineType.SmoothStep,
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
            if (p.mid) {
                initialEdges.push({
                    id: `e-${p.mid}-${personId}`,
                    source: String(p.mid),
                    target: personId,
                    type: ConnectionLineType.SmoothStep,
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }

            // Spouse edge - detect and prevent duplicates
            if (p.sid) {
                const spouseId = String(p.sid);
                const pair = [personId, spouseId].sort().join('-');

                if (!spousePairs.has(pair)) {
                    initialEdges.push({
                        id: `e-spouse-${pair}`,
                        source: personId,
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

        return getLayoutedElements(initialNodes, initialEdges);
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
