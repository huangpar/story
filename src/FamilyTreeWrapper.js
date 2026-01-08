import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            // Transform data for Balkan FamilyTree
            const nodes = people.map(p => ({
                id: p.id,
                mid: p.mid || null,
                fid: p.fid || null,
                pids: p.sid ? [p.sid] : null,
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
