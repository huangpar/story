import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './entertainers.css';

function CustomDropdown({ value, options, onChange, placeholder = "-- None --" }) {
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
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)}>
            <div className={`dropdown-header ${selected ? 'has-value' : ''}`}>
                <span>{selected ? selected.name : placeholder}</span>
                <ChevronDown size={16} className={`arrow ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleSelect(""); setIsOpen(false); }}>
                        <span className="gradient-text-item">{placeholder}</span>
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

export function Entertainers() {
    const [entertainers, setEntertainers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/.netlify/functions/people").then(res => res.json()),
            fetch("/.netlify/functions/companies").then(res => res.json()),
            fetch("/.netlify/functions/shows").then(res => res.json())
        ]).then(([peopleData, compData, showData]) => {
            // peopleData is now keyed by ID and contains 'name' inside
            const peopleArr = Object.values(peopleData);
            console.log("Entertainers Page Debug:", {
                peopleSample: peopleArr[0],
                showsSample: showData[0],
                debug: peopleData._debug
            });
            const ents = peopleArr.filter(p => p.is_entertainer);
            setEntertainers(ents);
            setCompanies(Array.isArray(compData) ? compData : []);
            setShows(Array.isArray(showData) ? showData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleUpdate = async (person, updates) => {
        // Optimistic update
        setEntertainers(prev => prev.map(p =>
            p.id === person.id ? { ...p, ...updates } : p
        ));

        // Prepare context for payload deriving from state
        const updatedPerson = { ...person, ...updates };

        const companyId = updates.company !== undefined
            ? (updates.company ? updates.company.id : null)
            : (person.company ? person.company.id : null);

        const position = updates.company !== undefined
            ? (updates.company ? updates.company.position : null)
            : (person.company ? person.company.position : null);

        const showAssignments = updates.shows !== undefined
            ? updates.shows.map(s => ({
                show_id: s.id,
                first_season: s.first_season,
                last_season: s.last_season,
                duration: s.duration
            }))
            : (person.shows ? person.shows.map(s => ({
                show_id: s.id,
                first_season: s.first_season,
                last_season: s.last_season,
                duration: s.duration
            })) : []);

        const finalPayload = {
            id: updatedPerson.id,
            name: updatedPerson.name,
            region: updatedPerson.Region,
            district: updatedPerson.Location,
            party: updatedPerson.Party,
            fid: updatedPerson.fid,
            mid: updatedPerson.mid,
            sid: updatedPerson.sid,
            is_educator: updatedPerson.is_educator,
            is_politician: updatedPerson.is_politician,
            is_entertainer: true,
            role_id: updatedPerson.role_id,
            entertainer_company_id: companyId,
            entertainer_position: position,
            show_assignments: showAssignments
        };

        try {
            const res = await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload)
            });
            if (!res.ok) throw new Error("Backend failed to save");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save changes. Please check your connection.");
        }
    };

    const handleCompanyChange = (person, companyId) => {
        const comp = companies.find(c => String(c.id) === String(companyId));
        handleUpdate(person, {
            company: comp ? { id: comp.id, name: comp.name, position: person.company?.position || "" } : null
        });
    };

    const handlePositionChange = (person, newPos) => {
        handleUpdate(person, {
            company: person.company ? { ...person.company, position: newPos } : { id: null, name: "", position: newPos }
        });
    };

    const toggleShow = (person, showId) => {
        const currentShows = person.shows || [];
        const exists = currentShows.find(s => s.id === showId);
        let newShows;
        if (exists) {
            newShows = currentShows.filter(s => s.id !== showId);
        } else {
            const showToAdd = shows.find(s => s.id === showId);
            newShows = [...currentShows, { ...showToAdd }];
        }
        handleUpdate(person, { shows: newShows });
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="entertainers-page">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
            </h1>

            <div className="entertainers-container">
                <div className="head">
                    <Link to="/entertainment"><span className="storiaTitle">Entertainers</span></Link>
                </div>
                {entertainers.map(p => (
                    <div key={p.id} className="entertainer-card">
                        <div className="ent-info">
                            <h3>{p.name}</h3>
                            <p>{p.Region} - {p.Location}</p>
                        </div>

                        <div className="ent-controls">
                            <div className="ent-section">
                                <label>Studio & Position</label>
                                <div className="ent-input-group">
                                    <CustomDropdown
                                        value={p.company?.id}
                                        options={companies}
                                        onChange={(val) => handleCompanyChange(p, val)}
                                        placeholder="-- No Studio --"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Position (e.g. Lead Actor)"
                                        value={p.company?.position || ""}
                                        onChange={(e) => handlePositionChange(p, e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="ent-section">
                                <label>Productions</label>
                                <div className="shows-list">
                                    {shows.map(s => {
                                        const isCast = p.shows?.some(ps => String(ps.id) === String(s.id));
                                        return (
                                            <div key={s.id}
                                                className={`show-chip ${isCast ? 'active' : ''}`}
                                                onClick={() => toggleShow(p, s.id)}
                                            >
                                                {s.name}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
