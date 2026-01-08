import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionLineType,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

// Custom family tree layout algorithm
const getFamilyTreeLayout = (people) => {
    const nodeWidth = 250;
    const nodeHeight = 100;
    const horizontalGap = 80;
    const verticalGap = 150;
    const spouseGap = 20;

    // Build spouse map
    const spouseMap = {};
    people.forEach(p => {
        if (!spouseMap[p.id]) spouseMap[p.id] = new Set();
        if (p.sid) {
            spouseMap[p.id].add(p.sid);
            if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
            spouseMap[p.sid].add(p.id);
        }
    });

    // Calculate generation level for each person (0 = root generation)
    const generations = {};
    const visited = new Set();

    const calculateGeneration = (personId, level = 0) => {
        if (visited.has(personId)) return;
        visited.add(personId);

        const currentLevel = generations[personId] ?? level;
        generations[personId] = Math.max(currentLevel, level);

        // Children are one level down
        people.forEach(p => {
            if (p.fid === personId || p.mid === personId) {
                calculateGeneration(p.id, generations[personId] + 1);
            }
        });
    };

    // Find root people (those with no parents)
    people.forEach(p => {
        if (!p.fid && !p.mid) {
            calculateGeneration(p.id, 0);
        }
    });

    // Group people by generation
    const generationGroups = {};
    Object.entries(generations).forEach(([id, gen]) => {
        if (!generationGroups[gen]) generationGroups[gen] = [];
        generationGroups[gen].push(parseInt(id));
    });

    // Create spouse pairs (ensure each person appears only once)
    const processedPeople = new Set();
    const familyUnits = {}; // generation -> array of units (person or couple)

    Object.entries(generationGroups).forEach(([gen, peopleIds]) => {
        familyUnits[gen] = [];

        peopleIds.forEach(id => {
            if (processedPeople.has(id)) return;

            const person = people.find(p => p.id === id);
            if (!person) return;

            // Check if this person has a spouse in the same generation
            const spouses = Array.from(spouseMap[id] || []);
            const spouseInSameGen = spouses.find(sid => generations[sid] === parseInt(gen));

            if (spouseInSameGen && !processedPeople.has(spouseInSameGen)) {
                // Create a couple unit
                familyUnits[gen].push({
                    type: 'couple',
                    people: [id, spouseInSameGen]
                });
                processedPeople.add(id);
                processedPeople.add(spouseInSameGen);
            } else if (!processedPeople.has(id)) {
                // Single person
                familyUnits[gen].push({
                    type: 'single',
                    people: [id]
                });
                processedPeople.add(id);
            }
        });
    });

    // Position nodes
    const positions = {};

    Object.entries(familyUnits).forEach(([gen, units]) => {
        const genNum = parseInt(gen);
        const y = genNum * (nodeHeight + verticalGap);

        // Calculate total width needed for this generation
        const totalWidth = units.reduce((sum, unit) => {
            if (unit.type === 'couple') {
                return sum + (nodeWidth * 2 + spouseGap) + horizontalGap;
            }
            return sum + nodeWidth + horizontalGap;
        }, -horizontalGap);

        let x = -totalWidth / 2;

        units.forEach(unit => {
            if (unit.type === 'couple') {
                positions[unit.people[0]] = { x, y };
                positions[unit.people[1]] = { x: x + nodeWidth + spouseGap, y };
                x += (nodeWidth * 2 + spouseGap) + horizontalGap;
            } else {
                positions[unit.people[0]] = { x, y };
                x += nodeWidth + horizontalGap;
            }
        });
    });

    return { positions, spouseMap, generations };
};

export default function FamilyTreeWrapper({ people = [] }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (people.length === 0) return;

        // Build spouse map for filtering
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

        const filteredPeople = people.filter(p =>
            (p.fid || p.mid || (spouseMap[p.id] && spouseMap[p.id].size > 0)) || referencedIds.has(p.id)
        );

        // Get custom layout
        const { positions } = getFamilyTreeLayout(filteredPeople);

        // Create nodes with positions
        const layoutedNodes = filteredPeople
            .filter(p => positions[p.id])
            .map((p) => ({
                id: p.id.toString(),
                type: 'custom',
                data: { label: p.name, gender: p.gender },
                position: positions[p.id],
                sourcePosition: 'bottom',
                targetPosition: 'top',
            }));

        // Create edges
        const renderEdges = [];

        filteredPeople.forEach((p) => {
            // Parent edges
            if (p.fid && positions[p.fid] && positions[p.id]) {
                renderEdges.push({
                    id: `e${p.fid}-${p.id}`,
                    source: p.fid.toString(),
                    target: p.id.toString(),
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#b1b1b7',
                    },
                });
            }
            if (p.mid && positions[p.mid] && positions[p.id]) {
                renderEdges.push({
                    id: `e${p.mid}-${p.id}`,
                    source: p.mid.toString(),
                    target: p.id.toString(),
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#b1b1b7',
                    },
                });
            }

            // Spouse edges (from sides)
            if (p.sid && p.id < p.sid && positions[p.id] && positions[p.sid]) {
                renderEdges.push({
                    id: `spouse-${p.id}-${p.sid}`,
                    source: p.id.toString(),
                    target: p.sid.toString(),
                    type: 'straight',
                    style: { stroke: '#ff0072', strokeWidth: 3, strokeDasharray: '5,5' },
                    animated: false,
                    sourceHandle: 'right',
                    targetHandle: 'left',
                });
            }
        });

        setNodes(layoutedNodes);
        setEdges(renderEdges);

    }, [people, setNodes, setEdges]);

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
