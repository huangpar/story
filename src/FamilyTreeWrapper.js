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
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (which is center) to top left
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function FamilyTreeWrapper({ people = [] }) {
    const { nodes, edges } = useMemo(() => {
        // 1. Identify people to include (same logic as before)
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
        filteredPeople.forEach((p) => {
            const childId = String(p.id);

            if (p.fid) {
                initialEdges.push({
                    id: `e-${p.fid}-${childId}`,
                    source: String(p.fid),
                    target: childId,
                    type: ConnectionLineType.SmoothStep,
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
            if (p.mid) {
                initialEdges.push({
                    id: `e-${p.mid}-${childId}`,
                    source: String(p.mid),
                    target: childId,
                    type: ConnectionLineType.SmoothStep,
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
            if (p.sid) {
                // Spouse edge - dashed or distinct color
                initialEdges.push({
                    id: `e-spouse-${p.sid}-${childId}`,
                    source: String(p.sid),
                    target: childId,
                    label: 'spouse',
                    labelStyle: { fontSize: '8px', fill: '#64748b' },
                    style: { strokeDasharray: '5,5', stroke: '#94a3b8' },
                    type: ConnectionLineType.Straight,
                });
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
