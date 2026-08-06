import React, { useState, useEffect } from "react";
import { X } from 'lucide-react';
import { api } from './api';
import './index.css';

export default function PersonModal({ person, onClose, onSave, peopleList = [] }) {
    const [formData, setFormData] = useState({
        region: "",
        district: "",
        party: "",
        fidName: "",
        midNames: "",
        sidNames: "",
        is_educator: false,
        is_politician: false,
        is_entertainer: false,
        ent_position: "",
        school_id: "",
        edu_position: "",
        edu_subjects: [],
    });
    const [saving, setSaving] = useState(false);
    const [schools, setSchools] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Helpers for Name <-> ID resolution
    const getId = (name) => {
        const cleanName = name.trim().toLowerCase();
        // peopleList already contains the 'name' property
        const p = peopleList.find(p => (p.name || "").toLowerCase() === cleanName);
        return p ? p.id : null;
    };

    useEffect(() => {
        api.getSchools().then(data => setSchools(data));
        api.getSubjects().then(data => setSubjects(data));
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
                party: person.Party || person.party || "",
                fidName: fidName,
                midNames: midNames,
                sidNames: sidNames,
                is_educator: person.is_educator || false,
                is_politician: person.is_politician || false,
                is_entertainer: person.is_entertainer || false,
                ent_position: person.company?.position || "",
                school_id: person.schools?.[0]?.id || "",
                edu_position: person.schools?.[0]?.position || "",
                edu_subjects: person.schools?.[0]?.subjects?.map(s => s.id) || [],
            });
        }
    }, [person, peopleList]);


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
                const names = str.split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                
                const ids = names.map(name => getId(name));
                const unresolved = names.filter((name, idx) => ids[idx] === null);
                
                if (unresolved.length > 0) {
                    throw new Error(`Could not find person(s): ${unresolved.join(', ')}`);
                }
                
                return ids.length > 0 ? ids : null;
            };

            const fid = formData.fidName ? getId(formData.fidName) : null;
            if (formData.fidName && fid === null) {
                throw new Error(`Could not find person: ${formData.fidName}`);
            }

            const mid = parseNamesToIds(formData.midNames);
            const sid = parseNamesToIds(formData.sidNames);

            // Build education_assignments array in the format backend expects
            const education_assignments = formData.is_educator && formData.school_id ? [{
                school_id: parseInt(formData.school_id),
                position: formData.edu_position || null,
                subjects: Array.isArray(formData.edu_subjects) ? formData.edu_subjects.map(s => parseInt(s)).filter(id => !isNaN(id)) : [],
                schedules: [] // PersonModal doesn't currently support schedules
            }] : [];

            const payload = {
                id: person.id,
                region: formData.region,
                district: formData.district,
                party: formData.party,
                fid: fid,
                mid: mid,
                sid: sid,
                is_educator: formData.is_educator,
                education_assignments: education_assignments,
                is_politician: formData.is_politician,
                is_entertainer: formData.is_entertainer,
                entertainer_position: formData.ent_position || null,
            };

            const res = await api.updatePerson(person.id, payload);

            if (res && res.error) {
                throw new Error(res.error || `Failed to update person`);
            }

            if (onSave) onSave(); // Callback to refresh data
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            alert(error.message || "Failed to save changes. Ensure all names are correct.");
        } finally {
            setSaving(false);
        }
    };

    if (!person) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalBox" onClick={e => e.stopPropagation()}>
                <button className="modalClose" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>


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
                    <label>Party</label>
                    <input name="party" value={formData.party} onChange={handleChange} />
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
                                <label>School</label>
                                <select name="school_id" value={formData.school_id} onChange={handleChange}>
                                    <option value="">Select School</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input name="edu_position" value={formData.edu_position} onChange={handleChange} placeholder="e.g. Professor, Dean" />
                            </div>
                            <div className="form-group">
                                <label>Subjects (Hold Ctrl to select multiple)</label>
                                <select
                                    multiple
                                    name="edu_subjects"
                                    value={formData.edu_subjects}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData(prev => ({ ...prev, edu_subjects: values }));
                                    }}
                                    style={{ height: '100px' }}
                                >
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
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
