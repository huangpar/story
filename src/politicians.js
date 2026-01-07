import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './politicians.css';

function CustomDropdown({ value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selected = options.find(o => String(o.id) === String(value));

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleSelect = (val) => {
        onChange(val);
        // setIsOpen(false); // Optional: keep open or close? Standard is close.
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)}>
            <div className={`dropdown-header ${selected ? 'has-value' : ''}`}>
                <span>{selected ? selected.name : "-- None --"}</span>
                <ChevronDown size={16} className={`arrow ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleSelect(""); setIsOpen(false); }}>
                        <span className="gradient-text-item">-- None --</span>
                    </div>
                    {options.map(opt => (
                        <div key={opt.id} className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleSelect(opt.id); setIsOpen(false); }}>
                            <span className="gradient-text-item">{opt.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function Politicians() {
    const [politicians, setPoliticians] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/.netlify/functions/people").then(res => res.json()),
            fetch("/.netlify/functions/roles").then(res => res.json())
        ]).then(([peopleData, rolesData]) => {
            // peopleData is keyed by name, convert to array
            const peopleArr = Object.values(peopleData).map(p => ({ ...p, name: p.name || Object.keys(peopleData).find(key => peopleData[key] === p) }));
            const pols = peopleArr.filter(p => p.is_politician);

            setPoliticians(pols);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleRoleChange = async (person, newRoleId) => {
        const roleId = newRoleId ? parseInt(newRoleId) : null;

        // Optimistic update
        setPoliticians(prev => prev.map(p =>
            p.id === person.id ? { ...p, role_id: roleId } : p
        ));

        try {
            // Need to send all person data back for PUT, or at least required fields + role update
            // Our PUT handler expects id, region, district... basically everything to update the row.
            // Let's construct the payload carefully.
            const payload = {
                id: person.id,
                name: person.name,
                region: person.Region,
                district: person.Location,
                party: person.Party,
                fid: person.fid,
                mid: person.mid,
                sid: person.sid,
                is_educator: person.is_educator,
                is_politician: true, // ensure stays politician
                is_entertainer: person.is_entertainer,
                role_id: roleId
            };

            const res = await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save role");
            // console.log("Saved role");

        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to update role");
            // Revert? For now, just alert.
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="politicians-page">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
            </h1>

            <div className="politicians-container">
                <div className="head">
                    <Link to="/politics"><span className="politicsTitle">Politicians</span></Link>
                </div>
                {politicians.map(p => (
                    <div key={p.id} className="politician-card">
                        <div className="pol-info">
                            <h3>{p.name}</h3>
                            <p>{p.Party} | {p.Region} - {p.Location}</p>
                        </div>
                        <div className="pol-role">
                            <label>Role:</label>
                            <CustomDropdown
                                value={p.role_id}
                                options={roles}
                                onChange={(val) => handleRoleChange(p, val)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
