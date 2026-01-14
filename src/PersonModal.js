import React, { useState, useEffect } from "react";
import './index.css';

export default function PersonModal({ person, onClose, onSave, peopleList = [] }) {
    const [formData, setFormData] = useState({
        region: "",
        district: "",
        fidName: "",
        midNames: "",
        sidNames: "",
        is_educator: false,
        is_politician: false,
        is_entertainer: false,
        ent_position: "",
        academy_id: "",
        major_id: "",
        edu_role: "",
    });
    const [saving, setSaving] = useState(false);
    const [academies, setAcademies] = useState([]);
    const [allMajors, setAllMajors] = useState([]);
    const [availableMajors, setAvailableMajors] = useState([]);

    // Helpers for Name <-> ID resolution
    const getId = (name) => {
        const cleanName = name.trim().toLowerCase();
        // peopleList already contains the 'name' property
        const p = peopleList.find(p => (p.name || "").toLowerCase() === cleanName);
        return p ? p.id : null;
    };

    useEffect(() => {
        fetch("/.netlify/functions/academies").then(res => res.json()).then(data => setAcademies(data));
        fetch("/.netlify/functions/majors").then(res => res.json()).then(data => setAllMajors(data));
    }, []);

    useEffect(() => {
        if (person) {
            const getName = (id) => {
                const p = peopleList.find(p => p.id === id);
                return p ? p.name : id; // fallback to ID if not found
            };

            // Convert IDs to names for display
            const fidName = person.fid ? getName(person.fid) : "";

            const midArr = Array.isArray(person.mid) ? person.mid : (person.mid ? [person.mid] : []);
            const midNames = midArr.map(id => getName(id)).join(", ");

            const sidArr = Array.isArray(person.sid) ? person.sid : (person.sid ? [person.sid] : []);
            const sidNames = sidArr.map(id => getName(id)).join(", ");

            setFormData({
                region: person.Region || "",
                district: person.Location || "",
                fidName: fidName,
                midNames: midNames,
                sidNames: sidNames,
                is_educator: person.is_educator || false,
                is_politician: person.is_politician || false,
                is_entertainer: person.is_entertainer || false,
                ent_position: person.company?.position || "",
                academy_id: person.academy_id || "",
                major_id: person.major_id || "",
                edu_role: person.edu_role || "",
            });
        }
    }, [person, peopleList]);

    useEffect(() => {
        if (formData.academy_id) {
            setAvailableMajors(allMajors.filter(m => String(m.academy_id) === String(formData.academy_id)));
        } else {
            setAvailableMajors([]);
        }
    }, [formData.academy_id, allMajors]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Helper to parse comma-separated names to array of IDs
            const parseNamesToIds = (str) => {
                if (!str) return null;
                return str.split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                    .map(name => getId(name))
                    .filter(id => id !== null); // Filter out unresolved names
            };

            const fid = formData.fidName ? getId(formData.fidName) : null;
            const mid = parseNamesToIds(formData.midNames);
            const sid = parseNamesToIds(formData.sidNames);

            const payload = {
                id: person.id,
                region: formData.region,
                district: formData.district,
                fid: fid,
                mid: mid,
                sid: sid,
                is_educator: formData.is_educator,
                academy_id: formData.academy_id || null,
                major_id: formData.major_id || null,
                edu_role: formData.edu_role || null,
                is_politician: formData.is_politician,
                is_entertainer: formData.is_entertainer,
                entertainer_position: formData.ent_position,
            };

            const res = await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update");

            if (onSave) onSave(); // Callback to refresh data
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save changes. Ensure all names are correct.");
        } finally {
            setSaving(false);
        }
    };

    if (!person) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalBox" onClick={e => e.stopPropagation()}>
                <h3>Edit {person.name}</h3>

                <div className="form-group">
                    <label>Region</label>
                    <input name="region" value={formData.region} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>District</label>
                    <input name="district" value={formData.district} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Father (Name)</label>
                    <input name="fidName" value={formData.fidName} onChange={handleChange} placeholder="e.g. John Doe" />
                </div>

                <div className="form-group">
                    <label>Mother (Names, comma separated)</label>
                    <input name="midNames" value={formData.midNames} onChange={handleChange} placeholder="e.g. Jane Doe, Mary Smith" />
                </div>

                <div className="form-group">
                    <label>Spouse (Names, comma separated)</label>
                    <input name="sidNames" value={formData.sidNames} onChange={handleChange} placeholder="e.g. Partner Name" />
                </div>

                <div className="toggles">
                    <label>
                        <input type="checkbox" name="is_educator" checked={formData.is_educator} onChange={handleChange} />
                        Educator
                    </label>
                    {formData.is_educator && (
                        <div className="form-group sub-input" style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <div className="form-group">
                                <label>Academy</label>
                                <select name="academy_id" value={formData.academy_id} onChange={handleChange}>
                                    <option value="">Select Academy</option>
                                    {academies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Major/House</label>
                                <select name="major_id" value={formData.major_id} onChange={handleChange}>
                                    <option value="">Select Major</option>
                                    {availableMajors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Education Role</label>
                                <input name="edu_role" value={formData.edu_role} onChange={handleChange} placeholder="e.g. Student, Professor" />
                            </div>
                        </div>
                    )}
                    <label>
                        <input type="checkbox" name="is_politician" checked={formData.is_politician} onChange={handleChange} />
                        Politician
                    </label>
                    <label>
                        <input type="checkbox" name="is_entertainer" checked={formData.is_entertainer} onChange={handleChange} />
                        Entertainer
                    </label>
                    {formData.is_entertainer && (
                        <div className="form-group sub-input" style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <label>Role</label>
                            <input name="ent_position" value={formData.ent_position} onChange={handleChange} placeholder="e.g. Actor, Host" />
                        </div>
                    )}
                </div>

                <div className="actions">
                    <button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    <button onClick={onClose} disabled={saving}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
