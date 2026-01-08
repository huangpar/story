import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        const container = divRef.current;
        if (!container || people.length === 0) return;

        // Clear previous tree
        container.innerHTML = "";

        // Build spouse map (bidirectional)
        const spouseMap = {};
        people.forEach(p => {
            if (!spouseMap[p.id]) spouseMap[p.id] = new Set();
            if (p.sid) {
                spouseMap[p.id].add(p.sid);
                if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
                spouseMap[p.sid].add(p.id);
            }
        });

        // Find people who should be included (have family connections)
        const referencedIds = new Set();
        people.forEach(p => {
            if (p.fid) referencedIds.add(p.fid);
            if (p.mid) referencedIds.add(p.mid);
            if (spouseMap[p.id]?.size > 0) {
                spouseMap[p.id].forEach(sId => referencedIds.add(sId));
            }
        });

        // Filter and transform data for Balkan FamilyTree
        const nodes = people
            .filter(p => p.fid || p.mid || spouseMap[p.id]?.size > 0 || referencedIds.has(p.id))
            .map(p => ({
                id: p.id,
                fid: p.fid || null,
                mid: p.mid || null,
                pids: spouseMap[p.id]?.size > 0 ? Array.from(spouseMap[p.id]) : null,
                name: p.name,
                gender: p.gender?.toLowerCase()
            }));

        // Initialize Balkan FamilyTree
        new FamilyTree(container, {
            nodes: nodes,
            nodeBinding: {
                field_0: "name"
            },
            template: "hugo",
            enableSearch: false,
            mouseScrool: FamilyTree.action.zoom,
            siblingSeparation: 60,
            levelSeparation: 80,
            subTreeSeparation: 80
        });

        // Cleanup on unmount
        return () => {
            if (container) {
                container.innerHTML = "";
            }
        };
    }, [people]);

    return (
        <div
            id="tree"
            ref={divRef}
            style={{
                width: "100%",
                height: "800px",
                background: "#f0f0f0"
            }}
        />
    );
}
