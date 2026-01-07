import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import './entertainers.css';

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
            const peopleArr = Object.values(peopleData).map(p => ({ ...p, name: p.name || Object.keys(peopleData).find(key => peopleData[key] === p) }));
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

        // Prepare payload
        // We need existing object + updates
        const updatedPerson = { ...person, ...updates };

        const payload = {
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
            is_entertainer: true, // ensure stays entertainer
            role_id: updatedPerson.role_id,
            entertainer_company_id: updatedPerson.company ? updatedPerson.company.id : null,
            entertainer_position: updatedPerson.company ? updatedPerson.company.position : null,
            show_assignments: updatedPerson.shows ? updatedPerson.shows.map(s => ({ show_id: s.id, ...s })) : []
        };

        // Fix up payload if "updates" contained simplified "companyId" vs nested company object
        // My handleUpdate calls below will likely pass specific fields.
        // Let's refine handleUpdate to take key/value or just the new state.

        // Actually, let's derive payload from the merged state.
        // If updates changed company.id, we need to reflect that in entertainer_company_id.

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
            ...payload,
            entertainer_company_id: companyId,
            entertainer_position: position,
            show_assignments: showAssignments
        };

        try {
            await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload)
            });
        } catch (error) {
            console.error(error);
            alert("Failed to save");
        }
    };

    const handleCompanyChange = (person, companyId) => {
        const comp = companies.find(c => c.id === parseInt(companyId));
        handleUpdate(person, {
            company: comp ? { ...comp, position: person.company?.position || "" } : null
        });
    };

    const handlePositionChange = (person, newPos) => {
        handleUpdate(person, {
            company: { ...person.company, position: newPos, id: person.company?.id }
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
            newShows = [...currentShows, { ...showToAdd }]; // Default seasons null
        }
        handleUpdate(person, { shows: newShows });
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="entertainers-page">
            <header className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">Entertainers</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
            </header>

            <div className="container">
                {entertainers.map(p => (
                    <div key={p.id} className="entertainer-card">
                        <div className="ent-header">
                            <h3>{p.name}</h3>
                            <span>{p.Region}</span>
                        </div>

                        <div className="ent-company">
                            <label>Company</label>
                            <select
                                value={p.company?.id || ""}
                                onChange={(e) => handleCompanyChange(p, e.target.value)}
                            >
                                <option value="">-- None --</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Position"
                                value={p.company?.position || ""}
                                onChange={(e) => handlePositionChange(p, e.target.value)}
                            />
                        </div>

                        <div className="ent-shows">
                            <label>Shows</label>
                            <div className="shows-list">
                                {shows.map(s => {
                                    const isCast = p.shows?.some(ps => ps.id === s.id);
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
                ))}
            </div>
        </div>
    )
}
