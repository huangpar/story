import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.innerHTML = "";

            // Calculate Spouse Map (Bidirectional)
            const spouseMap = {};
            people.forEach(p => {
                if (!spouseMap[p.id]) spouseMap[p.id] = new Set();
                if (p.sid) {
                    spouseMap[p.id].add(p.sid);
                    if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
                    spouseMap[p.sid].add(p.id);
                }
            });

            // Identify referenced IDs
            const referencedIds = new Set();
            people.forEach(p => {
                if (p.fid) referencedIds.add(p.fid);
                if (p.mid) referencedIds.add(p.mid);
                if (spouseMap[p.id] && spouseMap[p.id].size > 0) {
                    spouseMap[p.id].forEach(sId => referencedIds.add(sId));
                }
            });

            // Filter and Map Nodes
            const nodes = people
                .filter(p => (p.fid || p.mid || (spouseMap[p.id] && spouseMap[p.id].size > 0)) || referencedIds.has(p.id))
                .map(p => {
                    let pids = null;
                    if (spouseMap[p.id] && spouseMap[p.id].size > 0) {
                        pids = Array.from(spouseMap[p.id]);
                    }

                    return {
                        id: p.id,
                        mid: p.mid || null,
                        fid: p.fid || null,
                        pids: pids,
                        name: p.name,
                        gender: p.gender ? p.gender.toLowerCase() : undefined
                    };
                });

            // Initialize tree
            const tree = new FamilyTree(divRef.current, {
                nodes: nodes,
                nodeBinding: {
                    field_0: "name"
                },
                template: "hugo",
                enableSearch: false,
                mouseScrool: FamilyTree.action.zoom,
                siblingSeparation: 60,
                levelSeparation: 80,
                subTreeSeparation: 80,
                nodeMenu: {
                    details: { text: "Details" },
                    edit: { text: "Edit" },
                    add: { text: "Add" },
                    remove: { text: "Remove" }
                },
                menu: {
                    pdf: { text: "Export PDF" },
                    png: { text: "Export PNG" },
                    svg: { text: "Export SVG" }
                }
            });

            // Return cleanup function
            return () => {
                if (divRef.current) {
                    divRef.current.innerHTML = "";
                }
            };
        }
    }, [people]);

    return <div id="tree" ref={divRef} style={{ width: "100%", height: "800px", background: "#f0f0f0" }}></div>;
}
