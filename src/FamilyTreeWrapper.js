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
                if (p.fid) referencedIds.add(String(p.fid));
                if (p.mid) referencedIds.add(String(p.mid));
                if (p.sid) referencedIds.add(String(p.sid));
            });

            const nodes = people
                .filter(p => {
                    const id = String(p.id);
                    return p.fid || p.mid || p.sid || referencedIds.has(id);
                })
                .map(p => ({
                    id: String(p.id),
                    mid: p.mid ? String(p.mid) : null,
                    fid: p.fid ? String(p.fid) : null,
                    // Note: We omit pids to let the library infer partnerships 
                    // from biological children (mid/fid). This is necessary
                    // for parents who were never married or are separated.
                    name: p.name,
                    gender: p.gender ? p.gender.toLowerCase() : undefined
                }));

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
