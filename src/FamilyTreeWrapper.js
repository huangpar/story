import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

// Define Custom Templates Globally
const initTemplates = () => {
    // Check if 'tom' exists, otherwise fallback to 'base'
    const baseTemplate = FamilyTree.templates.tom ? FamilyTree.templates.tom : FamilyTree.templates.base;

    // Define explicit templates (no auto-suffix reliance)
    if (!FamilyTree.templates.male_gradient) {
        FamilyTree.templates.male_gradient = Object.assign({}, baseTemplate);
        FamilyTree.templates.male_gradient.size = [250, 100];
        FamilyTree.templates.male_gradient.defs = `
            <linearGradient id="gradient_male" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00E3AE" />
                <stop offset="100%" stop-color="#0097E6" />
            </linearGradient>
        `;
        FamilyTree.templates.male_gradient.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_male)" rx="15" ry="15"></rect>';
        FamilyTree.templates.male_gradient.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';
    }

    if (!FamilyTree.templates.female_gradient) {
        FamilyTree.templates.female_gradient = Object.assign({}, baseTemplate);
        FamilyTree.templates.female_gradient.size = [250, 100];
        FamilyTree.templates.female_gradient.defs = `
            <linearGradient id="gradient_female" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF9F43" />
                <stop offset="100%" stop-color="#FF6B6B" />
            </linearGradient>
        `;
        FamilyTree.templates.female_gradient.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_female)" rx="15" ry="15"></rect>';
        FamilyTree.templates.female_gradient.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';
    }
};

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            initTemplates();
            divRef.current.innerHTML = "";

            // 1. Calculate Spouse Map (Bidirectional)
            const spouseMap = {};
            people.forEach(p => {
                if (!spouseMap[p.id]) spouseMap[p.id] = new Set();
                if (p.sid) {
                    spouseMap[p.id].add(p.sid);
                    if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
                    spouseMap[p.sid].add(p.id);
                }
            });

            // 2. Identify referenced IDs
            const referencedIds = new Set();
            people.forEach(p => {
                if (p.fid) referencedIds.add(p.fid);
                if (p.mid) referencedIds.add(p.mid);
                if (spouseMap[p.id] && spouseMap[p.id].size > 0) {
                    spouseMap[p.id].forEach(sId => referencedIds.add(sId));
                }
            });

            // 3. Filter and Map Nodes
            const nodes = people
                .filter(p => (p.fid || p.mid || (spouseMap[p.id] && spouseMap[p.id].size > 0)) || referencedIds.has(p.id))
                .map(p => {
                    // Explicitly select template based on gender
                    const templateName = (p.gender && p.gender.toLowerCase() === 'female') ? 'female_gradient' : 'male_gradient';

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
                        gender: p.gender ? p.gender.toLowerCase() : undefined,
                        template: templateName // Explicit assignment
                    };
                });

            // Initialize tree
            new FamilyTree(divRef.current, {
                nodes: nodes,
                nodeBinding: {
                    field_0: "name"
                },
                template: "hugo", // Default fallback if node.template is missing
                enableSearch: false,
                mouseScrool: FamilyTree.action.zoom,
                siblingSeparation: 60,
                levelSeparation: 80,
                subTreeSeparation: 80
            });
        }
    }, [people]);

    return <div id="tree" ref={divRef} style={{ width: "100%", height: "800px", background: "#f0f0f0" }}></div>;
}
