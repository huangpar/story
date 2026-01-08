import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            // Transform data for Balkan FamilyTree
            // Filter out people with no family relationships
            // But keep people who are referenced as parents or spouses by others
            const referencedIds = new Set();
            people.forEach(p => {
                if (p.fid) referencedIds.add(p.fid);
                if (p.mid) referencedIds.add(p.mid);
                if (p.sid) referencedIds.add(p.sid);
            });

            console.log('Total people received:', people.length);
            console.log('Referenced IDs:', Array.from(referencedIds));

            const nodes = people
                .filter(p => {
                    const included = p.fid || p.mid || p.sid || referencedIds.has(p.id);
                    if (!included) {
                        console.log('Filtered out:', p.name, { fid: p.fid, mid: p.mid, sid: p.sid, id: p.id });
                    }
                    return included;
                })
                .map(p => ({
                    id: p.id,
                    mid: p.mid || null,
                    fid: p.fid || null,
                    pids: p.sid ? [p.sid] : null,
                    name: p.name,
                    gender: p.gender ? p.gender.toLowerCase() : undefined
                }));

            console.log('Nodes after filtering:', nodes.length);
            console.log('Filtered nodes:', nodes);

            // Initialize tree
            new FamilyTree(divRef.current, {
                nodes: nodes,
                nodeBinding: {
                    field_0: "name"
                },
                template: "hugo", // Use a nice template
                enableSearch: false,
                mouseScrool: FamilyTree.action.zoom,
                minPartnerSeparation: 100,
                levelSeparation: 300,
                siblingSeparation: 400,
                // menu: {
                //     pdf: { text: "Export PDF" },
                //     png: { text: "Export PNG" },
                //     svg: { text: "Export SVG" },
                //     csv: { text: "Export CSV" }
                // }
            });
        }
    }, [people]);

    return <div id="tree" ref={divRef} style={{ width: "100%", height: "800px", background: "#f0f0f0" }}></div>;
}
