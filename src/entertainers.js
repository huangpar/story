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

        const studioAssignments = updates.studios !== undefined
            ? updates.studios.map(s => ({
                company_id: s.id,
                position: s.position
            }))
            : (person.studios ? person.studios.map(s => ({
                company_id: s.id,
                position: s.position
            })) : []);

        const showAssignments = updates.shows !== undefined
            ? updates.shows.map(s => ({
                show_id: s.id,
                first_season: s.first_season,
                last_season: s.last_season,
                duration: s.duration,
                role: s.role
            }))
            : (person.shows ? person.shows.map(s => ({
                show_id: s.id,
                first_season: s.first_season,
                last_season: s.last_season,
                duration: s.duration,
                role: s.role
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
            studio_assignments: studioAssignments,
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

    const addStudio = (person) => {
        const currentStudios = person.studios || [];
        // Default to the first available company not already assigned, if possible
        const available = companies.find(c => !currentStudios.some(s => String(s.id) === String(c.id)));
        const newStudios = [...currentStudios, { id: available?.id || "", name: available?.name || "", position: "" }];
        handleUpdate(person, { studios: newStudios });
    };

    const removeStudio = (person, studioId) => {
        const newStudios = (person.studios || []).filter(s => String(s.id) !== String(studioId));
        handleUpdate(person, { studios: newStudios });
    };

    const handleStudioChange = (person, oldStudioId, newStudioId) => {
        const comp = companies.find(c => String(c.id) === String(newStudioId));
        const newStudios = (person.studios || []).map(s =>
            String(s.id) === String(oldStudioId) ? { ...s, id: comp?.id, name: comp?.name } : s
        );
        handleUpdate(person, { studios: newStudios });
    };

    const handlePositionChange = (person, studioId, newPos) => {
        const newStudios = (person.studios || []).map(s =>
            String(s.id) === String(studioId) ? { ...s, position: newPos } : s
        );
        handleUpdate(person, { studios: newStudios });
    };

    const toggleShow = (person, showId) => {
        const currentShows = person.shows || [];
        const sameShowAssignments = currentShows.filter(s => String(s.id) === String(showId));

        let newShows;
        if (sameShowAssignments.length > 0) {
            // If it exists, we remove ALL ranges for this show when clicking the chip
            // This is consistent with previous "toggle" behavior
            newShows = currentShows.filter(s => String(s.id) !== String(showId));
        } else {
            // Add a fresh assignment for this show
            const showToAdd = shows.find(s => String(s.id) === String(showId));
            newShows = [...currentShows, { ...showToAdd, first_season: 1, last_season: 1, role: "" }];
        }
        handleUpdate(person, { shows: newShows });
    };

    const addShowRange = (person, showId) => {
        const currentShows = person.shows || [];
        const showToAdd = shows.find(s => String(s.id) === String(showId));
        const newShows = [...currentShows, { ...showToAdd, first_season: null, last_season: null, role: "" }];
        handleUpdate(person, { shows: newShows });
    };

    const removeShowRange = (person, showId, firstSeason) => {
        const currentShows = person.shows || [];
        // Find the specific assignment and remove it
        const newShows = currentShows.filter(s => !(String(s.id) === String(showId) && s.first_season === firstSeason));
        handleUpdate(person, { shows: newShows });
    };

    const handleShowRangeChange = (person, showId, oldFirstSeason, field, val) => {
        const currentShows = person.shows || [];
        const newShows = currentShows.map(s => {
            if (String(s.id) === String(showId) && s.first_season === oldFirstSeason) {
                // Parse numbers for season fields, keep string for role
                const finalVal = (field === 'first_season' || field === 'last_season')
                    ? (val === "" ? null : parseInt(val))
                    : val;
                return { ...s, [field]: finalVal };
            }
            return s;
        });
        handleUpdate(person, { shows: newShows });
    };

    const clearShows = (person) => {
        handleUpdate(person, { shows: [] });
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
                            <div className="ent-studios-list">
                                {(p.studios || []).map((studio, idx) => (
                                    <div key={idx} className="ent-input-group studio-row">
                                        <CustomDropdown
                                            value={studio.id}
                                            options={companies}
                                            onChange={(val) => handleStudioChange(p, studio.id, val)}
                                            placeholder="-- Select Studio --"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Position (e.g. Lead Actor)"
                                            value={studio.position || ""}
                                            onChange={(e) => handlePositionChange(p, studio.id, e.target.value)}
                                        />
                                        <button className="remove-studio" onClick={() => removeStudio(p, studio.id)} title="Remove Studio">×</button>
                                    </div>
                                ))}
                                <button className="add-studio-btn" onClick={() => addStudio(p)}>+ Add Studio</button>
                            </div>
                        </div>

                        <div className="ent-section">
                            <div className="section-header">
                                <label>Productions</label>
                                {(p.shows || []).length > 0 && (
                                    <span className="clear-shows" onClick={() => clearShows(p)}>Clear All</span>
                                )}
                            </div>
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

                            {(p.shows || []).length > 0 && (
                                <div className="show-ranges-editor">
                                    {/* Group by show to make it cleaner */}
                                    {Array.from(new Set(p.shows.map(s => s.id))).map(showId => {
                                        const show = shows.find(s => String(s.id) === String(showId));
                                        const assignments = p.shows.filter(ps => String(ps.id) === String(showId));
                                        return (
                                            <div key={showId} className="show-range-group">
                                                <div className="show-range-header">
                                                    <h4>{show?.name}</h4>
                                                    <button className="add-range-btn" onClick={() => addShowRange(p, showId)}>+ Add Range</button>
                                                </div>
                                                {assignments.map((asgn, idx) => (
                                                    <div key={idx} className="range-row">
                                                        <div className="range-inputs">
                                                            <div className="input-with-label">
                                                                <span>S</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Start"
                                                                    value={asgn.first_season || ""}
                                                                    onChange={(e) => handleShowRangeChange(p, showId, asgn.first_season, 'first_season', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="input-with-label">
                                                                <span>E</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="End"
                                                                    value={asgn.last_season || ""}
                                                                    onChange={(e) => handleShowRangeChange(p, showId, asgn.first_season, 'last_season', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="input-with-label role-input">
                                                                <span>Role</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Host"
                                                                    value={asgn.role || ""}
                                                                    onChange={(e) => handleShowRangeChange(p, showId, asgn.first_season, 'role', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button className="remove-range" onClick={() => removeShowRange(p, showId, asgn.first_season)}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
