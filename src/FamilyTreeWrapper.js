import React, { useEffect, useRef } from 'react';
import FamilyTree from "@balkangraph/familytree.js";

// Define Custom Templates Globally
// Creating a function to init templates to ensure FamilyTree is loaded
const initTemplates = () => {
    if (FamilyTree.templates.base_gradient) return; // Already init

    FamilyTree.templates.base_gradient = Object.assign({}, FamilyTree.templates.tom);
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

    FamilyTree.templates.gradient_male = Object.assign({}, FamilyTree.templates.base_gradient);
    FamilyTree.templates.gradient_male.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_male)" rx="15" ry="15"></rect>';
    FamilyTree.templates.gradient_male.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';

    FamilyTree.templates.gradient_female = Object.assign({}, FamilyTree.templates.base_gradient);
    FamilyTree.templates.gradient_female.node = '<rect x="0" y="0" height="100" width="250" fill="url(#gradient_female)" rx="15" ry="15"></rect>';
    FamilyTree.templates.gradient_female.field_0 = '<text data-width="230" x="125" y="55" text-anchor="middle" class="field_0" fill="#ffffff" style="font-size: 20px; font-weight: bold; font-family: Inter, sans-serif;">{val}</text>';
};

export default function FamilyTreeWrapper({ people = [] }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            // Ensure templates are initialized
            initTemplates();

            // Clear previous tree if any
            divRef.current.innerHTML = "";

            // 1. Calculate Spouse Map (Bidirectional)
            // If A says B is spouse, or B says A is spouse -> link them
            const spouseMap = {}; // id -> Set of spouse IDs

            people.forEach(p => {
                if (!spouseMap[p.id]) spouseMap[p.id] = new Set();

                // If this person declares a spouse (sid), link them
                if (p.sid) {
                    spouseMap[p.id].add(p.sid); // I am spouse to my sid

                    // Also link reverse: my sid should know I am their spouse
                    if (!spouseMap[p.sid]) spouseMap[p.sid] = new Set();
                    spouseMap[p.sid].add(p.id);
                }
            });

            // 2. Identify referenced IDs for filtering (Parents or Spouses)
            const referencedIds = new Set();
            people.forEach(p => {
                if (p.fid) referencedIds.add(p.fid);
                if (p.mid) referencedIds.add(p.mid);
                // Spouses are implicitly referenced if they exist in spouseMap
                if (spouseMap[p.id] && spouseMap[p.id].size > 0) {
                    spouseMap[p.id].forEach(sId => referencedIds.add(sId));
                }
            });

            // 3. Filter and Map Nodes
            const nodes = people
                .filter(p => (p.fid || p.mid || (spouseMap[p.id] && spouseMap[p.id].size > 0)) || referencedIds.has(p.id))
                .map(p => {
                    // Get spouses array
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
                        // No explicit template set, rely on default 'gradient' + gender logic
                    };
                });

            // Initialize tree
            new FamilyTree(divRef.current, {
                nodes: nodes,
                nodeBinding: {
                    field_0: "name"
                },
                template: "gradient", // Use the base name, library appends _male/_female
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
