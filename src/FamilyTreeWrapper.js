import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            // Define Custom Templates
            FamilyTree.templates.base_gradient = Object.assign({}, FamilyTree.templates.base);
            FamilyTree.templates.base_gradient.size = [250, 100];
            FamilyTree.templates.base_gradient.defs = `
                <linearGradient id="gradient_female" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FF9F43" />
                    <stop offset="100%" stop-color="#FF6B6B" />
                </linearGradient>
                <linearGradient id="gradient_male" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00E3AE" />
                    <stop offset="100%" stop-color="#0097E6" />
                </linearGradient>
            `;

            FamilyTree.templates.male_gradient = Object.assign({}, FamilyTree.templates.base_gradient);
            FamilyTree.templates.male_gradient.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_male)" rx="15" ry="15"></rect>';
            FamilyTree.templates.male_gradient.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';

            FamilyTree.templates.female_gradient = Object.assign({}, FamilyTree.templates.base_gradient);
            FamilyTree.templates.female_gradient.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_female)" rx="15" ry="15"></rect>';
            FamilyTree.templates.female_gradient.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';

            // Transform data for Balkan FamilyTree
            // First, identify all IDs that are referenced as parent or spouse
            const referencedIds = new Set();
            people.forEach(p => {
                if (p.fid) referencedIds.add(p.fid);
                if (p.mid) referencedIds.add(p.mid);
                if (p.sid) referencedIds.add(p.sid);
            });

            // Filter out people who (have no connections UP/ACROSS) AND (are not referenced DOWN/ACROSS)
            // i.e. Keep if (has fid OR mid OR sid) OR (is referenced by someone else)
            const nodes = people
                .filter(p => (p.fid || p.mid || p.sid) || referencedIds.has(p.id))
                .map(p => ({
                    id: p.id,
                    mid: p.mid || null,
                    fid: p.fid || null,
                    pids: p.sid ? [p.sid] : null,
                    name: p.name,
                    gender: p.gender ? p.gender.toLowerCase() : undefined,
                    template: (p.gender && p.gender.toLowerCase() === 'female') ? 'female_gradient' : 'male_gradient'
                }));

            // Initialize tree
            new FamilyTree(divRef.current, {
                nodes: nodes,
                nodeBinding: {
                    field_0: "name"
                },
                template: "john", // Use a nice template
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
